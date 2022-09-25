import React from 'react';
import moment from 'moment';
import Head from 'next/head';
import {
    NSContext, NSToast, getLangPrefix, imgDefaultBase64, getOrderById
} from 'aqlrc';
import Layout from '../../components/Layout';
import { withI18next } from '../../lib/withI18n';
import { Link, Router } from '../../routes';

/**
 * CartSuccess - Page de confirmation de commande dans le panier
 * @return {React.Component}
 */

class CartSuccess extends React.Component {
    static getInitialProps = async function (ctx) {
        return {
            userRequired : { url: '/cart/login', route: 'cartLogin' }
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props,
            order      : {},
            taxDisplay : 'ati'
        };
    }

    componentDidMount = async () => {
        const { lang, routerLang, t } = this.props;
        const contextLang = window.localStorage.getItem('lang');
        if (contextLang && contextLang !== this.props.lang) {
            return this.onLangChange(contextLang);
        }
        const orderTemp = await JSON.parse(window.localStorage.getItem('order'));
        if (!orderTemp) {
            return Router.pushRoute('home', { lang: routerLang });
        }
        window.localStorage.removeItem('order');

        try {
            // Récupération de la commande
            const PostBody = { populate: ['items.id'] };
            const order = await getOrderById(orderTemp._id, lang, PostBody);
            this.setState({ order, taxDisplay: order.priceTotal.paidTax ? 'ati' : 'et' });
            window.onpopstate = (event) => {
                Router.pushRoute('orders', { lang: routerLang });
            };
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
            setTimeout(() => {
                Router.pushRoute('home', { lang: routerLang });
            }, 5000);
        }
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/cart/success`;
    };

    checkDate = (date) => {
        const { lang } = this.props;
        moment.locale(lang);
        const momentDate = moment(date);
        // We can't deliver on sunday
        if (new Date(momentDate._d).getDay() === 0) {
            return momentDate.add(1, 'days').format('L');
        }
        return momentDate.format('L');
    };

    render() {
        const {
            lang, oCmsHeader, oCmsFooter, routerLang, sitename, t
        } = this.props;
        const { order } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {t('success:title')}</title>
                        <meta property="og:type" content="website" />
                    </Head>

                    {/*<!-- Page info -->*/}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>Votre panier</h4>
                            <div className="site-pagination">
                                <Link route="home" params={{ lang: routerLang }}><a>{t('common:accueil')}</a></Link> / {t('product:your_cart')} / {t('success:title')}
                            </div>
                        </div>
                    </div>
                    {/*<!-- Page info end -->*/}


                    {/*<!-- checkout section  -->*/}
                    <section className="cart-success-section spad">
                        <div className="container">
                            {
                                Object.keys(order).length > 0 && (
                                    <>
                                        <section className="section-confirm">
                                            <div className="section__head">
                                                <div className="section__head-entry">
                                                    <p>
                                                    {t('success:page.title')}<strong>{order.number}</strong> {order.status === 'PAID' || order.status === 'BILLED' ? t('success:page.is_register') : (order.status === 'PAYMENT_RECEIPT_PENDING' ? t('success:page.is_not_payed') : t('success:page.is_not_register'))}.<br />
                                                        <small>{t('success:page.mail_sent')} : {order.customer.email}</small>
                                                    </p>
                                                </div>{/* <!-- /.section__head-entry --> */}
                                            </div>{/* <!-- /.section__head --> */}

                                            <div className="section__body">
                                                <h4 className="section__title">{t('success:page.sub_title')}</h4>{/* <!-- /.section__title --> */}

                                                <div className="section__entry">
                                                    <h5>{t('success:page.delivery')}{order.delivery.name}</h5>

                                                    <p>
                                                        {order.addresses.delivery.lastname} {order.addresses.delivery.firstname}<br />
                                                        {order.addresses.delivery.line1}<br />
                                                        {order.addresses.delivery.line2 ? <>{order.addresses.delivery.line2} <br /></> : null}
                                                        {order.addresses.delivery.zipcode} {order.addresses.delivery.city}<br />
                                                        {order.addresses.delivery.isoCountryCode}
                                                    </p>

                                                    <h5>{t('success:page.deliveryDate')}</h5>

                                                    <p>{order.delivery && order.delivery.date && this.checkDate(order.delivery.date)}</p>
                                                </div>{/* <!-- /.section__entry --> */}
                                            </div>{/* <!-- /.section__body --> */}
                                        </section>{/* <!-- /.section-confirm --> */}

                                        <div className="cart-table">
                                            <h5 className="table__title">{t('success:page.articles')}</h5>{/* <!-- /.table__title --> */}
                                            <div className="cart-table-warp">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th className="product-th">{t('success:page.label.article')}</th>
                                                            <th className="quy-th">{t('success:page.label.quantity')}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {
                                                            order.items.length > 0 ? order.items.map((item) => {
                                                                let basePrice = null;
                                                                let descPromo = '';
                                                                let descPromoT = '';
                                                                if (order.quantityBreaks && order.quantityBreaks.productsId.length) {
                                                                    // On check si le produit courant a recu une promo
                                                                    const prdPromoFound = order.quantityBreaks.productsId.find((productId) => productId.productId === item.id._id);
                                                                    if (prdPromoFound) {
                                                                        basePrice = prdPromoFound[`basePrice${taxDisplay.toUpperCase()}`];
                                                                        descPromo = (
                                                                            <del><span className="price" style={{ color: '#979797' }}>{(basePrice).toFixed(2)}€</span></del>
                                                                        );
                                                                        descPromoT = (
                                                                            <><del><span className="price" style={{ color: '#979797' }}>{(basePrice * item.quantity).toFixed(2)}€</span></del><br /></>
                                                                        );
                                                                    }
                                                                }
                                                                const unit_price = item.price && item.price.special ? item.price.special.ati : item.price.unit.ati;
                                                                return (
                                                                    <tr className="cart-item cart-item--simple">
                                                                        <td className="product-col">
                                                                            <img src={`/images/${item.selected_variant ? 'productsVariant' : 'products'}/124x96/${item.image}/${item.code}.png`} alt="" />
                                                                            <div className="pc-title">
                                                                                <p><b>{(item.selected_variant && item.selected_variant.id) ? item.selected_variant.name : (item.name)}</b></p>
                                                                                {
                                                                                    item.selections && item.selections.length > 0 && (
                                                                                        <ul style={{fontSize: '10px', listStyle: 'none'}}>
                                                                                            {
                                                                                                item.selections.map((section) => (
                                                                                                    section.products.map((productSection, indexSel) => {
                                                                                                        const bundleSection = item.bundle_sections.find((bundle_section) => bundle_section.ref === section.bundle_section_ref);
                                                                                                        const correctProduct = bundleSection ? bundleSection.products.find((product) => product.id === productSection.id) : null;
                                                                                                        let toDisplay = '';
                                                                                                        if (bundleSection && correctProduct && correctProduct.modifier_price && correctProduct.modifier_price.ati) {
                                                                                                            toDisplay = `(${correctProduct.modifier_price.ati > 0 ? '+' : ''}${correctProduct.modifier_price.ati} €)`;
                                                                                                        }
                                                                                                        return (<li key={indexSel}>- {productSection.name} {toDisplay}</li>)
                                                                                                    })
                                                                                                ))
                                                                                            }
                                                                                        </ul> 
                                                                                    )
                                                                                }
                                                                                <p>{unit_price.toFixed(2)} &euro;</p>
                                                                            </div>
                                                                        </td>

                                                                        <td className="quy-col">
                                                                            <div className="quantity">
                                                                                x{item.quantity}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }) : null
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="total-cost">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{t('success:page.sous_total_order.ati')}</td>
                                                            <td>{order.priceSubTotal.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{t('delivery:livraison')}</td>
                                                            <td>{order.delivery.price.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        {
                                                            order.additionnalFees && order.additionnalFees.ati > 0 && (
                                                                <tr>
                                                                    <td>{t('success:page.fee_shipping.ati')}</td>
                                                                    <td>{order.additionnalFees.ati.toFixed(2)} &euro;</td>
                                                                </tr>
                                                            )
                                                        }
                                                        {
                                                            order.promos && order.promos.length > 0 && (
                                                                <tr>
                                                                    <td>{t('account:orders.page.label.discount')}</td>
                                                                    <td>-{order.promos[0].discountATI.toFixed(2)} &euro;</td>
                                                                </tr>
                                                            )
                                                        }
                                                        <tr className="total">
                                                            <td>{t('success:page.taxes_includes')}</td>
                                                            <td>{order.priceTotal.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{t('success:page.label.total.ati')}</td>
                                                            <td>{(order.priceTotal.ati - order.priceTotal.et).toFixed(2)} &euro;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>{/* <!-- /.total-cost --> */}
                                        </div>{/* <!-- /.table-cart --> */}
                                    </>
                                )
                            }
                        </div>{/* <!-- container --> */}
                    </section>{/*<!-- cart success section end -->*/}
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['success', 'common'])(CartSuccess);
