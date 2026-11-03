import React, { useContext, useEffect, useState } from 'react';
import { Modal, ModalFooter } from 'reactstrap';
import 'react-quill/dist/quill.snow.css';
import DataTable from '../../../Tables/CustDataTable';
import Loader from '../../../../Loader/Loader';
import { API_PATH } from '../../../../constants/const';
import { PostApi } from '../../../../../services/ApiService';
import Placeholder from '../../../../assets/images/placeholder.png';
import { IconLoader, SelectLoader } from '../../../../Loader/IconLoader';
import { Rating } from 'react-simple-star-rating';
import { toast } from 'react-toastify';
import { SettingsStore } from '../../../../context/SettingsContext';
import Select from 'react-select';

let height = 0;

export default function MealsListModal({ states }) {
    const context = useContext(SettingsStore);

    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [date, setDate] = useState({ startDate: null, endDate: null });
    const [portionSizes, setPortionSizes] = useState([]);
    const [mealCategories, setMealCategories] = useState([]);
    const [selectedKitchenIds, setSelectedKitchenIds] = useState([]);
    const [showSelected, setShowSelected] = useState("0");
    const [selectedMealCategories, setSelectedMealCategories] = useState([]);
    const [selectedPortionSizes, setSelectedPortionSizes] = useState([]);
    const [isLastData, setIsLastData] = useState(true);
    const [options, setOptions] = useState({
        page: 0,
        totalCount: 0,
        sizePerPage: 5,
        is_sizePerPage: false,
        search: '',
        selected_row: [],
        show_footer: false,
    });

    useEffect(() => {
        if (states?.showMealsModal) {
            GetAllPortionSize();
            GetMealCategories();
        }
    }, []);

    useEffect(() => {
        if (states?.showMealsModal) {
            setIsLoading(true);
            GetAllMealRecipes({ ...options, page: 0, selected_row: [] });
        }
    }, [showSelected, selectedMealCategories, selectedPortionSizes])

    useEffect(() => {
        if (states.showMealsModal) {
            if (document.getElementsByClassName('sub-recipe-mdl-main')) {
                const subRecipeMain = document.getElementsByClassName('sub-recipe-mdl-main')?.[0];
                if (subRecipeMain && subRecipeMain.getElementsByClassName('table')) {
                    const table = subRecipeMain.getElementsByClassName('table')?.[0];
                    if (table) {
                        const tableBody = table.querySelector('tbody');
                        if (tableBody) {
                            setTimeout(() => {
                                height += table.scrollHeight;
                                tableBody.scrollTo({
                                    top: height ?? 0,
                                    behavior: 'smooth',
                                });
                            }, 500);
                        }
                    }
                }
            }
        }
    }, [states.showMealsModal, data])

    const GetAllMealRecipes = async (option, type) => {
        const response = await PostApi(API_PATH.getMealsList, {
            offset: option.page + 1,
            limit: option.sizePerPage,
            kitchen_location_id: context?.selected_location?.kitchen_location_id,
            meal_menu_date: `${states?.selectedDate?.year}-${states?.selectedDate?.month}-${states?.selectedDate?.date}`,
            search_text: option.search,
            meal_category_id: selectedMealCategories,
            portion_size_id: selectedPortionSizes,
            show_selected: showSelected
        });
        if (response.statusCode === 200) {
            if (type) {
                setData([...data, ...response.data] ?? []);
            } else {
                setData(response.data ?? []);
            }
            setIsLastData(true);
            if (response.data?.length < 5) setIsLastData(false);
        } else {
            if (!type) setData([]);
            setIsLastData(false);
        }
        setOptions(option);
        setIsLoading(false);
        setIsLoadingBtn(false);
    };

    const GetAllPortionSize = async () => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getActivePortionSize);
        if (response.statusCode === 200) {
            setPortionSizes(response.data ?? []);
        }
        setIsLoading(false);
    };

    const GetMealCategories = async () => {
        setIsLoading(true);
        const response = await PostApi(API_PATH.getMealCategories, { type: 'all' });
        if (response.statusCode === 200) {
            const result = response.data.data_result?.reduce((acc, obj) => {
                const key = obj.meal_category_group_name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
            setMealCategories(result);
        }
        setIsLoading(false);
    };

    const columns = [
        {
            name: '',
            column: 'ingredient_image',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div>
                            <img
                                src={data[i].ingredient_image ?? Placeholder}
                                className="object-fit-cover border rounded"
                                height="45"
                                width="45"
                                onError={(e) => e.target.src = Placeholder}
                            />
                        </div>
                    );
                },
            },
        },
        {
            name: 'Meal',
            column: 'display_name',
            options: {
                className: 'w-50',
                CustomBodyRender: (data, i) => {
                    let temp_mealcategories = data[i].mealcategories !== '' ? data[i].mealcategories?.split(',') ?? [] : [];
                    let mealcategories = [];
                    for (let i = 0; i < Object.keys(mealCategories)?.length; i++) {
                        let obj = Object.keys(mealCategories)[i]
                        for (let j = 0; j < mealCategories[obj].length; j++) {
                            const element = mealCategories[obj][j];
                            if (temp_mealcategories?.includes(element.meal_category_id)) mealcategories.push(element);
                        }
                    }

                    return (
                        <>
                            <div className="d-flex align-items-center">
                                <p className="fw-medium mb-0 me-2 text-break-cls">{data[i].display_name}</p>
                                {data[i]?.should_show_ratings == 1 &&
                                    <span>
                                        <Rating
                                            size={25}
                                            initialValue={Number(data[i].rate ?? 0) / 5}
                                            readonly
                                            allowFraction
                                            iconsCount={1}
                                            fillClassName="text-warning"
                                            onClick={function noRefCheck() { }}
                                        />
                                        <bdi className="text-warning">{data[i].rate ?? 0}/5</bdi> (0)
                                    </span>
                                }
                            </div>
                            <div className="d-flex align-items-center py-1">
                                <div className='circle-18'>
                                    {
                                        mealcategories?.map((f, i) => (
                                            <span className="text-light bg-dark" title={f.meal_category_name} key={i}>
                                                {f.meal_category_name?.[0]}
                                            </span>
                                        ))
                                    }
                                </div>
                                {data[i]?.is_new == 1 &&
                                    <span className="meal-recipe-tag">New Item</span>
                                }
                            </div>
                        </>
                    );
                },
            },
        },
        {
            name: 'Price',
            column: 'price',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className='purchase-tag-cls'>
                            <i className='bx bxs-purchase-tag fs-5'></i>
                        </div>
                    );
                },
            },
        },
        {
            name: 'Portions',
            column: 'portionSizeNames'
        },
        {
            name: '',
            column: 'ingredient_id',
            options: {
                CustomBodyRender: (data, i) => {
                    return (
                        <div className="d-flex justify-content-end me-4">
                            <span
                                className={`green-pls-icon ${data[i]?.is_selected === 1 ? 'bg-danger' : 'bg-success'}`}
                                onClick={() => handleAddRemoveData(data[i].ingredient_id, i, data[i]?.is_selected)}
                            >
                                {data[i]?.is_selected === 1 ? '-' : '+'}
                            </span>
                        </div>
                    );
                },
            },
        },
    ];

    const handleAddRemoveData = async (ingredient_id, index, is_selected) => {
        let api_path = '';
        if (is_selected == 1) api_path = API_PATH.removeMealToMenu;
        else api_path = API_PATH.addMealToMenu;

        const response = await PostApi(api_path, {
            kitchen_location_id: context?.selected_location?.kitchen_location_id,
            meal_menu_date: `${states?.selectedDate?.year}-${states?.selectedDate?.month}-${states?.selectedDate?.date}`,
            ingredient_id
        });
        if (response.statusCode === 200) {
            let temp_data = [...data];
            let temp_obj = temp_data[index];
            temp_obj.is_selected = is_selected == 1 ? 0 : 1;
            temp_data.splice(index, 1, temp_obj);
            setData(temp_data);
            toast.success(response?.data);
        }
    };

    const handleSelectFilterCat = (e, def) => {
        if (e.target.name === 'showSelected') {
            setShowSelected(e.target.checked ? "1" : "0");
        } else if (e.target.name === 'meal_category_id') {
            let temp_selected = [...selectedMealCategories];
            if (e.target.checked) temp_selected.push(e.target.value);
            else {
                let index = temp_selected?.findIndex((f) => f === e.target.value);
                temp_selected.splice(index, 1);
            }
            setSelectedMealCategories(temp_selected);
        } else {
            let temp_selected = [...selectedPortionSizes];
            if (e.target.checked && def != 1) temp_selected.push(e.target.value);
            else {
                let index = temp_selected?.findIndex((f) => f === e.target.value);
                if (index != -1) temp_selected?.splice(index, 1);
            }
            setSelectedPortionSizes(temp_selected);
        }
        setOptions({ ...options, page: 0, selected_row: [] });
    };

    const handleLoadMoreData = () => {
        setIsLoadingBtn(true);
        GetAllMealRecipes({ ...options, page: options.page + 1 }, 1);
    };

    const tableCallBack = (option) => {
        if (option.selected_row !== options.selected_row) setOptions(option);
        else {
            setIsLoading(true);
            GetAllMealRecipes({ ...option, selected_row: [] });
        }
    };

    const handleDateChange = (e) => {
        setDate({ ...date, [e.target.name]: e.target.value });
    }

    const handleCloneMenu = async () => {
        setIsLoadingBtn(true);
        if (date.startDate && date.endDate) {
            if (selectedKitchenIds?.length > 0) {
                const response = await PostApi(API_PATH.cloneMealMenu, {
                    kitchen_location_id: context?.selected_location?.kitchen_location_id,
                    meal_menu_date: `${states?.selectedDate?.year}-${states?.selectedDate?.month}-${states?.selectedDate?.date}`,
                    to_kitchen_ids: selectedKitchenIds?.map((f) => f.value),
                    from_date: date.startDate,
                    to_date: date.endDate
                });
                if (response.statusCode === 200) {
                    toast.success(response?.data);
                }
                states.setCloneMealsModal(false);
            } else {
                toast.error('Please select at least one kitchen location.');
            }
        } else {
            toast.error('Please select date.');
        }
        setIsLoadingBtn(false);
    }

    return (
        <>
            <Modal isOpen={states.showMealsModal} centered size="xl" className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">
                        Meal Prep menu for {states?.selectedDate?.short_name} {states?.selectedDate?.date}, {states?.selectedDate?.year} for {context?.selected_location?.kitchen_loc_name}
                    </h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.setShowMealsModal(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-lg-3 col-sm-12 filter-light rounded shadow-sm">
                            <div className="my-4">
                                <h5 className="font-size-14">Filter Preferences</h5>
                                <div>
                                    <span className="bg-light d-block rounded ps-2 py-2 my-3">General</span>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="showSelected"
                                            id="only-selected-select"
                                            onChange={(e) => handleSelectFilterCat(e)}
                                        />
                                        <label className="form-check-label" htmlFor="only-selected-select">
                                            Only Selected
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <span className="bg-light d-block rounded ps-2 py-2 my-3">Portions</span>
                                    <div>
                                        {portionSizes?.map((item, index) => (
                                            <div key={index} className="form-check form-check-end mb-1">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    value={item.portion_size_id}
                                                    id={`portion-sizes-${item.portion_size_id}`}
                                                    onChange={(e) => handleSelectFilterCat(e, item.is_default)}
                                                    name="portion_size_id"
                                                />
                                                <label className="form-check-label" htmlFor={`portion-sizes-${item.portion_size_id}`}>
                                                    {item.portion_size_name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    {
                                        Object.keys(mealCategories)?.map((name, index) => (
                                            <React.Fragment key={index}>
                                                <span className="bg-light d-block rounded ps-2 py-2 my-3">{name}</span>
                                                {mealCategories[name]?.map((item, i) => (
                                                    <div className="form-check form-check-end mb-1" key={i}>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            value={item.meal_category_id}
                                                            id={item.meal_category_id}
                                                            onChange={handleSelectFilterCat}
                                                            name="meal_category_id"
                                                        />
                                                        <label className="form-check-label" htmlFor={item.meal_category_id}>
                                                            {item.meal_category_name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <div className="col-md-9">
                                <div className="sub-recipe-mdl-tbl sub-recipe-mdl-main">
                                    <DataTable data={data} options={options} tableCallBack={tableCallBack} columns={columns} />
                                    {isLastData && (
                                        <button
                                            className="btn btn-white border-secondary w-100 d-flex align-items-center justify-content-center"
                                            onClick={handleLoadMoreData}
                                        >
                                            {isLoadingBtn ? (
                                                <SelectLoader />
                                            ) : (
                                                <>
                                                    Load More
                                                    <i className="bx bx-down-arrow-circle fs-4 ms-2"></i>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <ModalFooter className="d-flex justify-content-center">
                    <button className="close-btn-white" onClick={() => states.setShowMealsModal(false)}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={states.cloneMealsModal} centered size="lg" className="modal">
                <div className="modal-header">
                    <h5 className="modal-title mt-0">
                        Select the Day you want to clone a Menu to
                    </h5>
                    <button
                        type="button"
                        onClick={() => {
                            states.setCloneMealsModal(false);
                        }}
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="modal-body">
                    <p>
                        Use this feature to clone a specific menu until a certain date range. For Example, if you have a menu you'd like cloned for the next 3 weeks, choose your starting date and the ending date (the last day that menu will be active). Every delivery or pickup day in between those date range that has a menu already selected will not be affected, all other days will have the menu available.
                    </p>
                    <div className="row">
                        <div className='col-6'>
                            <label>Start Date</label>
                            <input
                                className="form-control"
                                name="startDate"
                                type="date"
                                onChange={handleDateChange}
                                value={date.startDate ?? ''}
                            />
                        </div>
                        <div className='col-6'>
                            <label>End Date</label>
                            <input
                                className="form-control"
                                name="endDate"
                                type="date"
                                onChange={handleDateChange}
                                value={date.endDate ?? ''}
                            />
                        </div>
                        <div className='col-12 mt-3'>
                            <label>Select Kitchens</label>
                            <Select
                                name="kitchen_location_id"
                                isMulti={true}
                                options={context?.kitchen_loc_list?.map((f) => ({
                                    label: f.kitchen_loc_name,
                                    value: f.kitchen_location_id,
                                }))}
                                value={selectedKitchenIds}
                                onChange={setSelectedKitchenIds}
                                className="select2-selection"
                            />
                        </div>
                    </div>
                </div>
                <ModalFooter className="d-flex justify-content-center">
                    <button className="btn btn-success" onClick={handleCloneMenu}>
                        {isLoadingBtn ? (
                            <IconLoader />
                        ) : 'Clone Menu'}
                    </button>
                </ModalFooter>
            </Modal>
        </>
    );
}
