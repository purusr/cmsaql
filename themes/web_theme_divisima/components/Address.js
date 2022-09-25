import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
    NSAddressMultiple, NSContext, NSToast, scrollToTop, updateAddressUser
} from 'aqlrc';
import { Router } from '../routes';
import getAPIUrl from '../lib/getAPIUrl';
import { withI18next } from '../lib/withI18n';


class Address extends NSAddressMultiple {
    /**
     * Permet de créer une nouvelle adresse (ajout d'une adresse dans user.addresses)
     * @param {*} e event js
     * @returns {void}
     */
    addAddress = async (e) => {
        e.preventDefault();

        const { address, user } = this.state;
        const { idx_delivery_address, idx_billing_address } = address;
        delete address.idx_delivery_address;
        delete address.idx_billing_address;
        address.civility = Number(address.civility);
        if (address._id) {
            const idx = user.addresses.findIndex((adrs) => adrs._id === address._id);
            if (idx >= 0) {
                user.addresses[idx] = address;
            }
        } else {
            delete address._id;
            user.addresses.push(address);
        }
        const billingAddress = (idx_billing_address >= 0 && idx_billing_address !== '') ? Number(idx_billing_address) : Number(user.billing_address);
        const deliveryAddress = (idx_delivery_address >= 0 && idx_delivery_address !== '') ? Number(idx_delivery_address) : Number(user.delivery_address);

        // Ajout de l'adresse
        try {
            const newUser = await updateAddressUser(user._id, billingAddress, deliveryAddress, user.addresses);

            this.setState({
                user     : newUser,
                editMode : false,
            }, () => { 
                if (this.props.handleEditAddress) {
                    this.props.handleEditAddress(false);
                    document.querySelector('.step1').scrollIntoView();
                } else {
                    document.querySelector('.page-top-info').scrollIntoView();
                }
            });
            NSToast.success('addresses:success.addressUpdateSuccess');
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
        const { countries, mode, t } = this.props;
        const {
            address, editMode, routerLang, user
        } = this.state;
        const { state } = this.context;
        if (!state) { return null; }
        if (user.addresses.length === 0 && editMode && !address.lastname) {
            this.setState({
                address : {
                    firstname           : user.firstname || '',
                    lastname            : user.lastname || '',
                    phone               : user.phone || '',
                    idx_billing_address : 0
                }
            });
        }
        return (
            <div className="section__body">
                {
                    editMode === false && (
                        <div className="section__container">
                            <form className="checkout-form">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="box-border">
                                            <div className="cf-title">{t('list.adresseFacturation')}</div>

                                            <div className="box__entry">
                                                <p>
                                                    {user.addresses[user.billing_address].firstname} {user.addresses[user.billing_address].lastname}<br />
                                                    {user.addresses[user.billing_address].line1}<br />
                                                    {user.addresses[user.billing_address].line2 ? <>{user.addresses[user.billing_address].line2}<br /></> : null}
                                                    {user.addresses[user.billing_address].zipcode} {user.addresses[user.billing_address].city} <br />
                                                    {user.addresses[user.billing_address].isoCountryCode} <br />
                                                </p>

                                                <p>T. {user.addresses[user.billing_address].phone}</p>
                                            </div>{/* <!-- /.box__entry --> */}

                                            <div className="box__actions">
                                                <button type="button" className="site-btn" onClick={() => this.setState({ editMode: true, address: { ...user.addresses[user.billing_address] }, index: user.billing_address }, () => { 
                                                    if (this.props.handleEditAddress) {
                                                        this.props.handleEditAddress(true);
                                                        document.querySelector('.step1').scrollIntoView();
                                                    } else {
                                                        document.querySelector('.page-top-info').scrollIntoView();
                                                    }
                                                })}>
                                                    {t('list.modifier')}
                                                </button>
                                            </div>{/* <!-- /.box__actions --> */}
                                        </div>{/* <!-- /.box-border --> */}
                                    </div>{/* <!-- /.col --> */}

                                    <div className="col-lg-6">
                                        <div className="box-border">
                                            <div className="cf-title">{t('list.adresseLivraison')}</div>
                                            
                                            {(this.isInCheckout() && state.cart && state.cart.orderReceipt.method === 'withdrawal') && (
                                                <div className="box__entry">
                                                    <p>
                                                        {state.cart.addresses.delivery.companyName}<br />
                                                        {state.cart.addresses.delivery.line1}<br />
                                                        {state.cart.addresses.delivery.line2 ? <>{state.cart.addresses.delivery.line2}<br /></> : null}
                                                        {state.cart.addresses.delivery.zipcode} {state.cart.addresses.delivery.city} <br />
                                                        {state.cart.addresses.delivery.isoCountryCode} <br />
                                                    </p>
                                                </div>/* <!-- /.box__entry --> */
                                            )}
                                            {(!this.isInCheckout() || !state.cart || state.cart.orderReceipt.method !== 'withdrawal') && (
                                                <>
                                                    <div className="box__entry">
                                                        <p>
                                                            {user.addresses[user.delivery_address].firstname} {user.addresses[user.delivery_address].lastname}<br />
                                                            {user.addresses[user.delivery_address].line1}<br />
                                                            {user.addresses[user.delivery_address].line2 ? <>{user.addresses[user.delivery_address].line2}<br /></> : null}
                                                            {user.addresses[user.delivery_address].zipcode} {user.addresses[user.delivery_address].city} <br />
                                                            {user.addresses[user.delivery_address].isoCountryCode} <br />
                                                        </p>

                                                        <p>T. {user.addresses[user.delivery_address].phone}</p>
                                                    </div>{/* <!-- /.box__entry --> */}

                                                    <div className="box__actions">
                                                        <button type="button" className="site-btn" onClick={() => this.setState({ editMode: true, address: { ...user.addresses[user.delivery_address] }, index: user.delivery_address}, () => {
                                                            if (this.props.handleEditAddress) {
                                                                this.props.handleEditAddress(true);
                                                                document.querySelector('.step1').scrollIntoView();
                                                            } else {
                                                                document.querySelector('.page-top-info').scrollIntoView();
                                                            }
                                                        })}>
                                                            {t('list.modifier')}
                                                        </button>
                                                    </div>{/* <!-- /.box__actions --> */}
                                                </>
                                            )}
                                        </div>{/* <!-- /.box-border --> */}
                                    </div>{/* <!-- /.col --> */}
                                </div>{/* <!-- /.cols --> */}
                            </form>{/* <!-- /.boxes-border --> */}
                        </div>/* <!-- /.section__container --> */
                    )
                }
                {
                    editMode === true && (
                        <div className="section__container section__container--large">
                            <div className="form form--coordinates">
                                <form className="checkout-form" onSubmit={this.addAddress} method="post">
                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <div className="form__controls" style={{ display: 'flex' }}>
                                                    <div className="cf-radio-btns">
                                                        <div className="cfr-item">
                                                            <input type="radio" name="civility" id="field_civility_women" value={1} defaultChecked={address.civility === 1} onClick={(e) => this.handleAddressChange(e)} />
                                                            <label htmlFor="field_civility_women" className="form__label">{t('addresses:edit.mme')}</label>
                                                        </div>
                                                    </div>
                                                    <div className="cf-radio-btns" style={{ marginLeft: '20px' }}>
                                                        <div className="cfr-item">
                                                            <input type="radio" name="civility" id="field_civility_men" value={0} defaultChecked={address.civility === 0} onClick={(e) => this.handleAddressChange(e)} />
                                                            <label htmlFor="field_civility_men" className="form__label">{t('addresses:edit.mr')}</label>
                                                        </div>
                                                    </div>
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_name" className="form__label">{t('account:account.page.label.lastname')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="lastname" id="field_name" value={address.lastname} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}

                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_surname" className="form__label">{t('account:account.page.label.firstname')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="firstname" id="field_surname" value={address.firstname} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_company" className="form__label">{t('login:page.client_sign_up.company.label')}</label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="companyName" id="field_company" value={address.companyName} onChange={(e) => this.handleAddressChange(e)} />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}

                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_phone" className="form__label">{t('login:page.client_sign_up.phone.label')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="tel" className="field" name="phone" id="field_phone" value={address.phone} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_address" className="form__label">{t('login:page.client_sign_up.address.label')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="line1" id="field_address" value={address.line1} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}

                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_address_1" className="form__label">{t('login:page.client_sign_up.address_complementary.label')}</label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="line2" id="field_address_1" value={address.line2} onChange={(e) => this.handleAddressChange(e)} />

                                                    <span className="form__controls-meta">{t('login:page.client_sign_up.address_complementary.info')}</span>
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_post_code" className="form__label">{t('login:page.client_sign_up.zip.label')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="zipcode" id="field_post_code" value={address.zipcode} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}

                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_city" className="form__label">{t('login:page.client_sign_up.city.label')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <input type="text" className="field" name="city" id="field_city" value={address.city} onChange={(e) => this.handleAddressChange(e)} required />
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="cols">
                                        <div className="col">
                                            <div className="form__row">
                                                <label htmlFor="field_country" className="form__label">{t('login:page.client_sign_up.country.label')}<span>*</span></label>

                                                <div className="form__controls">
                                                    <div className="select">
                                                        <div className="select__controls">
                                                            <select
                                                                name="country"
                                                                id="field-country"
                                                                className="field"
                                                                value={address.isoCountryCode}
                                                                onChange={(e) => this.handleAddressChange(e)}
                                                                required
                                                            >
                                                                <option value="">-</option>
                                                                {
                                                                    countries.map((country) => (
                                                                        <option key={country._id} value={country.code}>
                                                                            {country.name}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>{/* <!-- /.form__controls --> */}
                                            </div>{/* <!-- /.form__row --> */}
                                        </div>{/* <!-- /.col --> */}
                                    </div>{/* <!-- /.cols --> */}

                                    <div className="form__foot">
                                        <span className="form__meta">{t('login:page.client_sign_up.required_label')}</span>
                                    </div>{/* <!-- /.form__foot --> */}

                                    <div className="step__actions">
                                        <button type="button" className="site-btn sb-dark" onClick={() => this.setState({ editMode: false }, () => {
                                            if (this.props.handleEditAddress) {
                                                this.props.handleEditAddress(false);
                                                document.querySelector('.step1').scrollIntoView();
                                            } else {
                                                document.querySelector('.page-top-info').scrollIntoView();
                                            }
                                        })}>
                                            {t('cart:page.cart.cancel')}
                                        </button>
                                        &nbsp;&nbsp;&nbsp;
                                        <button type="submit" className="site-btn">
                                            {t('category:confirmer')}
                                        </button>
                                    </div>{/* <!-- /.step__actions --> */}
                                </form>
                            </div>{/* <!-- /.form --> */}
                        </div>/* <!-- /.section__container --> */
                    )
                }
            </div>/* <!-- /.section__body --> */
        );
    }

    static contextType = NSContext;

    static defaultProps = {
        state : { address: {}, user: { company: {} } },
    }
}

export default withI18next(['addresses', 'payment','login','cart'])(Address);
