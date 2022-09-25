import React from 'react';
import moment from 'moment';
import {
    NSPageAccountOrders, NSContext, imgDefaultBase64, statusColor
} from 'aqlrc';
import ModalR from 'react-responsive-modal';
import AccountStructure from '../../components/AccountStructure';
import { withI18next } from '../../lib/withI18n';

/**
 * PageAccountOrders - Page des commandes client (surcharge NSPageAccountOrders)
 * @return {React.Component}
 */

class PageAccountOrders extends NSPageAccountOrders {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            isActive               : [],
            orderCountry           : {}, // la clé sera l'id de la commande la valeur sera le nom du pays,
            taxDisplay             : [],
            openModalConfirmCancel : false,
            idOrderCancel          : false
        };
    }

    render() {
        const {
            lang, oCmsHeader, oCmsFooter, sitename, t, user, taxDisplay
        } = this.props;
        moment.locale(lang);
        const { openModalConfirmCancel, orders } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <AccountStructure user={user} active="orders" title={t('account:sidebar.orders')} oCmsHeader={oCmsHeader} oCmsFooter={oCmsFooter} sitename={sitename}>
                    <div className="orders__body">
                        {
                            orders.length ? orders.map((order, index) => (

                                <div className={this.state.isActive[index] ? 'order active' : 'order'} key={order._id}>
                                    <div className="order__head" onClick={() => this.switchActive(index)}>
                                        <div className="row">
                                            <h6 className="col-lg-6 order__title">{t('account:orders.page.label.order_num')}&deg; <strong>{order.number}</strong> {t('common:of_the')} {moment(order.createdAt).format('L')}</h6>{/* <!-- /.order__title --> */}

                                            <span className="col-lg-4 order__label">{statusColor(order.status, this.props.t)}</span>

                                            <span className="col-lg-2 order__total">{order.priceTotal[taxDisplay[index]].toFixed(2)} &euro;</span>
                                        </div>
                                    </div>{/* <!-- /.order__head --> */}

                                    <div className="order__body">
                                        <div className="cart-table">
                                            <div className="cart-table-warp">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th className="product-th">{t('cart:page.cart.products')}</th>
                                                            <th className="quy-th">{t('cart:page.cart.quantity')}</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {
                                                            order.items.map((item) => {
                                                                let basePrice = null;
                                                                let descPromo = '';
                                                                let descPromoT = '';
                                                                if (order.quantityBreaks && order.quantityBreaks.productsId.length) {
                                                                // On check si le produit courant a recu une promo
                                                                    const prdPromoFound = order.quantityBreaks.productsId.find((productId) => productId.productId === item.id._id);
                                                                    if (prdPromoFound) {
                                                                        basePrice = prdPromoFound[`basePrice${taxDisplay[index].toUpperCase()}`];
                                                                        descPromo = (
                                                                            <del><span className="price" style={{ color: '#979797' }}>{(basePrice).toFixed(2)}€</span></del>
                                                                        );
                                                                        descPromoT = (
                                                                            <del><span className="price" style={{ color: '#979797' }}>{(basePrice * item.quantity).toFixed(2)}€</span></del>
                                                                        );
                                                                    }
                                                                }
                                                                const unit_price = item.price && item.price.special ? item.price.special.ati : item.price.unit.ati;
                                                                return (
                                                                    <tr className="cart-item cart-item--simple" key={item._id}>
                                                                        <td className="product-col">
                                                                            <img src={`/images/${item.selected_variant ? 'productsVariant' : 'products'}/83x63/${item.image}/${item.code}.png`} alt="" />
                                                                            <div className="pc-title">
                                                                                <p><b>{item.name}</b></p>
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
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div>
                                                <p>{t('account:orders.page.label.estimated_delivery')} : {order.delivery.date ? moment(order.delivery.date).format('L') : '-'}</p>

                                                <p>{t('account:orders.page.label.delivery')} : {this.getDeliveryAddress(order)}</p>

                                                <p>{t('account:orders.page.label.delivery_mode')} : {order.delivery.name}</p>
                                            
                                                <p>{t('account:orders.page.label.payment_mode')} : {order.payment.length && order.payment[0] && order.payment[0].mode}</p>

                                                <p>
                                                    {
                                                        order.bills && order.bills.length > 0 && order.bills.map((i) => (
                                                            <button type="button" className="site-btn sb-line sb-dark" onClick={() => this.downloadBill(i)}>{t('account:orders.page.label.download')} {i.avoir === false ? t('account:orders.page.label.download_bill') : t('account:orders.page.label.download_asset')}</button>
                                                        ))
                                                    }
                                                </p>

                                                <p>
                                                    {
                                                        !['BILLED', 'DELIVERY_PROGRESS', 'DELIVERY_PARTIAL_PROGRESS', 'ASK_CANCEL', 'CANCELED', 'RETURNED'].includes(order.status) && 
                                                            <button type="button" className="site-btn sb-line sb-dark" onClick={() => this.openModalConfirmCancel(order._id)}>{t('account:orders.page.label.cancel_order')}</button>
                                                    }
                                                </p>
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
                                                            <td>{t('cart:page.resume.sousTotal')}</td>
                                                            <td>{order.priceSubTotal.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{t('addresses:edit.livraison')}</td>
                                                            <td>{order.delivery.price.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        {
                                                            order.additionnalFees && order.additionnalFees.ati > 0 && (
                                                                <tr>
                                                                    <td>{t('account:orders.page.label.additionnal_fees')}</td>
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
                                                            <td>{t('account:orders.page.label.total.ati')}</td>
                                                            <td>{order.priceTotal.ati.toFixed(2)} &euro;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{t('account:orders.page.label.vat_included')}</td>
                                                            <td>{(order.priceTotal.ati - order.priceTotal.et).toFixed(2)} &euro;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>{/* <!-- /.total-cost --> */}
                                        </div>{/* <!-- /.table-order --> */}
                                    </div>{/* <!-- /.order__body --> */}
                                </div>/* <!-- /.order --> */
                            )) : <p>{t('account:orders.page.label.no_order')}</p>
                        }
                    </div>{/* <!-- /.orders__body --> */}
                    <ModalR
                        animationDuration={0} classNames={{ modal: 'popup__container', overlay: 'popup active' }}
                        open={openModalConfirmCancel} onClose={this.onCloseModalConfirmCancel} center showCloseIcon={false}
                    >
                        <h3 className="popup__title">{t('account:orders.page.label.confirm_cancel_order')}</h3>
                        <div className="popup__body" style={{ textAlign: 'center' }}>
                            <button type="button" className="site-btn" onClick={this.cancelOrder}>{t('account:rgpd.page.label.yes')}</button>&nbsp;
                            <button type="button" className="site-btn sb-dark" onClick={this.onCloseModalConfirmCancel}>{t('account:rgpd.page.label.no')}</button>
                        </div>
                    </ModalR>
                </AccountStructure>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['account', 'common', 'cart'])(PageAccountOrders);
