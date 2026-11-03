import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import './datatables.scss';

export default function DataTable({ data, options, tableCallBack, columns, getRowClick }) {
    const [size_per_page, set_size_per_page] = useState([5, 10, 25, 50, 100, 250, 500]);
    const [page, set_page] = useState(options.page);
    const [timer, setTimer] = useState(null);
    const [search, set_search] = useState(options.search);

    const handleSelectCheck = (e, get_id) => {
        const isChecked = e.target.checked;
        let res = options.selected_row;
        if (isChecked) {
            res = [...options.selected_row, get_id];
        } else {
            res = options.selected_row.filter((id) => id !== get_id);
        }
        if (data.length == res.length) document.getElementById('all-checked').checked = true;
        else document.getElementById('all-checked').checked = false;
        tableCallBack({ ...options, selected_row: res });
    };

    const handleSelectAllCheckbox = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const allCheckedIds = data?.map((item_data) => item_data?.[options?.unique_field]);
            for (let i = 0; i < data.length; i++) {
                document.getElementById(data[i]?.[options?.unique_field]).checked = true;
            }
            tableCallBack({ ...options, selected_row: allCheckedIds });
        } else {
            for (let i = 0; i < data.length; i++) {
                document.getElementById(data[i]?.[options?.unique_field]).checked = false;
            }
            tableCallBack({ ...options, selected_row: [] });
        }
    };

    const sortHandler = (field) => {
        let tmp_option = { ...options, sort: field, order: options.order == 0 ? 1 : 0 };
        tableCallBack(tmp_option);
    };

    const tableCall = (e) => {
        let tmp_option = { ...options };
        if (e.target.type === 'search') {
            search_object_change(e.target.value);
        } else {
            if (e.target.value !== '') {
                tmp_option[e.target.name] = parseInt(e.target.value);
                tmp_option['page'] = 0;
                tableCallBack(tmp_option);
            }
        }
    };

    const search_object_change = (filed_value) => {
        let tmp_option = { ...options, search: filed_value, page: 0 };
        set_search(filed_value);
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
        setTimer(
            setTimeout(() => {
                tableCallBack(tmp_option);
            }, 1000)
        );
    };

    const handlePageClick = (event) => {
        set_page(event.selected);
        setTimeout(() => {
            let temp = { ...options };
            temp['page'] = event.selected;
            tableCallBack(temp);
        }, 200);
    };

    return (
        <div>
            {options.show_header !== false && (
                <div className="d-md-flex align-items-center custom-table-top">
                    {options.is_sizePerPage !== false && (
                        <label className="d-flex align-items-center custom-select-label mb-0">
                            Show
                            <select
                                name="sizePerPage"
                                className="form-select mx-2"
                                defaultValue={options.sizePerPage}
                                onChange={(e) => tableCall(e)}
                            >
                                {size_per_page.map((val, i) => {
                                    return (
                                        <option key={i} value={val}>
                                            {val}
                                        </option>
                                    );
                                })}
                            </select>
                            entries
                        </label>
                    )}
                    {options.is_search !== false && (
                        <div className="d-md-flex align-items-center ms-auto custom-select-input position-relative">
                            <span className="seacrh-icon-right">
                                <i className="bx bx-search-alt-2 fs-5"></i>
                            </span>
                            <input
                                type="search"
                                className="form-control"
                                autoComplete='off'
                                value={search ?? ''}
                                onChange={(e) => tableCall(e)}
                                placeholder={options.placeholder !== undefined ? options.placeholder : 'Search ...'}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className='main-table-div'>
                <table className="table employ-info">
                    <thead className="thead-dark ">
                        <tr className="title-one">
                            {options.checkbox && (
                                <th>
                                    <input
                                        className="form-check-input cursor fs-6"
                                        type="checkbox"
                                        id="all-checked"
                                        onChange={(e) => { if (data?.length > 0) handleSelectAllCheckbox(e); }}
                                    />
                                </th>
                            )}
                            {columns?.map((column, index) => {
                                return column.options?.['sort'] ? (
                                    <th key={index} className={`${column.options?.className ?? ''} text-capitalize`}>
                                        <div onClick={() => sortHandler(column.column)} className="position-relative">
                                            {column.name}
                                            {column.column !== options['sort'] ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="border-0 bg-transparent p-0 sorting-top"
                                                    >
                                                        <i className="bx bx-caret-up"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="border-0 bg-transparent p-0 sorting-bottom"
                                                    >
                                                        <i className="bx bx-caret-down"></i>
                                                    </button>
                                                </>
                                            ) : column.column === options['sort'] && options['order'] == 1 ? (
                                                <button type="button" className="border-0 bg-transparent p-0 sorting-top">
                                                    <i className="bx bx-caret-up"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="border-0 bg-transparent p-0 sorting-bottom"
                                                >
                                                    <i className="bx bx-caret-down"></i>
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                ) : (
                                    <th key={index} className={column.options?.className ?? ''}>{column.name}</th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {data?.length > 0 ? (
                            data?.map((item_data, i) => {
                                return (
                                    <tr
                                        className={`align-middle emply-details ${options?.isRowClick ? 'cursor-pointer' : 'cursor-default'
                                            }`}
                                        key={i}
                                        onClick={() => {
                                            if (options?.isRowClick) getRowClick(item_data);
                                        }}
                                    >
                                        {options.checkbox && (
                                            <td>
                                                <input
                                                    className="form-check-input cursor fs-6"
                                                    type="checkbox"
                                                    id={item_data?.[options?.unique_field]}
                                                    onChange={(e) =>
                                                        handleSelectCheck(e, item_data?.[options?.unique_field])
                                                    }
                                                />
                                            </td>
                                        )}
                                        {columns?.map((column, index) => {
                                            return (
                                                <td key={index} className={column.options?.className ?? ''}>
                                                    {column?.options?.CustomBodyRender
                                                        ? column?.options?.CustomBodyRender(data, i)
                                                        : item_data?.[column.column]}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr className="text-center my-4">
                                <td colSpan={columns.length + (options.checkbox ? 1 : 0)} className="fs-5 text-center">
                                    No data available in table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {options.show_footer !== false && options.totalCount > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="custom-table-page text-md-start">
                        Showing {parseInt(options.page * options.sizePerPage + 1)} to{' '}
                        {parseInt(options.page * options.sizePerPage + options.sizePerPage) > options.totalCount
                            ? options.totalCount
                            : parseInt(options.page * options.sizePerPage + options.sizePerPage)}{' '}
                        of {options.totalCount} entries
                    </div>
                    <ReactPaginate
                        forcePage={page}
                        previousLabel={'Previous'}
                        nextLabel={'Next'}
                        breakLabel={'...'}
                        pageCount={Math.ceil(options.totalCount / options.sizePerPage)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageClick}
                        containerClassName={'pagination justify-content-center mb-0'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        previousClassName={'page-item'}
                        previousLinkClassName={'page-link'}
                        nextClassName={'page-item'}
                        nextLinkClassName={'page-link'}
                        breakClassName={'page-item'}
                        breakLinkClassName={'page-link'}
                        activeClassName={'active'}
                        renderOnZeroPageCount={null}
                    />
                </div>
            )}
        </div>
    );
}
