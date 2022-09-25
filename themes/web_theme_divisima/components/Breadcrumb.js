import React from 'react';
import { NSContext } from 'aqlrc';
import { withI18next } from '../lib/withI18n';
import routes, { Link } from '../routes';

/*
Ce composant affiche le bouton "Mon compte" avec un lien vers la page "auth" si l'utilisateur n'est pas connecté ou "account" dans le cas contraire
*/

class Breadcrumb extends React.Component {
    render() {
        const { t } = this.props;
        const { breadcrumb } = this.context.state;
    
        return (
            <div className="site-pagination">
                {
                    breadcrumb.map((elem, index) => {                        
                        let route = null;
                        if (routes) {
                            route = routes.findAndGetUrls(elem.link); // Récupération de la route correspondante à l'URL (dans routes.js)
                        }
                        return (
                            <React.Fragment key={index}>
                                { index === 0 ? null : ' / ' }
                                <Link href={route.urls.href} as={route.urls.as}>
                                    <a>
                                        {elem.text === "Accueil" ? t('common:accueil') : elem.text}
                                    </a>
                                </Link>
                            </React.Fragment>
                        );
                    })
                }
            </div>
        );
    }
    static contextType = NSContext;
}

export default withI18next([])(Breadcrumb);