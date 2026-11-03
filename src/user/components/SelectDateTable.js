import React, { useContext } from 'react';
import { Context } from '../../context/GeneralContext';

export default function SelectDateTable({ state, isOrderDay }) {
    const context = useContext(Context);
    const monthCounts = context.datesArray?.reduce((acc, { month, year }) => {
        const key = `${month}-${year}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="wholesaleDates">
            <div className="row w-100 mx-auto">
                <div className={`col-12 ${isOrderDay !== false ? 'col-xl-6' : ''} px-0`}>
                    <div className="cursor-pointer">
                        <table id="date_select" className="scrolls scroll_horizontal_custom w-100">
                            <tbody>
                                <tr className='month_date_row'>
                                    {context.datesArray
                                        ?.filter((value, index, self) =>
                                            index === self.findIndex((t) => (
                                                t.month === value.month && t.year === value.year
                                            ))
                                        )
                                        ?.map((item) => {
                                            const monthYearKey = `${item.month}-${item.year}`;
                                            return (
                                                <td colSpan={monthCounts[monthYearKey]} key={monthYearKey}>
                                                    <span className="month_date">{item.name} {item.year}</span>
                                                </td>
                                            );
                                        })
                                    }
                                </tr>
                                <tr className='square_date_row'>
                                    {
                                        context.datesArray?.map((item) => (
                                            <td key={item.id}>
                                                <div className={`square_date ${state.selectedDate?.id === item.id ? 'active' : ''}`} title="Sun 2024-02-04" onClick={() => state.setSelectedDate(item)}>
                                                    <p className="week_date">
                                                        {item.day}
                                                    </p>
                                                    <p className="day_date">
                                                        {item.date}
                                                    </p>
                                                </div>
                                            </td>
                                        ))
                                    }
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {
                    isOrderDay !== false &&
                    <div className="col-12 col-xl-6">
                        <div className="order_day_wrapper">
                            <div className="current_date order">
                                Order for <br />
                                <b>{`${state.selectedDate?.dayFullName ?? ''}, ${state.selectedDate?.name ?? ''} ${state.selectedDate?.date ?? ''}, ${state.selectedDate?.year ?? ''}`}</b>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
