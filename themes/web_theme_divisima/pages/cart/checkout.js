import React from 'react';
import axios from 'axios';
import {
    NSContext, NSToast, getCart, getLangPrefix, jwtManager, imgDefaultBase64, cartToOrder, deferredPaymentOrder, getShipmentsCart, getTerritories, getUser, immediatePaymentOrder, updateAddressesCart, updateDeliveryCart
} from 'aqlrc';
import Head from 'next/head';
import Address from '../../components/Address';
import Layout from '../../components/Layout';
import getAPIUrl from '../../lib/getAPIUrl';
import { withI18next } from '../../lib/withI18n';
import { Link, Router } from '../../routes';
import nsModules from '../../modules/list_modules';

/**
 * CartCheckout - Tunnel de commande regroupant adresse, livraison et paiement
 * @return {React.Component}
 */

class CartCheckout extends React.Component {
    static getInitialProps = async function (ctx) {
        const { cmsBlocks, lang } = ctx.nsGlobals;
        const PostBody = { filter: { type: 'country' }, limit: 99 };
        const countries = await getTerritories(lang, PostBody, ctx);
        const selectedCountry = countries.datas.find((country) => country.code.toLowerCase() === lang.toLowerCase());
        
        return {
            countries: countries.datas,
            countryCode: selectedCountry && selectedCountry.code ? selectedCountry.code : 'FR',
            userRequired: { url: '/cart/login', route: 'cartLogin' },
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props,
            cart     : null,
            editAddress : false,
            isRelayPoint: false,
            relayPointAddressSaved : false,
            shipmentIndex : -1,
            shipments : [],
            shipmentPrice : 0,
            paymentMethods : [],
            paymentForm    : null,
            step : 1,
            taxDisplay : 'ati',
        };
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/cart/checkout`;
    }

    componentDidMount = async () => {
        const { countryCode, lang, routerLang } = this.props;
        const { taxDisplay } = this.state;
        const cartId = window.localStorage.getItem('cart_id');
        if (!cartId) {
            return Router.pushRoute('cart', { lang: routerLang });
        }

        try {
            // Récupération du panier
            let PostBody = { populate: ['items.id'] };
            const cart = await getCart(cartId, lang, PostBody);

            let shipmentId;
            // Si le mode de livraison a déjà été sélectionné, on le prend pour l'estimation des FDP
            if (cart.delivery && cart.delivery.method) {
                shipmentId = cart.delivery.method;
            }

            // Si l'adresse de livraison a été confirmée, on met le pays de l'adresse de livraison pour l'estimation des FDP
            if (cart.address && cart.address.delivery && cart.address.delivery.isoCountryCode) {
                countryCode = cart.address.delivery.isoCountryCode;
            }
            
            // Récupération de l'estimation des FDP
            PostBody = {
                limit: 1
            };
            const resShipmentsFee = await getShipmentsCart({ _id: cartId }, countryCode, lang, PostBody);

            this.setState({
                cart,
                shipmentPrice : resShipmentsFee.price
            });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
            return setTimeout(() => {
                Router.pushRoute('cart', { lang: routerLang });
            }, 5000);
        }

        // Lorsque un point relais est saisi
        document.addEventListener('relayPointAddressSaved', (e) => {
            if (!this.state.isRelayPoint) {
                return;
            }
            // true ou false
            this.setState({ relayPointAddressSaved: e.detail });
        });
    }

    handleEditAddress = (bool) => {
        this.setState({ editAddress: bool })
    }

    validateAddress = async () => {
        let { lang, user } = this.props;
        let { cart } = this.state;
        const cartId = window.localStorage.getItem('cart_id');
        try {
            const PostBody = {
                structure : {
                    addresses: 1,
                    delivery_address: 1,
                    billing_address: 1
                }
            };
            user = await getUser(user._id, PostBody);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
        if (user && user.addresses.length < 1) {
            return NSToast.error('addresses:error_msg.at_least_one_address');
        }
        const addresses = {
            billing  : user.addresses[user.billing_address],
            delivery : cart.orderReceipt.method === 'delivery' ? user.addresses[user.delivery_address] : cart.addresses.delivery
        };
        
        try {
            // Modification des adresses du panier
            cart = await updateAddressesCart(cartId, addresses);

            // Récupération des modes de livraison
            const PostBody = {
                limit     : 999999,
                structure : {
                    component_template_front : 1,
                    config                   : 1
                }
            };
            const shipments = await getShipmentsCart(cart, null, lang, PostBody);

            this.setState({
                cart,
                shipmentIndex : shipments.datas.findIndex((ship) => ship._id === cart.delivery.method),
                shipments     : shipments.datas,
                step: 2
            }, document.querySelector('.step1').scrollIntoView());
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    }

    validateDelivery = async () => {
        const {
            lang, cart, isRelayPoint, relayPointAddressSaved, shipmentIndex, shipments
        } = this.state;
        const cartId = window.localStorage.getItem('cart_id');

        if (shipmentIndex === -1) {
            return NSToast.warn('delivery:choose_delivery_mode');
        }

        // Un point relais a été selectionné mais aucune addresse n'a été sauvegardé
        if (isRelayPoint && !relayPointAddressSaved) {
            return NSToast.warn('delivery:choose_relay_point');
        }
        try {
            const newCart = await updateDeliveryCart(cartId, shipments[shipmentIndex], cart.addresses.delivery.isoCountryCode, lang);  

            // Récupération des modes de paiement
            const paymentMethods = await axios.post(`${getAPIUrl()}v2/paymentMethods`, {
                lang,
                PostBody : {
                    filter    : { active: true },
                    structure : { component_template_front: 1, makePayment: 1, details: 1 },
                    limit     : 100
                }
            });

            this.setState({
                cart: newCart,
                shipmentPrice: shipments[shipmentIndex].price,
                paymentMethods: paymentMethods.data.datas,
                step: 3,
            }, document.querySelector('.step1').scrollIntoView());
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    }

    displayFrontModule = (ship, index) => {
        const Comp = nsModules.find((module) => module.code === ship.component_template_front).jsx.default;
        if (Comp) {
            return (
                <div key={ship.code} hidden={index !== this.state.shipmentIndex}>
                    {React.cloneElement(<Comp />, { onSuccess: () => console.log('trigger onSuccess'), shipment: ship, cart: this.state.cart })}
                </div>
            );
        }
    }

    renderPaymentMethod = (pm) => {
        const { cart } = this.state;
        if (pm.component_template_front && nsModules) {
            const Comp = nsModules.find((module) => module.code === pm.component_template_front).jsx.default;
            if (Comp) {
                return (
                    <div className="col-12" key={pm.code}>
                        <div className="cf-radio-btns">
                            <div className="cfr-item">
                                {React.cloneElement(<Comp />, { amount: cart.priceTotal[jwtManager.getTaxDisplay()], paymentMethod: pm, currency: 'EUR' })}
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <React.Fragment key={pm.code}>
                    <div className="col-5">
                        {pm.name ? (
                            <><img src={pm.urlLogo ? pm.urlLogo : ''} alt={pm.name} /> {pm.description}</>
                        ) : (
                            pm.code
                        )}
                    </div>
                    <div className="col-7">
                        <div className="cf-radio-btns">
                            <div className="cfr-item">
                                <input onClick={() => this.setState({ pm })} type="radio" name="payment-options" id={`pm-${pm.code}`} />
                                <label htmlFor={`pm-${pm.code}`}></label>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        }
    }

    validatePayment = async () => {
        const { lang, routerLang } = this.props;
        const { pm } = this.state;
        const cartId = window.localStorage.getItem('cart_id');

        if (pm === undefined) {
            NSToast.warn('payment:no_payment_sel');
            return;
        }

        // Transformation du panier en commande
        let order;
        try {
            order = await cartToOrder(cartId, lang);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }

        // Event pour Google Analytics
        const saveTransaction = new CustomEvent('saveTransaction', { detail: order });
        window.dispatchEvent(saveTransaction);

        // Paiement de la commande
        try {
            const paymentForm = await deferredPaymentOrder(order.number, pm.code, lang);
            if (paymentForm.status && paymentForm.status !== 200) {
                if (paymentForm.message) {
                    NSToast.error(paymentForm.message);
                } else {
                    NSToast.error('common:error_occured');
                }
            } else {
                this.setState({ paymentForm }, () => {
                    window.localStorage.setItem('order', JSON.stringify(order));
                    document.getElementById('paymentid').submit(); // Redirige sur la page du mode de paiement
                }); 
            }           
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    };

    getTotalPrice() {
        const { cart, shipmentPrice, taxDisplay } = this.state;
        if (!cart) { return '0.00'; }

        // Si cart.delivery existe, c'est que l'étape "Livraison" a été validée
        // En conséquence cart.priceTotal inclut les frais de port et on a pas besoin de les ajouter
        if (cart.delivery !== undefined && cart.delivery.price !== undefined && cart.delivery.price.et) {
            return cart.priceTotal[taxDisplay].toFixed(2);
        }

        // Si cart.delivery n'existe pas, c'est que l'étape "Livraison" n'a pas encore été validée
        // Il faut donc ajouter l'estimation des frais de port au cart.priceTotal
        return (cart.priceTotal[taxDisplay] + shipmentPrice).toFixed(2);
    }

    updateCart = async () => {
        const { lang, routerLang } = this.props;
        const cartId = window.localStorage.getItem('cart_id');
        if (!cartId) {
            return Router.pushRoute('cart', { lang: routerLang });
        }

        try {
            // Récupération du panier
            const PostBody = { populate: ['items.id'] };
            const cart = await getCart(cartId, lang, PostBody);
            this.setState({ cart });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
            return setTimeout(() => {
                Router.pushRoute('cart', { lang: routerLang });
            }, 5000);
        }
    }

    render() {
        const {
            countries, lang, oCmsHeader, oCmsFooter, sitename, t, routerLang
        } = this.props;
        const { cart, editAddress, isRelayPoint, relayPointAddressSaved, shipmentIndex, shipmentPrice, paymentMethods, paymentForm, shipments, step, taxDisplay } = this.state;
        const sortedArray = paymentMethods.sort((a, b) => a.sort - b.sort);
        let totalDiscount = 0;
        if (cart && cart.promos && cart.promos.length) {
            for (let i = 0; i < cart.promos.length; i++) {
                totalDiscount += cart.promos[i].discountATI;
            }
        }
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | Panier</title>
                        <meta property="og:type" content="website" />
                    </Head>

                    {/*<!-- Page info -->*/}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>{t('page.header.title')}</h4>
                            <div className="site-pagination">
                                <Link route="home" params={{ lang: routerLang }}><a>{t('common:accueil')}</a></Link> / <Link route="cart" params={{ lang: routerLang }}><a>{t('page.header.title')}</a></Link> / <a href="">{t('delivery:order')}</a>
                            </div>
                        </div>
                    </div>
                    {/*<!-- Page info end -->*/}

                    {/*<!-- checkout section  -->*/}
                    <section className="checkout-section spad">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 order-2 order-lg-1">    
                                    <div className="checkout-form step1">
                                        <div className="cf-title">1 - {t('addresses:list.adresse')}</div>
                                        <div hidden={step !== 1}>
                                            <Address countries={countries} handleEditAddress={this.handleEditAddress} />
                                            <div className="btn_action" hidden={editAddress}>
                                                <button className="site-btn sb-line sb-dark submit-step" onClick={this.validateAddress}>{t('common:next')}</button>
                                            </div>
                                        </div>
                                    </div>
                                    <form className="checkout-form step2">
                                        <div className="cf-title">2 - {t('delivery:livraison')}</div>
                                        <div hidden={step !== 2}>
                                            <div className="row shipping-btns">
                                                {
                                                    shipments.length ? shipments.map((ship, index) => (
                                                        <React.Fragment key={ship._id}>
                                                            <div className="col-4">
                                                                <img src={ship.url_logo} alt="" style={{ display: 'inline-block' }} /> {ship.name}
                                                            </div>
                                                            <div className="col-8">
                                                                <div className="cf-radio-btns">
                                                                    <div className="cfr-item">
                                                                        <input type="radio" name="shipping" id={`ship-${index}`} onChange={(e) => this.setState({ shipmentIndex: e.target.checked ? index : -1, isRelayPoint: ship.type === 'RELAY_POINT' ? true : false })} checked={(shipmentIndex === -1 && cart && cart.delivery && cart.delivery.method === ship._id) || (shipmentIndex === index)} />
                                                                        <label htmlFor={`ship-${index}`}>{ship.price > 0 ? <>{ship.price.toFixed(2)} &euro;</> : 'GRATUIT'}</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {(ship.component_template_front && nsModules) ? this.displayFrontModule(ship, index) : null }
                                                        </React.Fragment>
                                                    )) : 'Aucun transporteur'
                                                }
                                            </div>
                                            <div className="btn_action">
                                                <button type="button" className="site-btn sb-line sb-dark submit-step" onClick={() => { this.setState({ step: 1 }, () => {this.updateCart(); document.querySelector('.step1').scrollIntoView()}); }}>{t('cart:page.cart.cancel')}</button>&nbsp;
                                                { shipments.length && <button type="button" className="site-btn sb-line sb-dark submit-step" onClick={this.validateDelivery} disabled={isRelayPoint && !relayPointAddressSaved}>{t('common:next')}</button> }
                                            </div>
                                        </div>
                                    </form>
                                    <div className="checkout-form step3">
                                        <div className="cf-title">3 - {t('common:steps.paiement')}</div>
                                        <div hidden={step !== 3}>
                                            <div className="row shipping-btns">
                                                {
                                                    sortedArray ? sortedArray.map(this.renderPaymentMethod) : 'Aucun moyen de paiement'
                                                }
                                            </div>
                                            <div className="btn_action">
                                                <button type="button" className="site-btn sb-line sb-dark submit-step" onClick={() => { this.setState({ step: 2 }, () => document.querySelector('.step1').scrollIntoView()); }}>{t('cart:page.cart.cancel')}</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="content" dangerouslySetInnerHTML={{ __html: paymentForm }} hidden />
                                    <button className="site-btn submit-order-btn" onClick={this.validatePayment} hidden={ step !== 3}>{t('cart:page.cart.toOrder')}</button>
                                </div>
                                <div className="col-lg-4 order-1 order-lg-2">
                                    <div className="checkout-cart">
                                        <h3>{t('product:your_cart')}</h3>
                                        <ul className="product-list">
                                            {
                                                cart && cart.items && cart.items.filter((item) => !item.typeDisplay).map((item) => {
                                                    return (
                                                        <li key={item._id}>
                                                            <div className="pl-thumb">
                                                                <img src={`/images/${item.selected_variant ? 'productsVariant' : 'products'}/99x99/${item.image}/${item.code}.png`} alt="" />
                                                            </div>
                                                            <h6>{item.name}</h6>
                                                            <p><span style={{ color: 'grey', fontSize: '12px' }}>x{item.quantity}</span> {item.price.unit[taxDisplay].toFixed(2)} €</p>
                                                        </li>
                                                    );
                                                })
                                            }
                                        </ul>
                                        <ul className="price-list">
                                            <li>{t('product:total')}<span>{cart && cart.priceSubTotal[taxDisplay].toFixed(2)} €</span></li>
                                            {
                                                totalDiscount > 0 && (
                                                    <li>{t('account:order.page.label.discount')}<span>-{totalDiscount.toFixed(2)} €</span></li>
                                                )
                                            }
                                            <li>{t('success:page.delivery')}<span>{shipmentPrice.toFixed(2)} €</span></li>
                                            {
                                                cart && cart.additionnalFees[taxDisplay] > 0 && (
                                                    <li>{t('cart:page.cart.additionnal_fees')}<span>{cart.additionnalFees[taxDisplay].toFixed(2)} €</span></li>
                                                )
                                            }
                                            <li className="total">{t('product:total')}<span>{this.getTotalPrice()} €</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/*<!-- checkout section end -->*/}
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['cart', 'addresses', 'delivery','product'])(CartCheckout);
