import React from 'react';
import axios from 'axios';
import Head from 'next/head';
import {
    NSPageAccount, NSContext, NSSidebarAccount, NSToast, getLangPrefix, createOrUpdateUser, sendMailResetPasswordUser, updateNewsletterUser
} from 'aqlrc';
import AccountStructure from '../../components/AccountStructure';
import { Link, Router } from '../../routes';
import getAPIUrl from '../../lib/getAPIUrl';
import { withI18next } from '../../lib/withI18n';

/**
 * PageAccount - Page des coordonnées client (surcharge NSPageAccount)
 * @return {React.Component}
 */

class PageAccount extends NSPageAccount {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            password : {
                oldPassword     : '',
                newPassword     : '',
                confirmPassword : ''
            },
            optinNewsletter : false,
            open            : false
        };
    }

    componentDidMount = async () => {
        const { user } = this.state;
        try {
            const resNewsletter = await axios.get(`${getAPIUrl()}v2/newsletter/${user.email}`);
            // Si son adresse mail n'est pas trouvé dans optin des newsletter on ne fait rien (state.optinNewsletter étant déja a false)
            if (!resNewsletter.data) return;
            if (resNewsletter.data.segment.length) {
                this.setState({ optinNewsletter: resNewsletter.data.segment.find((n) => n.name === 'DefaultNewsletter').optin });
            }
        } catch (e) {
            console.error(e);
        }
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/account`;
    }

    handleFormChange = (event) => {
        const { user } = this.state;
        if (event.target.name.includes('.')) {
            const name = event.target.name.split('.')[1];
            user.company[name] = event.target.value;
        } else if (event.target.name === 'civility') {
            user[event.target.name] = Number(event.target.value);
        } else {
            user[event.target.name] = event.target.value;
        }
        return this.setState({ user });
    };

    sendMailResetPassword = async (event) => {
        event.preventDefault();
        const { lang } = this.props;
        const { user } = this.state;

        // Reset du password
        try {
            await sendMailResetPasswordUser(user.email, lang);
            NSToast.success('account:account.success_msg.mail_sent');
            this.setState({ open: false });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    }

    // Nico G : Vu avec Bertrand, on garde ça au chaud si jamais pour la suite
    /* handleActiveAccountMail = async () => {
        try {
            const { lang, user } = this.props;
            const resMail = await axios.get(`${getAPIUrl()}v2/mail/activation/account/sent/${user._id}/${lang}`);
            NSToast.success('account:account.success_msg.mail_sent');
        } catch (error) {
            console.error(error);
        }
    } */

    handlerOptinNewsletter = async () => {
        const { optinNewsletter } = this.state;
        this.setState({ optinNewsletter: !optinNewsletter });
    }

    saveForm = async (e) => {
        e.preventDefault();
        const { user, optinNewsletter } = this.state;


        try {
            // Modification de l'utilisateur
            await createOrUpdateUser(user);

            // Acceptation de la newletter
            await updateNewsletterUser(user.email, 'DefaultNewsletter', optinNewsletter);

            NSToast.success('account:account.success_msg.saved_info');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    };

    render() {
        const {
            langs, oCmsHeader, oCmsFooter, sitename, t
        } = this.props;
        const { user, optinNewsletter } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <AccountStructure user={user} active="infos" title={t('account:account.title')} oCmsHeader={oCmsHeader} oCmsFooter={oCmsFooter} sitename={sitename}>
                    <form className="checkout-form" onSubmit={this.saveForm}>
                        <div className="form__body">
                            <div className="form__row form__row--flex align-right">
                                <label htmlFor="field-email" className="form__label">{t('account:account.page.label.email')}<span>*</span></label>
                                <div className="form__controls" style={{ textAlign: 'end' }}>
                                    <input type="text" className="field" name="email" id="field-email" value={user.email} disabled />
                                    {
                                    /* user && !user.isActiveAccount
                                            ? (
                                                <div>
                                                    <a onClick={this.handleActiveAccountMail} style={{ fontSize: '12px' }}>{t('account:account.page.label.send_mail_verif')}</a>
                                                </div>
                                            )
                                            : '' */
                                    }
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}
                            <div className="form__row">
                                <div className="form__controls form__controls-password align-right" style={{ textAlign: 'end' }}>
                                    <button type="button" onClick={this.sendMailResetPassword} className="site-btn sb-dark">{t('account:account.page.label.change_password')}</button>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}
                            <div className="form__row">
                                <label htmlFor="field-language" className="form__label">{t('account:account.page.label.preferredLanguage')}</label>
                                <div className="form__controls">
                                    <div className="select">
                                        <div className="select__controls">
                                            <select name="preferredLanguage" id="field-language" className="field" value={user.preferredLanguage} onChange={(e) => this.handleFormChange(e)}>
                                                {
                                                    langs.map((l) => (
                                                        <option key={l.code} value={l.code}>
                                                            {l.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>
                            <div className="form__row">
                                <label htmlFor="field_lastname" className="form__label">{t('addresses:edit.titre')}<span>*</span></label>
                                <div className="form__controls" style={{ display: 'flex' }}>
                                    <div className="cf-radio-btns">
                                        <div className="cfr-item">
                                            <input type="radio" name="civility" id="field_civility_women" value={1} checked={Number(user.civility) === 1} onClick={this.handleFormChange} readOnly />
                                            <label htmlFor="field_civility_women" className="form__label">{t('addresses:edit.mme')}</label>
                                        </div>
                                    </div>
                                    <div className="cf-radio-btns" style={{ marginLeft: '20px' }}>
                                        <div className="cfr-item">
                                            <input type="radio" name="civility" id="field_civility_men" value={0} checked={Number(user.civility) === 0} onClick={this.handleFormChange} readOnly />
                                            <label htmlFor="field_civility_men" className="form__label">{t('addresses:edit.mr')}</label>
                                        </div>
                                    </div>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}


                            <div className="form__row">
                                <label htmlFor="field-lastname" className="form__label">{t('account:account.page.label.lastname')}<span>*</span></label>
                                <div className="form__controls" style={{ textAlign: 'end' }}>
                                    <input type="text" className="field" name="lastname" id="field-lastname" value={user.lastname} onChange={this.handleFormChange} required />
                                </div>
                            </div>
                            <div className="form__row">
                                <label htmlFor="field-firstname" className="form__label">{t('account:account.page.label.firstname')}<span>*</span></label>
                                <div className="form__controls" style={{ textAlign: 'end' }}>
                                    <input type="text" className="field" name="firstname" id="field-firstname" value={user.firstname} onChange={this.handleFormChange} required />
                                </div>
                            </div>
                            <div className="form__row">
                                <div className="checkbox">
                                    <input type="checkbox" name="optinNewsletter" id="field-newsletter" checked={optinNewsletter} value={optinNewsletter} onChange={this.handlerOptinNewsletter} />
                                    <label htmlFor="field-newsletter">
                                        {t('account:account.page.label.subscribe_newsletter')}
                                    </label>
                                </div>{/* <!-- /.checkbox --> */}
                            </div>
                            <div className="form__row">
                                <div className="form__controls form__controls-password align-right" style={{ textAlign: 'end' }}>
                                    <button type="submit" className="site-btn">{t('account:account.page.label.validate')}</button>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}
                            <div className="form__entry form__entry-spaced-right">
                                <div className="form__hint">
                                    <p>*{t('account:required_fields')}</p>
                                </div>{/* <!-- /.form__hint --> */}
                                <div>
                                    <div dangerouslySetInnerHTML={{ __html: this.props.cmsLegalTxt.content || '' }} />
                                </div>
                            </div>{/* <!-- /.form__entry form__entry-spaced-left --> */}
                        </div>{/* <!-- /.form__body --> */}
                    </form>
                </AccountStructure>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['account', 'addresses'])(PageAccount);
