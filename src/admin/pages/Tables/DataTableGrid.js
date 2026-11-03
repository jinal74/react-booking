import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import '../../pages/Tables/datatables.scss';
import { Card, CardBody, CardDeck, CardHeader } from 'reactstrap';
import NoDataImg from '../../assets/images/NoDataImg.jpg';

export default function DataTableGrid({ data, options, tableCallBack, columns, getRowClick }) {
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
        tableCallBack({ ...options, selected_row: res });
    };

    const tableCall = (e) => {
        let tmp_option = { ...options };
        if (e.target.name === 'search') {
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
            {(options.show_header !== false && options.totalCount > 0) && (
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
                                name="search"
                                className="form-control"
                                value={search ?? ''}
                                onChange={(e) => tableCall(e)}
                                placeholder={options.placeholder !== undefined ? options.placeholder : 'Search ...'}
                            />
                        </div>
                    )}
                </div>
            )}

            <CardDeck>
                <div className='row'>
                    {data?.length > 0 ? (
                        data?.map((item_data, i) => {
                            return (
                                <div className='col-lg-3 col-sm-6 mb-3' key={item_data?.[options?.unique_field]}>
                                    <Card className="h-100 shadow-sm">
                                        <CardHeader className='bg-light'>
                                            {options.checkbox && (
                                                <input
                                                    className="form-check-input cursor fs-6"
                                                    type="checkbox"
                                                    id={item_data?.[options?.unique_field]}
                                                    onChange={(e) =>
                                                        handleSelectCheck(e, item_data?.[options?.unique_field])
                                                    }
                                                />
                                            )}
                                        </CardHeader>
                                        <CardBody>
                                            {columns?.map((column, index) => {
                                                return (
                                                    <span className='d-flex mb-1' key={index}>
                                                        {column.name !== '' && <bdi className='me-1'>
                                                            {column.name} :
                                                        </bdi>}
                                                        {column?.options?.CustomBodyRender
                                                            ? column?.options?.CustomBodyRender(data, i)
                                                            : item_data?.[column.column]}
                                                    </span>
                                                )
                                            })}
                                        </CardBody>
                                    </Card>
                                </div>
                            )
                        })
                    ) : (
                        <div className='d-flex align-items-center justify-content-center mt-4'>
                            <div className='text-center'>
                                <img src={NoDataImg} />
                                <h4 className='grey-txt-cls'>No data found</h4>
                            </div>
                        </div>
                    )}
                </div>
            </CardDeck>

            {(options.show_footer !== false && options.totalCount > 0) && (
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
