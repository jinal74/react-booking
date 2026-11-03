import React from 'react'
import { FixedDecimal } from '../../helpers/func_helper';

export default function MacroGraph({ setSeeMoreMacros, macrosData, isModal = false, noShadow = false }) {

    function calculateTotalMacrosWithQuantities(macrosArray, portionPricesArray) {
        const portionQuantities = portionPricesArray?.reduce((acc, portion) => {
            acc[portion.portion_size_id] = portion.quantity;
            return acc;
        }, {});
        const updatedMacrosArray = JSON.parse(JSON.stringify(macrosArray));
        updatedMacrosArray?.forEach((macro) => {
            const quantityMultiplier = portionQuantities[macro.portion_size_id] || 0;
            macro.total = quantityMultiplier ? (parseFloat(macro.quantity) * quantityMultiplier) : (macro.total ?? 0);
        });
        const totals = updatedMacrosArray?.reduce((acc, macro) => {
            if (acc[macro.macro_id]) {
                acc[macro.macro_id].total += macro.total;
            } else {
                acc[macro.macro_id] = { ...macro };
            }
            return acc;
        }, {});

        const result = Object.values(totals);
        return result;
    }

    const totalMacros = calculateTotalMacrosWithQuantities(macrosData?.macros, macrosData?.portionData);

    let cal;
    if (!isModal) cal = totalMacros?.find((f) => f.macro_name === 'Calories');

    return (
        <div className={`macroGraph row mx-2 ${noShadow ? 'shadow-none' : ''}`}>
            <div className="col-12 p-2 macrograph-subcontainer">
                {
                    !isModal &&
                    <div className="ps-0 text-end">
                        <div>
                            <span className="h3">
                                <span className="bold total_macros_1_macroGraph totalsMacro_macroGraph">{FixedDecimal(cal?.total)}</span>{' '}
                                <span className="bold">Calories</span>
                            </span>
                        </div>
                        <div>
                            <span className="text-primary">
                                <span className="total_macros_1_percentage_macroGraph me-1">
                                    {FixedDecimal(!isNaN((100 * (cal?.total ?? 0)) / cal?.daily_value) ? ((100 * (cal?.total ?? 0)) / cal?.daily_value) : 0)}%
                                </span>
                                of daily {cal?.daily_value} cal
                            </span>
                        </div>
                    </div>
                }
                <div className="mt-3">
                    {
                        (isModal ? totalMacros : totalMacros?.filter(f => f.macro_name !== 'Calories'))
                            ?.map((item) => {
                                let temp_val = (100 * (item?.total ?? 0)) / item.daily_value;
                                let Percentage = !isNaN(temp_val) ? (temp_val > 100 ? 100 : temp_val) : 0;
                                let display_pr = !isNaN(temp_val) ? temp_val : 0;

                                return (
                                    <div className="row" key={item.macro_id}>
                                        <div className="col-6">
                                            <div className="progress-container progress-primary">
                                                <span className="progress-badge bold">{item.macro_name}</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <span className="progress-value">
                                                <span className="bold total_macros_4_macroGraph totalsMacro_macroGraph">{FixedDecimal(item.total)}</span>{' '}
                                                <span className="bold">{item.suffix}</span>
                                                <small className='ms-1'>
                                                    (<span className="total_macros_4_percentage_macroGraph">{FixedDecimal(display_pr)}%</span>)
                                                </small>
                                            </span>
                                        </div>
                                        <div className="col-12">
                                            <div className="progress">
                                                <div
                                                    style={{ backgroundColor: item.macro_color, width: `${Math.ceil(Percentage)}%` }}
                                                    className="progress-bar"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                    }
                </div>
                {
                    !isModal &&
                    <div className="my-2 text-end">
                        <a className="text-primary" onClick={() => setSeeMoreMacros({ show: true, data: macrosData })}>
                            <span>
                                see more <i className="fa fa-arrow-circle-right"></i>
                            </span>
                        </a>
                    </div>
                }
            </div>
        </div>
    )
}
