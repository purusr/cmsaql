import React from 'react';
import { NSContext, NSToast, logoutUser } from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import { Link, Router } from '../routes';

/*
Ce composant affiche le menu du compte utilisateur
La page consultée est affichée en gras grâce à la props "active"
*/

class SidebarAccount extends React.Component {
    async logout() {
        // Déconnexion de l'utilisateur
        try {
            await logoutUser();
            // HOOK => onLogout
            if (this.context.props.hooksFunctions && this.context.props.hooksFunctions.onLogout) this.context.props.hooksFunctions.onLogout.map(func => func())
            Router.pushRoute('home');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    }

    render() {
        // Soit "" si anglais, soit /fr ou autre langue
        const { t } = this.props;
        const { active, user } = this.props;
        if (!user) return '';
        return (
            <div className="col-lg-3">
                <div className="entry-box entry-box--secondary">
                    <div className="entry__section">
                        <h5 className="entry__title">{t('common:monCompte')}</h5>{/* <!-- /.entry__title --> */}

                        <div className="entry__body">
                            <ul className="list-dots">
                                <li>
                                    {
                                        active === 'infos'
                                            ? <>{t('account:account.page.label.id')}</>
                                            : (<Link route="account"><a style={{ textDecoration: 'none' }}>{t('account:account.page.label.id')}</a></Link>)
                                    }
                                </li>

                                <li>
                                    {
                                        active === 'addresses'
                                            ? <>{t('account:sidebar.addresses')}</>
                                            : (<Link route="addresses"><a style={{ textDecoration: 'none' }}>{t('account:sidebar.addresses')}</a></Link>)
                                    }
                                </li>

                                <li>
                                    {
                                        active === 'rgpd'
                                            ? <>RGPD</>
                                            : (<Link route="rgpd"><a style={{ textDecoration: 'none' }}>RGPD</a></Link>)
                                    }
                                </li>
                            </ul>{/* <!-- /.list-dots --> */}
                        </div>{/* <!-- /.entry__body --> */}
                    </div>{/* <!-- /.entry__section --> */}
                    {t('account:orders.page.label.follow_my_order')}
                    <div className="entry__section">
                        <h5 className="entry__title">{t('account:sidebar:trackingOrder')}</h5>{/* <!-- /.entry__title --> */}

                        <div className="entry__body">
                            <ul className="list-dots">
                                <li>
                                    {
                                        active === 'orders'
                                            ? <>{t('account:sidebar.orders')}</>
                                            : (<Link route="orders"><a style={{ textDecoration: 'none' }}>{t('account:sidebar.orders')}</a></Link>)
                                    }
                                </li>
                            </ul>{/* <!-- /.list-dots --> */}
                        </div>{/* <!-- /.entry__body --> */}
                    </div>{/* <!-- /.entry__section --> */}

                    <div className="entry__actions">
                        <button type="button" className="site-btn sb-dark" onClick={() => this.logout()}>{t('account:sidebar.logout')}</button>
                    </div>{/* <!-- /.entry__actions --> */}
                </div>{/* <!-- /.entry-box --> */}
            </div>/* <!-- /.section__aside --> */
        );
    }

    static contextType = NSContext;
}
export default withI18next([])(SidebarAccount) ;
