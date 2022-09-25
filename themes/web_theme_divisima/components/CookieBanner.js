import React from 'react';
import { NSCookieBanner } from 'aqlrc';

/**
 * NSCookieBanner - Affiche la barre d'acceptation des cookies
 * @return {React.Component}
 */

class CookieBanner extends NSCookieBanner {
    render() {
        const {
            hide, message, buttonAcceptText, buttonDenyText, style
        } = this.state;
        if (!hide) {
            return (
                <div style={style} className="cookie-banner">
                    <p className="cookie-message" dangerouslySetInnerHTML={{ __html: message }} />
                    <div className="cookie-buttons">
                        <button type="button" className="site-btn sb-dark" onClick={() => this.deny()}>
                            {buttonDenyText}
                        </button>
                        &nbsp;
                        <button type="button" className="site-btn" onClick={() => this.allow()}>
                            {buttonAcceptText}
                        </button>
                    </div>
                </div>
            );
        }
        return '';
    }
}

export default CookieBanner;