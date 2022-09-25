import React from 'react';
import {
    _NSconfig
} from 'aqlrc'; // Import depuis AQLRC de la config par défaut
import BlockSlider from './BlockSlider';
import Breadcrumb from './Breadcrumb';
import ButtonLoginAccount from './ButtonLoginAccount';
import CartProductCounter from './CartProductCounter';
import Menu from './Menu';
import ProductCardList from './ProductCardList';
import SearchBar from './SearchBar';

// On surcharge la config par défaut de AQLRC si besoin
// A noter que <Link> et <CMS> sont déjà gérés directement dans le composant CMS, il faut utiliser respectivement "ns-link" et "ns-cms"
// A garder dans l'ordre alphabétique en fonction du nom du composant SVP
export default {
    ..._NSconfig,
    'ns-block-slider'      : <BlockSlider />,
    'ns-breadcrumb'        : <Breadcrumb />,
    'ns-login'             : <ButtonLoginAccount />,
    'ns-cart-count'        : <CartProductCounter />,
    'ns-menu'              : <Menu />,
    'ns-product-card-list' : <ProductCardList />,
    'ns-search'            : <SearchBar />,
};
