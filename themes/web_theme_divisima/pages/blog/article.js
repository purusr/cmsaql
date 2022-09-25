import React from 'react';
import moment from 'moment';
import Head from 'next/head';
import { NSPageBlogArticle, NSContext } from 'aqlrc';
import Breadcrumb from '../../components/Breadcrumb';
import Layout from '../../components/Layout';
import routes, { Link } from '../../routes';
import { withI18next } from '../../lib/withI18n';

/**
 * PageBlogArticle - Page article de blog (surcharge NSPageBlogArticle)
 * @return {React.Component}
 */

class PageBlogArticle extends NSPageBlogArticle {
    render() {
        const {
            article, lang, oCmsHeader, oCmsFooter, sitename
        } = this.props;
        let pathUrl = this.props.pathUrl;
        if (pathUrl === '') {
            pathUrl = window.location.href;
        }
        const url = pathUrl ? `${pathUrl.split('/')[0]}//${pathUrl.split('/')[2]}` : '';
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | Blog</title>
                        <meta property="og:type" content="website" />
                    </Head>

                    {/* <!-- Page info --> */}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>Blog</h4>
                            <Breadcrumb />
                        </div>
                    </div>
                    {/* <!-- Page info end --> */}

                    <section className="article-section">
                        <div className="container">
                            <h4 className="section__title">
                                <span itemProp="headline">{article.title}</span>
                            </h4>

                            <div className="container_img_body">
                                <div itemProp="image" itemScope="" itemType="http://schema.org/ImageObject">
                                    <meta itemProp="url" content={`${url}/${article.img}`} />
                                </div>

                                <div className="section__body">
                                    <div className="article-date" itemProp="datePublished" content={moment(article.createdAt).format('DD/MM/YYYY - HH[h]mm')}>
                                        {moment(article.createdAt).format('DD/MM/YYYY - HH[h]mm')}
                                    </div>
                                    <div itemProp="articleBody" className="ns-article-content" dangerouslySetInnerHTML={{ __html: (article.img ? `<img src="/images/blog/300x300/${article._id}/${article.slug[lang]}${article.extension}" alt="${article.title}" />` : '') + article.content.text }} />
                                </div>
                            </div>
                        </div>
                    </section>
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['article'])(PageBlogArticle);
