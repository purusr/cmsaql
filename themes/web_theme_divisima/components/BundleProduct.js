import React from 'react';
import {
    NSBundleProduct, NSToast, addToCart
} from 'aqlrc';
import { withI18next } from '../lib/withI18n';

/**
 * NSBundleProduct - Affiche la composition d'un produit bundle
 * @prop product: (object) Le produit
 * @return {React.Component}
 */

class BundleProduct extends NSBundleProduct {
    constructor(props, context) {
        super(props, context);
        this.state   = {
            compositionBundle : {
                cartId : '',
                item   : {
                    _id        : props.product ? props.product._id : '',
                    id         : props.product ? props.product._id : '',
                    quantity   : 1,
                    selections : [],
                },
            },
            priceTotal : 0
        };
        this.formMenu = {};
    }

    componentDidMount() {
        this.setState({priceTotal: this.props.product.price.ati.normal});
    }

    updatePriceTotal = () => {
        // Updating price bundle
        let price    = this.props.product.price.ati.special ? this.props.product.price.ati.special : this.props.product.price.ati.normal;
        const inputs = [...this.formMenu].filter(elem => elem.nodeName !== 'BUTTON');
        for (const input of inputs) {
            if (input.checked || input.checked === undefined) { // If select box, input.checked is undefined
                const parsedPrd = JSON.parse(input.value);
                const value = parsedPrd.modifier_price?.ati || 0;
                price      += value;
            }
        }
        this.setState({priceTotal: price});
    }

