import React from 'react';
import axios from 'axios';
import { NSContext, NSLogin, NSToast, authUser, createOrUpdateUser, updateNewsletterUser } from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import { Router } from '../routes';
import { listModulePage } from '../lib/utils';

/**
 * Login - Formulaire de connexion / inscription (surcharge NSLogin)
 * @return {React.Component}
 */

class Login extends NSLogin {
    loginRequest = async (email, password) => {
        const { routerLang } = this.context.state;

        // Authentification
        try {
            await authUser(email, password);

            window.localStorage.removeItem('globalMinMaxFilter');
            let route = 'account';
            if (window.location.pathname.indexOf('cart') > -1) {
                route = 'cartCheckout';
            }
            Router.pushRoute(route, { lang: routerLang });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
        }
    };

    handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const {
            subUser, address, subscribeNL
        } = this.state;
        const { lang, routerLang, urlLang } = this.context.state;
        const {
            password, passwordConfirm, email, confirmEmail,
        } = subUser;
        if (password !== passwordConfirm) {
            NSToast.error('login:error_msg.password_mismatch');
            subUser.password = '';
            subUser.passwordConfirm = '';
            return this.setState({ subUser });
        }
        if (email !== confirmEmail) {
            NSToast.error('login:error_msg.mail_mismatch');
            subUser.confirmEmail = '';
            return this.setState({ subUser });
        }
        if (subUser.civility === undefined) {
            return NSToast.warn('login:error_msg.choose_civility');
        }
        if (subscribeNL === undefined) {
            return NSToast.warn('login:error_msg.no_news_letter_choice');
        }
        address.firstname = subUser.firstname;
        address.lastname = subUser.lastname;
        address.companyName = subUser.company.name;
        address.civility = subUser.civility;
        subUser.addresses = [address, address];
        subUser.billing_address = 0;
        subUser.delivery_address = 1;
        subUser.preferredLanguage = lang;
        subUser.lang = lang;

        // Inscription
        try {
            await createOrUpdateUser(subUser);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
            return;
        }

