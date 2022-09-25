import React from 'react';
import Head from 'next/head';
import { NSMenu } from 'aqlrc';
import { Link } from '../routes';

/**
 * NSMenu - Affiche le bloc du menu correspondant au code passé en prop (ns-code)
 * @prop ns-code: (string) nom du menu à afficher
 * @return {React.Component}
 */

class Menu extends NSMenu {
    componentDidMount = () => {
        if (typeof window !== 'undefined' && document.querySelector(`.slicknav_btn`)) {
            document.querySelector(`.slicknav_btn`).onclick = () => {
                document.querySelector(`.slicknav_nav`).classList.toggle('slicknav_hidden');
            };
        }
    }

    recursive(menu, l, slugs = []) {
        const { levelmax } = this.props;
        const { lang, routerLang } = this.context.state;
        if (levelmax && l >= levelmax) return '';
        return menu.children.map((section) => {
            // Gestion du slug recursif : cat1/cat2/[...]
            if (slugs.length - 1 >= l) {
                slugs.splice(l);
            }

            if ((section.action === 'catalog' && !section.slug) || (section.action === 'page' && (section.pageSlug === undefined || section.pageSlug === ''))) return '';
            if (section.action === 'catalog' && (!section.slug[lang] || section.slug[lang] === '')) return <li><a href="/">Non translated section</a></li>;

            if (section.action === 'page') {
                slugs.push(section.pageSlug);
                return (
                    <li key={`${section._id}_${this.props['ns-code']}`}>
                        <Link route="staticI18n" params={{ _slug: section.pageSlug || 'home',  lang: routerLang }}>
                            <a><span>{section.name}</span></a>
                        </Link>
                        { section.children !== undefined && section.children.length ? <ul className="sub-menu">{this.recursive(section, l + 1)}</ul> : '' }
                    </li>
                );
            }
            if (section.slug) {
                slugs.push(section.slug[lang]);
            }
            return (
                <li key={`${section._id}_${this.props['ns-code']}`}>
                    <Link route="categoryI18n" params={{ _slug: [...slugs] || '', page: undefined,  lang: routerLang }}>
                        <a>{section.name}</a>
                    </Link>

                    { section.children !== undefined && section.children.length ? <ul className="sub-menu">{this.recursive(section, l + 1, slugs)}</ul> : '' }
                </li>
            );
        });
    }

    render() {
        const nsMenu = this.context.state[`nsMenu_${this.props['ns-code']}`];
        return (
            <nav className="main-navbar">
                <div className="container">
                    <div className="slicknav_menu">
                        <a href="#" className="slicknav_btn slicknav_collapsed" style={{outline: 'none'}}>
                            <span className="slicknav_menutxt">MENU</span>
                            <span className="slicknav_icon">
                                <span className="slicknav_icon-bar"></span>
                                <span className="slicknav_icon-bar"></span>
                                <span className="slicknav_icon-bar"></span>
                            </span>
                        </a>
                        <ul className="slicknav_nav slicknav_hidden">
                            { nsMenu && this.recursive(nsMenu, 0) }
                        </ul>
                    </div>
                    <ul className="main-menu">
                        { nsMenu && this.recursive(nsMenu, 0) }
                    </ul>
                </div>
            </nav>
        );
    }
}

export default Menu;
