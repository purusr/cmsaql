import React from 'react';
import Head from 'next/head';
import { NSContext, getCmsBlock, getLangPrefix } from 'aqlrc';
import Layout from '../components/Layout';
import Login from '../components/Login';
import { withI18next } from '../lib/withI18n';
import { Router } from '../routes';

/**
 * Auth - Page d'authentification
 * @return {React.Component}
 */

class Auth extends React.Component {
    static getInitialProps = async function (ctx) {
        const { cmsBlocks, lang } = ctx.nsGlobals;
        const cms = await getCmsBlock(['legalTxt', 'login'], cmsBlocks, lang, ctx);
        return {
            ...cms
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    componentDidMount = () => {
        const { routerLang, user } = this.state;
        if (user) {
            Router.pushRoute('account', { lang: routerLang });
        }
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/login`;
    }

    render() {
        const {
            oCmsHeader, oCmsFooter, sitename, t
        } = this.props;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                    <Head>
                        <title>{sitename} | {t('login:page.title')}</title>
                        <meta property="og:type" content="website" />
                    </Head>

                    {/* <!-- Page info --> */}
                    <div className="page-top-info">
                        <div className="container">
                            <h4>{t('common:steps.connexion')}</h4>
                            <div className="site-pagination">
                                <a href="">{t('common:accueil')}</a> / <a href="">{t('common:steps.connexion')}</a>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Page info end --> */}

                    <section className="login-section spad">
                        <Login gNext={{ Router }} />
                    </section>
                </Layout>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['login'])(Auth);
