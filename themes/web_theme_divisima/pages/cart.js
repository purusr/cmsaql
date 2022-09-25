import React from 'react';
import {
    NSPageCart, NSContext, imgDefaultBase64
} from 'aqlrc';
import Head from 'next/head';
import { Link, Router } from '../routes';
import CodePromo from '../components/CodePromo';
import Layout from '../components/Layout';
import { withI18next } from '../lib/withI18n';
import { listModulePage } from '../lib/utils';

/**
 * PageCart - Page panier (surcharge NSPageCart)
 * @return {React.Component}
 */

class PageCart extends NSPageCart {
    validateCart = () => {
        const {
            routerLang, user, cart
        } = this.state;
        const { t } = this.props
        
        try {
            if (!cart || !cart.items || cart.items.filter((item) => !item.typeDisplay).length === 0) {
                return NSToast.error('cart:error.emptyCart');
            }
            if (!user) {
                return Router.pushRoute('cartLogin', { lang: routerLang });
            }
            Router.pushRoute('cartCheckout', { lang: routerLang });
        } catch (error) {
            console.error(error);
            Router.pushRoute('cartLogin', { lang: routerLang });
        }
    };

    render() {
        const {
            lang, oCmsHeader, oCmsFooter, routerLang, sitename, t
        } = this.props;
        const { cart, estimatedFee } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {t('page.title')}</title>
                        <meta property="og:type" content="website" />
                    </Head>

                    {/* <!-- Page info --> */}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>{t('page.header.title')}</h4>
                            <div className="site-pagination">
                                <Link route="home" params={{ lang: routerLang }}><a>{t('common:accueil')}</a></Link> / {t('page.header.title')}
                            </div>
                        </div>
                    </div>
                    {/* <!-- Page info end --> */}


                    {/* <!-- cart section end --> */}
                    <section className="cart-section spad">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <div className="cart-table">
                                        <h3>{t('page.header.title')}{!cart || cart.items.filter((item) => !item.typeDisplay).length === 0 ? t('page.cart.isEmpty') : null}</h3>
                                        <div className="cart-table-warp" hidden={!cart || cart.items.filter((item) => !item.typeDisplay).length === 0}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th className="product-th">{t('page.cart.products')}</th>
                                                        <th className="quy-th">{t('page.cart.quantity')}</th>
                                                        <th className="total-th">{t('category:prix')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    cart && cart.items && cart.items.filter((item) => !item.typeDisplay).map((item, index) => {
                                                        const unit_price = item.price && item.price.special ? item.price.special.ati : item.price.unit.ati;
                                                        return (
                                                            <tr key={item._id}>
                                                                <td className="product-col">
                                                                    <img src={`/images/${item.selected_variant ? 'productsVariant' : 'products'}/73x73/${item.image}/${item.code}.png`} alt="" />
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
                                                                        <p>{ unit_price.toFixed(2) } &euro;</p>
                                                                        { item.price?.special ? <><del>{item.price.unit.ati.toFixed(2)} €</del>&nbsp;</> : null }
                                                                    </div>
                                                                </td>
                                                                <td className="quy-col">
                                                                    <div className="quantity">
                                                                        <div className="pro-qty">
                                                                            <span className="dec qtybtn" onClick={(e) => this.qtyModifier('-', index)}>-</span>
                                                                            <input type="text" value={item.quantity} readOnly />
                                                                            <span className="inc qtybtn" onClick={(e) => this.qtyModifier('+', index)}>+</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="total-col"><p>{(unit_price * item.quantity).toFixed(2)} &euro;</p></td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            {
                                                listModulePage('cart')
                                            }
                                        </div>
                                        <div className="total-cost" hidden={!cart || cart.items.filter((item) => !item.typeDisplay).length === 0}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{t('page.resume.sousTotal')}</td>
                                                        <td>{cart.priceSubTotal.ati.toFixed(2)} &euro;</td>
                                                    </tr>
                                                    <tr>
                                                        <td>{t('page.delivery.delivery_fee')}</td>
                                                        <td>{estimatedFee > 0 ? <>{estimatedFee.toFixed(2)} &euro;</> : 'Gratuite !'}</td>
                                                    </tr>
                                                    {
                                                        cart.additionnalFees && cart.additionnalFees.ati > 0 && (
                                                            <tr>
                                                                <td>{t('page.cart.additionnal_fees')}</td>
                                                                <td>{cart.additionnalFees.ati.toFixed(2)} &euro;</td>
                                                            </tr>
                                                        )
                                                    }
                                                    {
                                                        cart.promos && cart.promos.length > 0 && (
                                                            <tr>
                                                                <td>{t('page.cart.cart_discount')}</td>
                                                                <td>-{cart.promos[0].discountATI.toFixed(2)} &euro;</td>
                                                            </tr>
                                                        )
                                                    }
                                                    <tr className="total">
                                                        <td><b>{t('page.resume.totalTTC')}</b></td>
                                                        <td><b>{this.getTotalPrice()} &euro;</b></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>{/* <!-- /.total-cost --> */}
                                        
                                    </div>
                                </div>
                                {
                                    cart && cart.items && cart.items.filter((item) => !item.typeDisplay).length > 0 && (
                                        <div className="col-lg-4 card-right">
                                            <CodePromo />
                                            <button type="button" className="site-btn" onClick={this.validateCart}>{t('common:valider')}</button>
                                            <button type="button" className="site-btn sb-dark">{t('page.cart.continue_buying')}</button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </section>
                    {/* <!-- cart section end --> */}
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['cart', 'common'])(PageCart);
