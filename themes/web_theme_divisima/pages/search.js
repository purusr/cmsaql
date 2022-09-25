import React from 'react';
import Head from 'next/head';
import {
    NSPageSearch, NSContext, getLangPrefix, getProduct
} from 'aqlrc';
import ReactPaginate from 'react-paginate';
import { withRouter } from 'next/router';
import Filters from '../components/Filters';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { withI18next } from '../lib/withI18n';
import { Link, Router } from '../routes';

/**
 * PageSearch - Page de recherche (surcharge NSPageSearch)
 * @return {React.Component}
 */

class PageSearch extends NSPageSearch {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            itemsPerPages : 15,
            productsList  : props.products,
            selectedSort  : JSON.stringify({ field: 'sortWeight', sortValue: -1 }),
            gridDisplay   : false,
        };
    }

    componentDidMount = () => {
        // Si un seul produit est trouvé alors on va directement sur la page du produit
        if (this.props.products.length === 1) {
            Router.pushRoute(this.props.products[0].canonical);
        }
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/search/${this.props.router.query.search}`;
    }

    render() {
        const {
            baseUrl, lang, oCmsHeader, oCmsFooter, sitename, t
        } = this.props;
        const {
            count, current, filters, gridDisplay, itemsPerPages, products, taxDisplay
        } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {this.props.router.query.search}</title>
                        {/* <meta name="description" content={category.metaDescription} /> */}
                        {parseInt(current, 10) === 2 && <link rel="prev" href={`${baseUrl}/`} />}
                        {parseInt(current, 10) > 2 && <link rel="prev" href={`${baseUrl}/${current - 1}`} />}
                        {parseInt(current, 10) < Math.ceil(count / itemsPerPages) && <link rel="next" href={`${baseUrl}/${parseInt(current, 10) + 1}`} />}
                        <meta property="og:type" content="website" />
                    </Head>

                    {/* <!-- Category section --> */}
                    <section className="category-section spad">
                        <div className="container">
                            <div className="row">
                                {
                                    <Filters
                                        search={this.props.router.query.search}
                                        color="#f00"
                                        globalMin={this.state.globalMin}
                                        min={this.state.min}
                                        location="search"
                                        globalMax={this.state.globalMax}
                                        max={this.state.max}
                                        itemspp={itemsPerPages}
                                        page={this.state.current}
                                        t={t}
                                        reload={this.onPageChange}
                                    />
                                }

                                <div className="col-lg-9  order-1 order-lg-2 mb-5 mb-lg-0">
                                    <div className="row">
                                    {
                                        products.map((product) => {
                                            return (
                                                <div className="col-lg-4 col-sm-6" key={product._id}>
                                                    <ProductCard from="search" gridDisplay={gridDisplay} type="data" value={product} t={t} gNext={{ Head, Link, Router }} />
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        products.length === 0 && <p style={{ textAlign: 'center', width: '100%' }}>{t('aucunResultat')}</p>
                                    }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* <!-- Category section end --> */}
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withRouter(withI18next(['category', 'product-card'])(PageSearch));
