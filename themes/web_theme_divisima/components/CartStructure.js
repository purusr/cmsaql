import React from 'react';
import Head from 'next/head';
import { NSContext } from 'aqlrc';
import { Router } from '../routes';
import Layout from './Layout';
import { withI18next } from '../lib/withI18n';

/**
 * CartStructure - Squelette du panier
 * @return {React.Component}
 */

class CartStructure extends React.Component {
    render() {
        const {
            oCmsHeader, oCmsFooter, step, t
        } = this.props;
        return (
            <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                <Head />
                <div className="main">
                    <div className="steps">
                        <div className="shell">
                            <header className="steps__head">
                                <nav className="steps__nav">
                                    <ul>
                                        <li className={step >= 1 ? 'active' : null}>
                                            <span className="steps__nav-icon">1</span>

                                            <span className="steps__nav-title">{t('login:page.nav.login')}</span>
                                        </li>

                                        <li className={step >= 2 ? 'active' : null}>
                                            <span className="steps__nav-icon">2</span>

                                            <span className="steps__nav-title">{t('common:steps.connexion')}</span>
                                        </li>

                                        <li className={step >= 3 ? 'active' : null}>
                                            <span className="steps__nav-icon">3</span>

                                            <span className="steps__nav-title">{t('success:delivery')}</span>
                                        </li>

                                        <li className={step >= 4 ? 'active' : null}>
                                            <span className="steps__nav-icon">4</span>

                                            <span className="steps__nav-title">{t('common:steps.paiement')}</span>
                                        </li>

                                        <li className={step === 5 ? 'active' : null}>
                                            <span className="steps__nav-icon">
                                                <i className="icon-css-check" />
                                            </span>

                                            <span className="steps__nav-title">{t('common:steps.confirmation')}</span>
                                        </li>
                                    </ul>
                                </nav>{/* <!-- /.steps__nav --> */}
                            </header>{/* <!-- /.steps__head --> */}

                            {this.props.children}

                        </div>{/* <!-- /.shell --> */ }
                    </div>{/* <!-- /.steps --> */ }
                </div>{/* <!-- /.main --> */ }
            </Layout>
        );
    }

    static contextType = NSContext;

    static defaultProps = {
        isClickable : true,
    }
}

export default withI18next(['common', 'cart'])(CartStructure);
