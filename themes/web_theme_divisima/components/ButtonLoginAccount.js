import React from 'react';
import { NSButtonLoginAccount, NSContext } from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import { Link } from '../routes';

/*
Ce composant affiche le bouton "Mon compte" avec un lien vers la page "auth" si l'utilisateur n'est pas connecté ou "account" dans le cas contraire
*/

class ButtonLoginAccount extends NSButtonLoginAccount {
    render() {
        const { t } = this.props;
        const { routerLang, user } = this.context.state;
        return (
            <div className="up-item">
                <i className="flaticon-profile"></i>
                <Link route={user ? 'account' : 'auth'} params={{ lang: routerLang }}>  
                    <a>{user ? t('common:monCompte') : t('common:connecter')}</a>
                </Link>
            </div>
        );
    }

    static contextType = NSContext;
}

export default withI18next([])(ButtonLoginAccount);
