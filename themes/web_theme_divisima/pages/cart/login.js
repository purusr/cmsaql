import React from 'react';
import Head from 'next/head';
import {
    NSContext, getCmsBlock, getLangPrefix
} from 'aqlrc';
import Layout from '../../components/Layout';
import Login from '../../components/Login';
import { withI18next } from '../../lib/withI18n';
import { Link, Router } from '../../routes';

/**
 * CartLogin - Page de connexion / inscription dans le panier
 * @return {React.Component}
 */

class CartLogin extends React.Component {
    static getInitialProps = async function (ctx) {
        const { cmsBlocks, lang } = ctx.nsGlobals;
        const cmsLegalTxt = await getCmsBlock('legalTxt', cmsBlocks, lang, ctx);

        return {
            cmsLegalTxt,
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props,
            email : ''
        };
    }

    componentDidMount = () => {
        const { routerLang, user } = this.state;
        if (user) {
            Router.pushRoute('cartCheckout', { lang: routerLang });
        }
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/cart/login`;
    }

    render() {
        const {
            oCmsHeader, oCmsFooter, sitename, t, routerLang
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
                            <h4>Connexion</h4>
                            <div className="site-pagination">
                                <Link route="home" params={{ lang: routerLang }}><a>{t('common:accueil')}</a></Link> / <Link route="cart" params={{ lang: routerLang }}><a>Votre panier</a></Link> / <a href="">Connexion</a>
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

export default withI18next(['login'])(CartLogin);