        if (subscribeNL) {
            // Acceptation de la newsletter
            try {
                await updateNewsletterUser(subUser.email, 'DefaultNewsletter', subscribeNL);
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    NSToast.error(err.response.data.message);
                } else {
                    NSToast.error('common:error_occured');
                    console.error(err);
                }
            }
        }

        // Authentification
        try {
            const res = await authUser(subUser.email, subUser.password);

            axios.defaults.headers.common.Authorization = res.data.data;
            NSToast.success('login:valid_msg.register');
            window.localStorage.removeItem('globalMinMaxFilter');
            Router.pushRoute(window.location.pathname.indexOf('/cart') > -1 ? 'cartCheckout' : 'account', { lang: routerLang });
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
        const { t } = this.props;
        const {
            emailResetPassword, step, user, address, countries, subUser, subscribeNL
        } = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <form className="checkout-form" onSubmit={this.handleRegisterSubmit} method="post">
                            <div className="cf-title">
                            {t('page.client_sign_up.title')}<br />
                                <small>{t('page.client_sign_up.sub_title')}</small>
                            </div>{/* <!-- /.cf-title --> */}
                            <div className="form__row">
                                <label htmlFor="field_lastname" className="form__label">{t('page.client_sign_up.civility.label')}<span>*</span></label>
                                <div className="form__controls" style={{ display: 'flex' }}>
                                    <div className="checkbox checkbox--radio">
                                        <input type="radio" name="civility" id="field_civility_women" value="1" onChange={(e) => this.handleChangeSub(e)} />
                                        <label htmlFor="field_civility_women" className="form__label">{t('page.client_sign_up.civility.female')}</label>
                                    </div>
                                    <div className="checkbox checkbox--radio" style={{ marginLeft: '20px' }}>
                                        <input type="radio" name="civility" id="field_civility_men" value="0" onChange={(e) => this.handleChangeSub(e)} />
                                        <label htmlFor="field_civility_men" className="form__label">{t('page.client_sign_up.civility.male')}</label>
                                    </div>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_lastname" className="form__label">{t('page.client_sign_up.lastname.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="lastname" id="field_lastname" value={subUser.lastname} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_firstname" className="form__label">{t('page.client_sign_up.firstname.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="firstname" id="field_firstname" value={subUser.firstname} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_zipcode" className="form__label">{t('page.client_sign_up.company.label')}</label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/companyName" id="field_companyName" value={address.companyName} onChange={(e) => this.handleChangeSub(e)} />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_address" className="form__label">{t('page.client_sign_up.address.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/line1" id="field_address" value={address.line1} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_address2" className="form__label">{t('page.client_sign_up.address_complementary.label')}</label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/line2" id="field_address2" value={address.line2} onChange={(e) => this.handleChangeSub(e)} />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_city" className="form__label">{t('page.client_sign_up.city.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/city" id="field_city" value={address.city} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_zipcode" className="form__label">{t('page.client_sign_up.zip.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/zipcode" id="field_zipcode" value={address.zipcode} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_country" className="form__label">{t('page.client_sign_up.country.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <div className="select">
                                        <div className="select__controls">
                                            <select defaultValue="" className="field" name="address/isoCountryCode" id="field_country" value={address.isoCountryCode} onChange={(e) => this.handleChangeSub(e)} required>
                                                <option value="">--</option>
                                                {
                                                    countries.map((c) => (<option key={c._id} value={c.code}>{c.name}</option>))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form__row">
                                <label htmlFor="field_phone" className="form__label">{t('page.client_sign_up.phone.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="text" className="field" name="address/phone" id="field_phone" value={address.phone} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_password" className="form__label">{t('page.client_sign_up.password.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="password" className="field" name="password" id="field_password" value={subUser.password} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_passwordConfirm" className="form__label">{t('page.client_sign_up.password_confirm.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="password" className="field" name="passwordConfirm" id="field_passwordConfirm" value={subUser.passwordConfirm} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_email" className="form__label">{t('page.client_sign_up.email.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="email" className="field" name="email" id="field_email" value={subUser.email} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <label htmlFor="field_confirmEmail" className="form__label">{t('page.client_sign_up.email_confirm.label')}<span>*</span></label>

                                <div className="form__controls">
                                    <input type="email" className="field" name="confirmEmail" id="field_confirmEmail" value={subUser.confirmEmail} onChange={(e) => this.handleChangeSub(e)} required />
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__row">
                                <div className="form__controls">
                                    <div className="checkbox">
                                        <input type="checkbox" name="newsletter" id="field_newsletter" checked={subscribeNL} value={subscribeNL} onChange={() => this.setState({ subscribeNL: !subscribeNL })} />
                                        <label htmlFor="field_newsletter" className="form__label">{t('page.client_sign_up.commercial_ads.label')}</label>
                                    </div>
                                </div>{/* <!-- /.form__controls --> */}
                            </div>{/* <!-- /.form__row --> */}

                            <div className="form__actions">
                                <button type="submit" className="site-btn">{t('page.nav.sign_in')}</button>
                            </div>{/* <!-- /.form__actions --> */}
                        </form>
                    </div>{/* <!-- /.col --> */}

                    <div className="col-lg-6">
                        {
                            step === 1 ? (
                                <form className="checkout-form" onSubmit={(e) => this.handleResetSubmit(e)} method="post">
                                    <div className="cf-title">
                                        {t('page.client_forgot_password.title')}<br />
                                        <small>{t('page.client_forgot_password.sub_title')}</small>
                                    </div>{/* <!-- /.cf-title --> */}
                                    <div className="form__row">
                                        <label htmlFor="email_login" className="form__label">{t('page.client_forgot_password.email.label')}</label>

                                        <div className="form__controls">
                                            <input type="email" className="field" name="field_email" id="email_login" value={emailResetPassword} onChange={(e) => this.handleResetPassword(e)} />
                                        </div>{/* <!-- /.form__controls --> */}
                                    </div>{/* <!-- /.form__row --> */}

                                    <div className="form__actions">
                                        <button type="button" className="site-btn sb-dark" onClick={() => this.setState({ step: 0 })}>{t('page.client_forgot_password.return')}</button>
                                        &nbsp;&nbsp;&nbsp;
                                        <button type="submit" className="site-btn">{t('common:valider')}</button>
                                    </div>{/* <!-- /.form__actions --> */}
                                </form>
                            ) : (
                                <form className="checkout-form" onSubmit={this.handleLoginSubmit} method="post">
                                    <div className="cf-title">
                                        {t('page.client_sign_in.title')}<br />
                                        <small>{t('page.client_sign_in.sub_title')} :</small>
                                    </div>{/* <!-- /.cf-title --> */}
                                    <div className="form__row">
                                        <label htmlFor="email_login" className="form__label">{t('page.client_sign_in.email.label')}</label>

                                        <div className="form__controls">
                                            <input type="email" className="field" name="field_email_old_client" id="email_login" value={user.email} />
                                        </div>{/* <!-- /.form__controls --> */}
                                    </div>{/* <!-- /.form__row --> */}

                                    <div className="form__row">
                                        <label htmlFor="password_login" className="form__label">{t('page.client_sign_in.password.label')}</label>

                                        <div className="form__controls">
                                            <input type="password" className="field" name="field_password" id="password_login" value={user.password} />
                                        </div>{/* <!-- /.form__controls --> */}
                                    </div>{/* <!-- /.form__row --> */}

                                    <div className="form__actions">
                                        <button type="button" className="site-btn sb-dark" onClick={() => this.setState({ step: 1 })}>{t('page.client_sign_in.forgot_password')}</button>
                                        &nbsp;&nbsp;&nbsp;
                                        <button type="submit" className="site-btn">{t('page.client_sign_in.login_label')}</button>
                                    </div>{/* <!-- /.form__actions --> */}

                                    <div className="form__row" style={{ textAlign: 'center' }}>
                                        {
                                            listModulePage('auth')
                                        }
                                    </div>{/* <!-- /.form__row --> */ }
                                </form>
                            )
                        }
                    </div>{/* <!-- /.col --> */}
                </div>{/* <!-- /.step --> */}
            </div>/* <!-- /.steps__body --> */
        );
    }

    static contextType = NSContext;
}

export default withI18next(['login'])(Login);
