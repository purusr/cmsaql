import React from 'react';
import Slider from 'rc-slider';
import { NSFilters, shadeColor } from 'aqlrc';
import { withI18next } from '../lib/withI18n';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range                   = createSliderWithTooltip(Slider.Range);

class Filters extends NSFilters {
    render() {
        const {
            lang, filtersData, min, max, filters, taxDisplay
        } = this.state;
        const { color, t } = this.props;
        return (
            <div className="col-lg-3 order-2 order-lg-1">
                <div className="filter-widget mb-0">
                    <h2 className="fw-title">{t('category:filtrerPar')}</h2>
                    <div className="price-range-wrap">
                        <h4>{t('category:prix')}</h4>
                        <Range
                            handleStyle={[{ borderColor: shadeColor('#000', 0.5) }]}
                            trackStyle={[{ backgroundColor: '#000' }]}
                            onChange={(data) => this.onChangeValue({ target: { name: `price.${taxDisplay}.normal`, value: data } })}
                            onAfterChange={(data) => this.onChange({ target: { name: `price.${taxDisplay}.normal`, value: data } })}
                            min={Math.floor(Number(this.props.globalMin))} max={Math.ceil(Number(this.props.globalMax))}
                            tipFormatter={(value) => `${value} €`}
                            defaultValue={[Number(min), Math.ceil(Number(max))]}
                            value={
                                [
                                    (Number(filters.$and[0].$or[1][`price.${taxDisplay}.special`].$gte) || Number(filters.$and[0].$or[0][`price.${taxDisplay}.normal`].$gte)),
                                    (Number(filters.$and[0].$or[1][`price.${taxDisplay}.special`].$lte) || Number(filters.$and[0].$or[0][`price.${taxDisplay}.normal`].$lte))
                                ]
                            }
                        />
                        <div className="range-slider">
                            <div className="price-input">
                            <span style={{ float: 'left', fontSize: '14px' }}>
                                {Math.floor(Number(min)).toFixed(2)}€ <sub>{t(`common:price.${taxDisplay}`)}</sub>
                            </span>
                            <span style={{ float: 'right', fontSize: '14px' }}>
                                {Math.ceil(Number(max)).toFixed(2)}€ <sub>{t(`common:price.${taxDisplay}`)}</sub>
                            </span>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    filtersData.attributes ? filtersData.attributes.map((filter, index) => (
                        <div key={filter.id_attribut.toString()} className="filter-widget" id={`${filter.id_attribut}_div`} hidden={filtersData.attributesValues === undefined || filtersData.attributesValues[filter.id_attribut] === undefined}>
                            <h2 className="fw-title">{filter.name}</h2>
                            <ul className={filter.type === 'Couleur' || filter.type === 'color' ? 'category-menu-color' : 'category-menu'}>
                                {
                                    filtersData.attributesValues && filtersData.attributesValues[filter.id_attribut] ? filtersData.attributesValues[filter.id_attribut].map((f) => {
                                        if (typeof f === 'object') return '';
                                        return (
                                            <li key={`${filter.id_attribut}_${f}`} id={`${filter.id_attribut}_${f}_div`}>
                                                <input
                                                    type="checkbox"
                                                    id={`${filter.id_attribut}_${f}`}
                                                    value={f}
                                                    name={filter.id_attribut}
                                                    checked={this.state.checkedArray.includes(`${filter.id_attribut}_${f}`)}
                                                    onChange={(e) => this.onChange(e, typeof f === 'number', this.state.checkedArray.includes(`${filter.id_attribut}_${f}`), `${filter.id_attribut}_${f}`, filter)}
                                                />
                                                {
                                                    filter.type === 'Couleur' || filter.type === 'color' ? (
                                                        <label className="color_filter" style={{ backgroundColor: f.toString() }} htmlFor={`${filter.id_attribut}_${f}`} />
                                                    ) : (
                                                        <label htmlFor={`${filter.id_attribut}_${f}`}>{t(`common:${f.toString()}`)}</label>
                                                    )
                                                }
                                            </li>
                                        );
                                    }) : <li />
                                }
                            </ul>
                        </div>
                    )) : <div className="widget widget--checklist" />
                }

                <div className="sidebar__actions">
                    <button type="button" className="site-btn sb-line sb-dark" onClick={this.resetFilters}>{t('category:reset_filters')}</button>
                </div>{/* <!-- /.sidebar__actions --> */}
            </div>
        );
    }
}

export default withI18next([])(Filters);
