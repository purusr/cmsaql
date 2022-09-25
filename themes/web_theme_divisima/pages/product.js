import React from 'react';
import axios from 'axios';
import Lightbox from 'lightbox-react';
import Head from 'next/head';
import ModalR from 'react-responsive-modal';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import moment from 'moment';
import { withRouter } from 'next/router';
import {
    NSPageProduct,
    NSContext,
    NSDrawStars,
    NSProductStock,
    NSToast,
    getAPIUrl,
    getCmsBlock,
    imgDefaultBase64,
    jwtManager,
    getProduct,
    NSProductVariants
} from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import { listModulePage, slugify } from '../lib/utils';
import BundleProduct from '../components/BundleProduct';
import Breadcrumb from '../components/Breadcrumb';
import CMS from '../components/CMS';
import Layout from '../components/Layout';
import ProductCardList from '../components/ProductCardList';
import routes, { Link, Router } from '../routes';
import Error from './_error';

/**
 * PageProduct - Page produit (surcharge NSPageProduct)
 * @return {React.Component}
 */

 const Video = ({ content }) => (
    <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${content}`}
        style={{
            maxWidth : '100%',
            position : 'absolute',
            left     : 0,
            right    : 0,
            margin   : 'auto',
            top      : '50%',
            transform: 'translateY(-50%)',
        }}
        title={content}
    />
);
class PageProduct extends NSPageProduct {
    constructor(props) {
        super(props);
        
        this.state = {
            ...props,
            compositionBundle : {
                cartId : '',
                item   : {
                    _id        : props.product ? props.product._id : '',
                    id         : props.product ? props.product._id : '',
                    quantity   : 1,
                    selections : [],
                },
            },
            openModal            : false,
            photoIndex           : 0,
            indexComment         : 0,
            isOpen               : false,
            selectedQty          : 1,
            tab                  : 0,
            tabState             : 1,
            cmsLegalTxt : {
                content : null,
            },
            accordion_section    : 0
        };
        this.formMenu = {};
    }

    render = () => {
        const {
            appurl, cmsProductContentBottom, lang, notFound, oCmsHeader, oCmsFooter, routerLang, sitename, t, themeConfig
        } = this.props;
        if (notFound) {
            return (
                <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                    <Error statusCode={404} message="Not found" oCmsHeader={oCmsHeader} oCmsFooter={oCmsFooter} />);
                </NSContext.Provider>
            );
        }
        const {
            accordion_section, openModal, openComment, photoIndex, isOpen, modalComment, openReviews, product, allCommentsDisplayed, hideReviewsLanguage, selectedQty, tabState, taxDisplay
        } = this.state;

        const canonical = product.canonical ? `${appurl}${product.canonical.substr(1)}` : '';

        // Chemin de l'image non trouvé
        let imgDefault = `/images/${product.selected_variant ? 'productsVariant' : 'products'}/558x757/no-image/${product.slug[lang]}.jpg`;
        let imgAlt = 'illustration produit';
        if (product && product.images && product.images.length) {
            const foundImg = product.images.find((img) => img.default);
            if (foundImg) {
                imgDefault = foundImg._id !== 'undefined' ? `/images/${product.selected_variant ? 'productsVariant' : 'products'}/558x757/${foundImg._id}/${product.slug[lang]}${foundImg.extension}` : imgDefault;
                imgAlt = foundImg.alt || imgAlt;
            } else {
                imgDefault = product.images[0]._id !== 'undefined' ? `/images/${product.selected_variant ? 'productsVariant' : 'products'}/558x757/${product.images[0]._id}/${product.slug[lang]}${foundImg.extension}` : imgDefault;
                imgAlt = product.images[0].alt || imgAlt;
            }
        }

        const attributes = product.attributes.filter((a) => a.value && a.value.length);

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

        const lightboxImages = product.images.sort((a, b) => a.position - b.position).map((item) => {
            if (item.content) return { content: <Video content={item.content} />, alt: item.alt };
            return { content: `/images/${item.selected_variant ? 'productsVariant' : 'products'}/max/${item._id}/${slugify(item.title)}${item.extension}`, alt: item.alt };
        });

        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {product.name !== undefined && product.name !== '' ? product.name : ''}</title>
                        {
                            product.description2 && product.description2.text ? <meta name="description" content={product.description2.title} /> : null
                        }
                        <link rel="canonical" href={canonical} />
                        <meta property="og:title" content={`${sitename} | ${product.name !== undefined && product.name !== '' ? product.name : ''}`} />
                        <meta property="og:url" content={canonical} />
                        <meta property="og:type" content="article" />
                        <meta property="og:image" content={`${appurl}${imgDefault}`} />
                    </Head>
                    {/* <!-- Page info --> */}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>{product.name}</h4>
                            <Breadcrumb />
                        </div>
                    </div>
                    {/* <!-- Page info end --> */}


                    {/* <!-- product section --> */}
                    <section className="product-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    {
                                        pictos ? pictos.map((picto) => (
                                            <div className="product_picto" style={picto.style} key={picto.location + Math.random()}>
                                                {
                                                    picto.pictos && picto.pictos.map((p) => <img src={`/images/picto/32x32-70/${p.pictoId}/${p.image}`} alt={p.title} title={p.title} key={p._id} />)
                                                }
                                            </div>
                                        )) : ''
                                    }
                                    <div className="product-pic-zoom">
                                        <img className="product-big-img" src={imgDefault} alt={imgAlt} onClick={() => (product.images.length ? this.openLightBox(product.images.findIndex((img) => img.default)) : false)} />
                                    </div>
                                    {
                                        isOpen && (
                                            <Lightbox
                                                mainSrc={lightboxImages[photoIndex].content}
                                                nextSrc={lightboxImages[(photoIndex + 1) % product.images.length].content}
                                                prevSrc={lightboxImages[(photoIndex + product.images.length - 1) % product.images.length].content}
                                                imageTitle={lightboxImages[photoIndex].alt}
                                                onCloseRequest={() => this.setState({ isOpen: false })}
                                                onMovePrevRequest={() => this.setState({ photoIndex: (photoIndex + product.images.length - 1) % product.images.length })}
                                                onMoveNextRequest={() => this.setState({ photoIndex: (photoIndex + 1) % product.images.length })}
                                            />
                                        )
                                    }
                                    <div className="product-thumbs" tabIndex="1" style={{overflow: 'hidden', outline: 'none'}}>
                                        <div className="product-thumbs-track">
                                        {
                                            product.images && product.images.filter((img) => !img.default) ? product.images.filter((img) => !img.default).map((img, index) => (
                                                <div key={img._id} className="pt" style={{ display: 'flex', alignItems: 'center' }} onClick={() => this.openLightBox(product.images.findIndex((im) => im._id === img._id))}>
                                                    {
                                                        img.content ? <img src={`https://img.youtube.com/vi/${img.content}/0.jpg`} alt={img.alt} />
                                                        : <img src={`/images/${product.selected_variant ? 'productsVariant' : 'products'}/116x116/${img._id}/${product.slug[lang]}-${index}${img.extension}`} alt=""/>
                                                    }
                                                </div>
                                            )) : null
                                        }
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 product-details">
                                    <h2 className="p-title">{product.name}</h2>
                                    <NSProductVariants product={product} hasVariants={this.hasVariants} selectVariant={this.selectVariant} t={t} />
                                    { product.price.ati.special ? <div><del>{product.price.ati.normal.toFixed(2)} €</del></div> : null }
                                    <h3 className="p-price">{ product.price.ati.special ? product.price.ati.special.toFixed(2) : product.price.ati.normal.toFixed(2) } €</h3>
                                    <NSProductStock stock={product.stock} />
                                    <div className="p-rating">
                                        {
                                            [...Array(5)].map((el, idx) => (
                                                <i key={idx} className={`fa fa-star-o${idx + 1 > Math.round(product.reviews.average) ? ' fa-fade' : ''}`}></i>
                                            ))
                                        }
                                        <span> ({product.reviews.reviews_nb})</span>
                                    </div>
                                    <div className="quantity">
                                        <p>{t('product:quantite')}</p>
                                        <div className="pro-qty">
                                            <span className="dec qtybtn" onClick={this.decrementQty}>-</span>
                                            <input type="text" value={selectedQty} readOnly />
                                            <span className="inc qtybtn" onClick={this.incrementQty}>+</span>
                                        </div>
                                    </div>
                                    <button type="button" className="site-btn" onClick={product.type === 'bundle' ? this.onOpenModal : (product.type === 'simple' ? this.addToCart : '')}>{t('product:ajoutPanier')}</button>
                                    <div id="accordion" className="accordion-area">
                                        {
                                            product.description2 && (
                                                <div className="panel">
                                                    <div className="panel-header" id="headingOne">
                                                        <button className={accordion_section === 1 ? 'panel-link active' : 'panel-link collapsed'} data-toggle="collapse" data-target="#collapse1" aria-expanded={accordion_section === 1 ? 'true' : 'false'} aria-controls="collapse1" onClick={() => this.setState({ accordion_section: accordion_section === 1 ? 0 : 1 })}>{product.description2.title}</button>
                                                    </div>
                                                    <div id="collapse1" className={accordion_section === 1 ? 'collapse show' : 'collapse'} aria-labelledby="headingOne" data-parent="#accordion">
                                                        { product.description2.text && <div className="panel-body" dangerouslySetInnerHTML={{ __html: product.description2.text }} /> }
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            product.description1 && (
                                                <div className="panel">
                                                    <div className="panel-header" id="headingTwo">
                                                        <button className={accordion_section === 2 ? 'panel-link active' : 'panel-link collapsed'} data-toggle="collapse" data-target="#collapse2" aria-expanded={accordion_section === 2 ? 'true' : 'false'} aria-controls="collapse2" onClick={() => this.setState({ accordion_section: accordion_section === 2 ? 0 : 2})}>{product.description1.title}</button>
                                                    </div>
                                                    <div id="collapse2" className={accordion_section === 2 ? 'collapse show' : 'collapse'} aria-labelledby="headingTwo" data-parent="#accordion">
                                                        { product.description1.text && <div className="panel-body" dangerouslySetInnerHTML={{ __html: product.description1.text }} /> }
                                                    </div>
                                                </div>
                                            )
                                        }
                                        <div className="panel" hidden={!attributes || !attributes.length}>
                                            <div className="panel-header" id="headingThree">
                                                <button className={accordion_section === 3 ? 'panel-link active' : 'panel-link collapsed'} data-toggle="collapse" data-target="#collapse3" aria-expanded={accordion_section === 3 ? 'true' : 'false'} aria-controls="collapse3" onClick={() => this.setState({ accordion_section: accordion_section === 3 ? 0 : 3})}>{t('addresses:edit.infosDe')}</button>
                                            </div>
                                            <div id="collapse3" className={accordion_section === 3 ? 'collapse show' : 'collapse'} aria-labelledby="headingThree" data-parent="#accordion">
                                                <div className="panel-body">
                                                    <ul className="list-check" style={{ listStyle: 'none' }}>
                                                        {
                                                            attributes && attributes.length > 0 && attributes.map((attr) => {
                                                                if (attr.type === 'color') {
                                                                    return (
                                                                        <li key={attr._id}>
                                                                            - {attr.name} : <span style={{
                                                                                marginLeft : '5px', padding : '0 10px', backgroundColor : attr.value.toString(), borderRadius : '5px'
                                                                            }}
                                                                            />
                                                                        </li>
                                                                    );
                                                                }
                                                                return (
                                                                    <li key={attr._id}>
                                                                        - {attr.name} : {Array.isArray(attr.value) ? attr.value.join(', ') : attr.value}
                                                                    </li>
                                                                );
                                                            })
                                                        }
                                                    </ul>{/* <!-- /.list-check --> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="social-sharing">
                                        <FacebookShareButton url={`${typeof window !== 'undefined' ? window.location.href : ''}`}>
                                            <span><i className="fa fa-facebook" /></span>
                                        </FacebookShareButton>
                                        <TwitterShareButton url={`${typeof window !== 'undefined' ? window.location.href : ''}`}>
                                            <span><i className="fa fa-twitter" /></span>
                                        </TwitterShareButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* <!-- product section end --> */}

                    {
                        themeConfig && themeConfig.find(t => t.key === 'showReviews') && themeConfig.find(t => t.key === 'showReviews').value && (
                            <section className="reviews-product-section">
                                <div className="container">
                                    <div className="section-title">
                                        <h2>{t('product:avis')}</h2>
                                        <div className="p-rating">
                                            {
                                                product.reviews.reviews_nb > 0 ? (
                                                    <>
                                                        <span>{t('product:overall_rating')} : <strong>{product.reviews.average}</strong>/5 </span>
                                                        {
                                                            [...Array(5)].map((el, idx) => (
                                                                <i key={idx} className={`fa fa-star-o${idx + 1 > Math.round(product.reviews.average) ? ' fa-fade' : ''}`}></i>
                                                            ))
                                                        }
                                                        <span> ({product.reviews.reviews_nb} {t('product:avis')})</span>
                                                    </>
                                                ) : <span>{t('product:noReview')}</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="reviews-details">
                                        {
                                            product.reviews.datas.map((review, index) => {
                                                return (
                                                    <div key={review._id} className="rating-box">
                                                        <aside className="rating-aside">
                                                            <div className="rating-value">
                                                                <strong>{review.rate}</strong><span>/5</span>
                                                            </div>
                                                            <div className="rating-split">
                                                            {
                                                                [...Array(5)].map((el, idx) => (
                                                                    <i key={idx} className={`fa fa-star-o${idx + 1 > Math.round(review.rate) ? ' fa-fade' : ''}`}></i>
                                                                ))
                                                            }
                                                            </div>
                                                        </aside>
                                                        <div className="rating-comment">
                                                            <h5>{review.title}</h5>
                                                            <div>{review.review}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </section>
                        )
                    }

                    {/* <!-- RELATED PRODUCTS section --> */}
                    {
                        product.associated_prds && product.associated_prds.length > 0 && (
                            <section className="related-product-section">
                                <div className="container">
                                    <div className="section-title">
                                        <h2>{t('product:crossSelling')}</h2>
                                    </div>
                                    <div className="d-none d-xl-block d-lg-block d-md-block">
                                        <ProductCardList type="data" value={product.associated_prds} itemsperslides={4} gNext={{ Head, Link, Router }} />
                                    </div>
                                    <div className="d-block d-sm-none">
                                        <ProductCardList type="data" value={product.associated_prds} itemsperslides={1} gNext={{ Head, Link, Router }} />
                                    </div>
                                </div>
                            </section>
                        )
                    }
                    {/* <!-- RELATED PRODUCTS section end --> */}
                    <section>
                        {
                            listModulePage('product')
                        }
                    </section>
                    {
                        cmsProductContentBottom && (
                            <section>
                                <div className="container">
                                    <CMS ns-code="product-content-bottom" content={cmsProductContentBottom.content || ''} hide_error />
                                </div>
                            </section>
                        )
                    }
                    <ModalR
                        animationDuration={0} classNames={{ modal: 'popup__container', overlay: 'popup active' }}
                        open={openModal} onClose={this.onCloseModal} center
                    >
                        {
                            product.type === 'bundle' ? (
                                <div className="modifier-popup__wrap">
                                    <h3 className="modifier-popup__header">{t('product-card:composeMenu')}</h3>
                                    <BundleProduct product={product} qty={selectedQty} onCloseModal={this.onCloseModal} />
                                </div>
                            ) : (
                                <>
                                    <h3 className="popup__title">{t('product:productAdded')} :</h3>{/* <!-- /.popup__title --> */}
                                    <div className="popup__body">
                                        <div className="product-simple">
                                            <figure className="product__image">
                                                <img src={imgDefault} alt={imgAlt} />
                                            </figure>{/* <!-- /.product__image --> */}

                                            <h4 className="product__title">{this.state.selectedQty} x {product.name}</h4>{/* <!-- /.product__title --> */}

                                            <div className="product__actions">
                                                <button type="button" className="site-btn sb-dark" onClick={this.onCloseModal}>
                                                {t('product:continueShopping')}
                                                </button>

                                                <Link route="cart" params={{ lang: routerLang }}>
                                                    <a className="site-btn">
                                                        {t('product:viewCart')}
                                                    </a>
                                                </Link>
                                            </div>{/* <!-- /.product__actions --> */}
                                        </div>{/* <!-- /.product-simple --> */}
                                    </div>{/* <!-- /.popup__body --> */}
                                </>
                            )
                        }
                    </ModalR>
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withRouter(withI18next(['product', 'common', 'product-card'])(PageProduct));