    createMenuSection = (section, inputs) => {
        if (inputs.length === undefined || inputs.type === 'select-one') {
            if ((inputs.type === 'radio' && inputs.checked === true) || (inputs.type === 'select-one' && inputs.value)) {
                const parsedPrd = JSON.parse(inputs.value);
                return { bundle_section_ref: section.ref, products: [parsedPrd.id._id] };
            }
            if (section.isRequired && ((inputs.type === 'radio' && inputs.checked === false) || (inputs.type === 'select-one' && inputs.value === ''))) { throw `Veuillez sélectionner au moins 1 ${section.ref}`; }
        }

        const checkedInputs = [];
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].checked === true) { checkedInputs.push(inputs[i]); }
        }
        if (section.isRequired && checkedInputs.length === 0) {
            throw `Veuillez sélectionner au moins 1 ${section.ref.toLowerCase()}`;
        }
        const values = [];
        for (let i = 0; i < checkedInputs.length; i++) {
            const parsedPrd = JSON.parse(checkedInputs[i].value);
            values.push(parsedPrd.id._id);
        }
        if (values.length < section.minSelect) {
            throw `Vous devez sélectionner au moins ${section.minSelect} ${section.ref.toLowerCase()}${section.minSelect > 1 ? 's' : null}`;
        }
        if (values.length > section.maxSelect) {
            throw `Vous ne pouvez sélectionner plus de ${section.maxSelect} ${section.ref.toLowerCase()}${section.maxSelect > 1 ? 's' : null}`;
        }
        return { bundle_section_ref: section.ref, products: values };
    }

    addToCart = async () => {
        try {
            let { product, qty } = this.props;
            let { compositionBundle } = this.state;
            const cartId = window.localStorage.getItem('cart_id');
            try {
                for (let i = 0; i < product.bundle_sections.length; i++) {
                    const cm = this.createMenuSection(product.bundle_sections[i], this.formMenu[product.bundle_sections[i].ref]);
                    if (cm.products.length > 0) { compositionBundle.item.selections.push(cm); }
                }
            } catch (e) {
                console.error(e);
                NSToast.warn(e);
                this.setState({
                    compositionBundle : {
                        cartId : '',
                        item   : {
                            _id        : this.props.product._id,
                            id         : this.props.product._id,
                            quantity   : 1,
                            selections : [],
                        },
                    },
                });
                return;
            }
            compositionBundle.cartId = cartId;

            // Ajout du produit bundle au panier
            try {
                const newCart = await addToCart(cartId, compositionBundle.item, qty, compositionBundle.item.selections);

                window.localStorage.setItem('cart_id', newCart._id);
                const event = new CustomEvent('updateCart', { detail: { cart: newCart } });
                window.dispatchEvent(event);
                this.props.onCloseModal();
                NSToast.success('product-card:product_added');
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    NSToast.error(err.response.data.message);
                } else {
                    NSToast.error('common:error_occured');
                    console.error(err);
                }
            }
            this.setState({
                compositionBundle : {
                    cartId : '',
                    item   : {
                        _id        : this.props.product._id,
                        id         : this.props.product._id,
                        quantity   : 1,
                        selections : [],
                    },
                },
            });
        } catch (e) {
            console.error(e);
            NSToast.error('common:error_occured');
        }
    };

    render() {
        const { product, t } = this.props;
        const { priceTotal } = this.state;
        return (
            <form ref={(form) => this.formMenu = form}>
                <div className="form__body">
                    {
                        product.bundle_sections && product.bundle_sections.map((section, index) => (
                            <React.Fragment key={index}>
                                {section.type === 'MULTIPLE' && <h4>Entre {section.minSelect} & {section.maxSelect} {section.title}</h4>}
                                {section.type !== 'MULTIPLE' && <h4>{section.title}</h4>}
                                <div className="section" style={{ width: '100%' }}>
                                    {
                                        section.displayMode !== 'SELECT' && section.products
                                            ? section.products.filter((prd) => prd.id.active).map((prd, index2) => {
                                                const _img = prd.id.images && prd.id.images.length > 0 ? prd.id.images.find((img) => img.default === true) || prd.id.images.sort((a, b) => a.position - b.position)[0] : { url: 'medias/no-image.png' };
                                                return (
                                                    <div className="form-group" key={index2}>
                                                        <div className="checkbox checkbox--radio">
                                                            {section.displayMode === 'RADIO_BUTTON' && <input type="radio" id={`${prd.id._id}_${section.ref}`} className="custom-control-input" name={section.ref} value={JSON.stringify(prd)} required={section.isRequired} defaultChecked={section.products.length < 2} disabled={prd.id.stock.status === 'epu' || !prd.id.stock.orderable} onClick={this.updatePriceTotal} />}
                                                            {section.type === 'MULTIPLE' && <input type="checkbox" id={`${prd.id._id}_${section.ref}`} className="custom-control-input" name={section.ref} value={JSON.stringify(prd)} defaultChecked={section.products.length < 2} disabled={prd.id.stock.status === 'epu' || !prd.id.stock.orderable} onClick={this.updatePriceTotal} />}
            
                                                            <label className="custom-control-label" htmlFor={`${prd.id._id}_${section.ref}`}>
                                                                <img src={`/${_img.url}`} alt="" style={{ height: '70px' }} />
                                                            </label>
            
                                                            <span>
                                                                {prd.id.name}
                                                                { prd.modifier_price?.ati ? <><br />{(prd.modifier_price.ati > 0 ? '+' : '') + prd.modifier_price.ati.toFixed(2)} €</> : null}
                                                            </span>
                                                        </div>{/* <!-- /.checkbox --> */}
                                                    </div>
                                                );
                                            }) : (
                                                <div>
                                                    <select className="form-control" name={section.ref} onChange={this.updatePriceTotal}>
                                                        <option value="">--</option>
                                                        {
                                                            section.products && section.products.map((prd) => (
                                                                <option key={prd.id._id} value={JSON.stringify(prd)} disabled={prd.id.stock.status === 'epu' || !prd.id.stock.orderable}>{prd.id.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            )
                                    }
                                </div>
                            </React.Fragment>
                        ))
                    }
                    <div className="product-price">
                        <strong>{priceTotal.toFixed(2)} €</strong>
                    </div>{/* <!-- /.price --> */}
                </div>{/* <!-- /.popup__body --> */}
                <div className="form-footer">
                    <button type="button" className="site-btn" onClick={this.addToCart} aria-label={t('product-card:ajoutPanier')}>
                        <i className="ico-shopping-cart-white" />
                        <span>{t('product-card:ajoutPanier')}</span>
                    </button>
                </div>
            </form>
        );
    }
}

export default withI18next([])(BundleProduct);
