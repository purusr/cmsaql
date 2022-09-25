import React from 'react';
import Head from 'next/head';
import { NSPageCategory, NSContext } from 'aqlrc';
import ReactPagination from 'react-js-pagination';
import Breadcrumb from '../components/Breadcrumb';
import Filters from '../components/Filters';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { listModulePage } from '../lib/utils';
import { Link, Router } from '../routes';
import { withI18next } from '../lib/withI18n';
import Error from './_error';

/**
 * PageCategory - Page catégorie (surcharge NSPageCategory)
 * @return {React.Component}
 */

class PageCategory extends NSPageCategory {
    render() {
        const {
            lang, notFound, nsCms_extraText, nsCms_extraText2, nsCms_extraText3, oCmsHeader, oCmsFooter, routerLang, sitename, t
        } = this.props;
        if (notFound) {
            return (
                <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                    <Error statusCode={404} message="Not found" oCmsHeader={oCmsHeader} oCmsFooter={oCmsFooter} />
                </NSContext.Provider>
            );
        }
        const {
            category, count, itemsPerPages, productsList, gridDisplay, filters, taxDisplay
        } = this.state;
        if (typeof window !== 'undefined' && /Mobi/.test(window.navigator.userAgent) && !gridDisplay) {
            this.setState({ gridDisplay: true });
            window.localStorage.setItem('gridDisplay', true);
        }
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {category.name !== undefined && category.name !== '' ? category.name : ''}</title>
                        {
                            category.metaDescription ? <meta name="description" content={category.metaDescription} /> : null
                        }
                        {parseInt(this.state.current, 0) === 2 && <link rel="prev" href={`${this.state.baseUrl}/`} />}
                        {parseInt(this.state.current, 0) > 2 && <link rel="prev" href={`${this.state.baseUrl}/${this.state.current - 1}`} />}
                        {parseInt(this.state.current, 0) < Math.ceil(count / itemsPerPages) && <link rel="next" href={`${this.state.baseUrl}/${this.state.current + 1}`} />}
                        <meta property="og:type" content="website" />
                    </Head>
                    <div>
                        {
                                        listModulePage('category-top', {onPageChange: this.onPageChange, category: category})
                        }
                    </div>

                    {/* <!-- Page info --> */}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>{category.name}</h4>
                            <Breadcrumb />
                        </div>
                    </div>
                    {/* <!-- Page info end --> */}


                    {/* <!-- Category section --> */}
                    <section className="category-section spad">
                        <div className="container">
                            {nsCms_extraText.content && <div className="row" dangerouslySetInnerHTML={{ __html: nsCms_extraText.content || '' }} />}
                            <div className="row">
                                {
                                    <Filters
                                        category={category}
                                        color="#f00"
                                        globalMin={this.state.globalMin}
                                        min={this.state.min}
                                        location={category.name}
                                        globalMax={this.state.globalMax}
                                        max={this.state.max}
                                        itemspp={itemsPerPages}
                                        page={this.state.current}
                                        t={t}
                                        reload={this.onPageChange}
                                        key={category._id}
                                    />
                                }

                                <div className="col-lg-9  order-1 order-lg-2 mb-5 mb-lg-0">
                                    {nsCms_extraText2.content && <div className="row" dangerouslySetInnerHTML={{ __html: nsCms_extraText2.content || '' }} />}
                                    <div className="row paging" hidden={count <= itemsPerPages}>
                                        <ReactPagination
                                            hideDisabled
                                            hideFirstLastPages
                                            activePage={this.state.current}
                                            itemsCountPerPage={itemsPerPages}
                                            totalItemsCount={count}
                                            pageRangeDisplayed={5}
                                            onChange={(page) => this.onPageChange(page, itemsPerPages, undefined, filters)}
                                            prevPageText={<span>&lt;</span>}
                                            nextPageText={<span>&gt;</span>}
                                        />
                                    </div>
                                    <div className="row">
                                    {
                                        productsList.map((product, index) => {
                                            return (
                                                <div className="col-lg-4 col-sm-6" key={product._id}>
                                                    <ProductCard from="category" gridDisplay={gridDisplay} type="data" value={product} t={t} gNext={{ Head, Link, Router }} />
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        productsList.length === 0 && <p style={{ textAlign: 'center', width: '100%' }}>{t('aucunResultat')}</p>
                                    }
                                    </div>
                                    <div className="row paging" hidden={count <= itemsPerPages}>
                                        <ReactPagination
                                            hideDisabled
                                            hideFirstLastPages
                                            activePage={this.state.current}
                                            itemsCountPerPage={itemsPerPages}
                                            totalItemsCount={count}
                                            pageRangeDisplayed={5}
                                            onChange={(page) => this.onPageChange(page, itemsPerPages, undefined, filters)}
                                            prevPageText={<span>&lt;</span>}
                                            nextPageText={<span>&gt;</span>}
                                        />
                                    </div>
                                    {nsCms_extraText3.content && <div className="row" dangerouslySetInnerHTML={{ __html: nsCms_extraText3.content || '' }} />}
                                </div>
                            </div>
                        </div>
                    
                    </section>
                    {/* <!-- Category section end --> */}
                    <div>
                        {
                            listModulePage('category-bottom', {onPageChange: this.onPageChange, category: category})
                        }
                    </div>

                </Layout>
            </NSContext.Provider>
        );
    }

    static defaultProps = {
        contentHtml : {
            content : '',
        },
        category : {
            productsList : [],
            filters      : [],
        },
        oCmsHeader : {
            content : '',
        },
        productsList : [],
        min          : 0,
        max          : 0,
        count        : 0,
        oCmsFooter   : {
            content : '',
        }
    };
}

export default withI18next(['category', 'product-card'])(PageCategory);
