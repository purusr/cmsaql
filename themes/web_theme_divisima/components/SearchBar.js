import React from 'react';
import { NSContext, NSSearchBar } from 'aqlrc';
import { withI18next } from '../lib/withI18n';

/**
 * Login - Barre de recherche (surcharge NSSearchBar)
 * @return {React.Component}
 */

class SearchBar extends NSSearchBar {
    render() {
        const { button, placeholder, t } = this.props;
        const { query } = this.state;
        return (
            <div className="col-xl-6 col-lg-5">
                <form className="header-search-form" onSubmit={(e) => this.searchProducts(e)}>
                    <input type="text" ref={this.search} placeholder={t('common:search')} onChange={(e) => this.setState({ query: e.target.value })} value={query} />
                    <button type="submit"><i className="flaticon-search"></i></button>
                </form>
            </div>
        );
    }

    static contextType = NSContext;
}

export default withI18next([])(SearchBar);
