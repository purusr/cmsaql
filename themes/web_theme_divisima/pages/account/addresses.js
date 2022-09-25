import React from 'react';
import axios from 'axios';
import Head from 'next/head';
import {
    NSPageAccount, NSAddressMultiple, NSContext, getCmsBlock, getLangPrefix
} from 'aqlrc';
import AccountStructure from '../../components/AccountStructure';
import Address from '../../components/Address';
import getAPIUrl from '../../lib/getAPIUrl';
import { withI18next } from '../../lib/withI18n';

/**
 * PageAddresses - Page des adresses client (surcharge NSPageAccount)
 * @return {React.Component}
 */

class PageAddresses extends NSPageAccount {
    static getInitialProps = async function (ctx) {
        const { cmsBlocks, lang } = ctx.nsGlobals;
        const resTerritories = await axios.post(`${getAPIUrl(ctx)}v2/territories`, { PostBody: { filter: { type: 'country' }, limit: 99 }, lang });
        const cmsLegalTxt = await getCmsBlock('legalTxt', cmsBlocks, lang, ctx);

        return {
            countries    : resTerritories.data.datas,
            cmsLegalTxt,
            userRequired : { url: '/login', route: 'auth' }
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/account/addresses`;
    }

    render() {
        const {
            countries, oCmsHeader, oCmsFooter, sitename, t, user
        } = this.props;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <AccountStructure user={user} active="addresses" title={t('account:sidebar.addresses')} oCmsHeader={oCmsHeader} oCmsFooter={oCmsFooter} sitename={sitename}>
                    <Address mode="account" countries={countries} />
                </AccountStructure>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['account', 'addresses'])(PageAddresses);
