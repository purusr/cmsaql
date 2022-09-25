import React from 'react';
import Head from 'next/head';
import { NSContext } from 'aqlrc';
import Layout from './Layout';
import SidebarAccount from './SidebarAccount';
import { withI18next } from '../lib/withI18n';
import { Link } from '../routes';

/*
Ce composant est le squelette de la structure des pages de type "/account"
*/

class AccountStructure extends React.Component {
    render() {
        const {
            active, children, oCmsHeader, oCmsFooter, sitename, title, user, t
        } = this.props;
        const { routerLang } = this.context.state;
        return (
            <Layout header={oCmsHeader.content} footer={oCmsFooter.content}>
                <Head>
                    <title>{sitename} | {title}</title>
                </Head>

                {/* <!-- Page info --> */}
                <div className="page-top-info">
                    <div className="container">
                        <h4>{t('account:title')}</h4>
                        <div className="site-pagination">
                            <Link route="home" params={{ lang: routerLang }}><a>{t('common:accueil')}</a></Link> / {t('account:sidebar.account')} / {title}
                        </div>
                    </div>
                </div>
                {/* <!-- Page info end --> */}

                <section className="account-section spad">
                    <div className="container">
                        <div className="row">
                            <SidebarAccount active={active} user={user} />

                            <div className="col-lg-9">
                                {user && children} {/* Contenu de la page de type "/account" */}
                            </div>{/* <!-- /.section__content --> */}
                        </div>{/* <!-- /.row --> */}
                    </div>{/* <!-- /.shell --> */}
                </section>{/* <!-- /.section --> */}
            </Layout>
        );
    };

    static contextType = NSContext;
}

export default withI18next(['login'])(AccountStructure); 
