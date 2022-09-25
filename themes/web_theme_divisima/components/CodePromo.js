import React from 'react';
import PropTypes from 'prop-types';
import { NSCodePromo } from 'aqlrc';
import { withI18next } from '../lib/withI18n';

class CodePromo extends NSCodePromo {
    render() {
        const { t } = this.props;
        const { code, promo } = this.state;
        return (
            <>
                <form className="promo-code-form">
                    <input type="text" placeholder={t('page.code_promo.discount_label')} value={code} onChange={this.handleChange} />
                    <button type="button" onClick={promo ? this.remove : this.handleClick}>{promo ? t('page.code_promo.cancel') : t('common:valider')}</button>
                </form>
            </>
        );
    }
}

export default withI18next(['cart','common'])(CodePromo);
