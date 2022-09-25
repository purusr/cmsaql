import React from 'react';
import crypto from 'crypto';
import { NSProductCardList } from 'aqlrc';
import ProductCard from './ProductCard';

/**
 * NSProductCardList - Affiche une liste de produit
 * @prop ProductCard: Composant ProductCard (rendu produit dans une liste)
 * @prop listProduct: Liste directe des objets produits à afficher (type & value inutiles dans ce cas)
 * @prop itemsperslides: Nombre de produit dans le slider
 * @prop type: Type de liste (new | product_id | product_code | category | list_id | list_code)
 * @prop value: Valeur en fonction du type de liste demandée
 *
 * type="new"
 * type="product_id" & value="_id_produit_dont_on_veut_voir_les_associes"
 * type="product_code" & value="_code_produit_dont_on_veut_voir_les_associes"
 * type="category" & value="_code_cat_"
 * type="list_id" & value="[list_de_product_id]"
 * type="list_code" & value="[list_de_code_produit]"
 *
 * @return {React.Component}
 */
class ProductCardList extends NSProductCardList {
    render() {
        const { itemsperslides } = this.props;
        const { currentIndex, products } = this.state;
        return (
                <div className="product-slider owl-carousel">
                    <div className="list-products">
                    {
                        products && [...Array(Number(itemsperslides))].map((el, index) => {
                            if (products[itemsperslides * (currentIndex - 1) + index] !== undefined) {
                                const product = products[itemsperslides * (currentIndex - 1) + index];
                                return <ProductCard key={itemsperslides * (currentIndex - 1) + index} type="data" value={product} mode="small" includeCss={index === 0} />;
                            }
                        })
                    }
                    </div>
                    {
                        !products || itemsperslides >= products.length
                            ? null
                            : (
                                <div className="slider__arrows">
                                    <button type="button" className="slider__arrow slider__arrow--prev" onClick={() => this.slide(products.length, true)}>
                                        <i className="flaticon-left-arrow-1"></i>
                                    </button>

                                    <button type="button" className="slider__arrow slider__arrow--next" onClick={() => this.slide(products.length)}>
                                        <i className="flaticon-right-arrow-1"></i>
                                    </button>
                                </div>/* <!-- /.slider__arrows --> */
                            )
                    }
                </div>/* <!-- /.product-slider --> */
        );
    }
}

export default ProductCardList;
