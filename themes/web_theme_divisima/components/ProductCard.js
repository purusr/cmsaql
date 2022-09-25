import React from 'react';
import ModalR from 'react-responsive-modal';
import {
    NSContext, NSProductCard, imgDefaultBase64
} from 'aqlrc';
import routes, { Link } from '../routes';
import BundleProduct from './BundleProduct';
import { withI18next } from '../lib/withI18n';


class ProductCard extends NSProductCard {
    render() {
        const { from, mode, t, type, value } = this.props;
        const { openModal, product } = this.state;
        const {
            lang, query, routerLang, taxDisplay, themeConfig, urlLang
        } = this.context.state;
        if (!product || !product._id) {
            return <p>{ t('product-card:load_error') } ({type}: {value})</p>;
        }

        let product_route = routes.findAndGetUrls(product.canonical);
        if (from === 'category') {
            product_route = routes.findAndGetUrls(`/${query._slug}/${product.slug[lang]}`);
        }

        let imgDefault = imgDefaultBase64;
        let imgAlt = '';
        if (product && product.images && product.images.length) {
            const foundImg = product.images.find((img) => img.default);
            if (foundImg) {
                imgDefault = foundImg._id !== 'undefined' ? `/images/${product.selected_variant ? 'productsVariant' : 'products'}/264x350/${foundImg._id}/${product.slug[lang]}${foundImg.extension}` : imgDefault;
                imgAlt = foundImg.alt ? foundImg.alt : '';
            } else {
                imgDefault = product.images[0]._id !== 'undefined' ? `/images/${product.selected_variant ? 'productsVariant' : 'products'}/264x350/${product.images[0]._id}/${product.slug[lang]}${product.images[0].extension}` : imgDefault;
                imgAlt = product.images[0].alt ? product.images[0].alt : '';
            }
        }

        // Pictos
        const pictos = [];
        if (product.pictos) {
            product.pictos.forEach((picto) => {
                if (pictos.find((p) => p.location === picto.location) !== undefined) {
                    pictos.find((p) => p.location === picto.location).pictos.push(picto);
                } else {
                    const cardinals = picto.location.split('_');
                    const style = { position: 'absolute', top: 0, left: 0, width: '64px', height: '64px' };
                    if (cardinals.includes('RIGHT')) {
                        style.left = 'inherit';
                        style.right = 0;
                    }
                    if (cardinals.includes('BOTTOM')) {
                        style.top = 'inherit';
                        style.bottom = 0;
                    }
                    if (cardinals.includes('CENTER')) {
                        style.left = '50%';
                        style.transform = 'translate(-50%, 0)';
                    }
                    if (cardinals.includes('MIDDLE')) {
                        style.top = '50%';
                        style.transform = 'translate(0, -50%)';
                    }
                    pictos.push({ location: picto.location, style, pictos: [picto] });
                }
            });
        }

        return (
            <>
                <div className="product-item">
                    <div className="pi-pic">
                        {
                            pictos ? pictos.map((picto) => (
                                <div className="product_picto" style={picto.style} key={picto.location + Math.random()}>
                                    {
                                        picto.pictos && picto.pictos.map((p) => <img src={`/images/picto/32x32-70/${p.pictoId}/${p.image}`} alt={p.title} title={p.title} key={p._id} />)
                                    }
                                </div>
                            )) : ''
                        }
                        <Link href={product_route.urls.href} as={product_route.urls.as}>
                            <a><img src={imgDefault} alt={imgAlt} loading="lazy" /></a>
                        </Link>
                        <div className="pi-links">
                            <a href="#" className="add-card" onClick={product.type === 'bundle' ? this.onOpenModal : this.addToCart}><i className="flaticon-bag"></i><span>{ t('product-card:ajoutPanier') }</span></a>
                        </div>
                    </div>
                    {
                        themeConfig && themeConfig.find(t => t.key === 'showReviews') && themeConfig.find(t => t.key === 'showReviews').value && (
                            <div className="pi-rating">
                                {
                                    [...Array(5)].map((el, idx) => (
                                        <i key={idx} className={`fa fa-star-o${idx + 1 > Math.round(product.reviews.average) ? ' fa-fade' : ''}`}></i>
                                    ))
                                }
                                <span> ({product.reviews.reviews_nb})</span>
                            </div>
                        )
                        
                    }
                    
                    <div className="pi-text">
                        <h6 className="price">{ product.price.ati.special ? product.price.ati.special.toFixed(2) : product.price.ati.normal.toFixed(2) } €</h6>
                        <p>
                            <Link href={product_route.urls.href} as={product_route.urls.as}>
                                <a>{product.name}</a>
                            </Link>
                        </p>
                        { product.price.ati.special ? <del>{product.price.ati.normal.toFixed(2)} €</del> : null }
                    </div>
                </div>
                <ModalR
                    animationDuration={0} classNames={{ modal: 'popup__container', overlay: 'popup active' }}
                    open={openModal} onClose={this.onCloseModal} center
                >
                    {
                        product.type === 'bundle' ? (
                            <div className="modifier-popup__wrap">
                                <h3 className="modifier-popup__header">{t('product-card:composeMenu')}</h3>
                                <BundleProduct product={product} qty={1} onCloseModal={this.onCloseModal} />
                            </div>
                        ) : (
                            <>
                                <h3 className="popup__title">{ t('product-card:productAdded') } :</h3>{/* <!-- /.popup__title --> */}
                                <div className="popup__body">
                                    <div className="product-simple">
                                        <figure className="product__image">
                                            <img src={imgDefault} alt={imgAlt} />
                                        </figure>{/* <!-- /.product__image --> */}

                                        <h4 className="product__title">{this.state.selectedQty} x {product.name}</h4>{/* <!-- /.product__title --> */}

                                        <div className="product__actions">
                                            <button type="button" className="site-btn sb-dark" onClick={this.onCloseModal}>
                                                { t('product-card:continueShopping') } 
                                            </button>
                                            &nbsp;
                                            <Link route="cart" params={{ lang: routerLang }}>
                                                <a className="site-btn">
                                                { t('product-card:viewCart') } 
                                                </a>
                                            </Link>
                                        </div>{/* <!-- /.product__actions --> */}
                                    </div>{/* <!-- /.product-simple --> */}
                                </div>{/* <!-- /.popup__body --> */}
                            </>
                        )
                    }
                </ModalR>
            </>
        );
    }

    static contextType = NSContext;

    static defaultProps = {
        includeCss : true,
        mode       : 'normal',
        product    : {
            _id    : '',
            images : [],
            name   : 'Undefined',
            price  : {
                et  : { normal: -1 },
                ati : { normal: -1 }
            },
            description1 : { title: '', text: '' },
            description2 : { title: '', text: '' },
            reviews      : {}
        },
        gridDisplay : true
    };
}

export default withI18next(['product-card', 'product'])(ProductCard);
