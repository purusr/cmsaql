import React from 'react';
import { NSCartProductCounter, NSContext } from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import { Link } from '../routes';


class CartProductCounter extends NSCartProductCounter {
    render() {
        const { t } = this.props;
        const { cart } = this.state;
        const { routerLang } = this.context.state;
        return (
            <div className="up-item">
                <div className="shopping-card">
                    <i className="flaticon-bag"></i> <span>{cart && cart.items && cart.items.filter((item) => !item.typeDisplay).length > 0 ? cart.items.filter((item) => !item.typeDisplay).length : '0'}</span>
                </div>
                <Link route="cart" params={{ lang: routerLang }}>
                    <a>{t('common:panier')}</a>
                </Link>
            </div>
        );
    }

    static contextType = NSContext;
}

export default withI18next(['common'])(CartProductCounter);
