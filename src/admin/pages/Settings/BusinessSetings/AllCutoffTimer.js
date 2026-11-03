import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { IconLoader } from '../../../Loader/IconLoader';
import moment from 'moment';
import { API_PATH } from '../../../constants/const';
import { PostApi } from '../../../../services/ApiService';

export default function AllCutoffTimer() {
    const current_time = "00:00:00";
    const [isLoading, set_isLoading] = useState(false);
    const [displayError, setDisplayError] = useState({
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
    });
    const [cutoff_arr, set_cutoff_arr] = useState([
        {
            name: 'Sunday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Monday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Tuesday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Wednesday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Thursday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Friday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
        {
            name: 'Saturday',
            is_off: 0,
            close_days_from: 0,
            close_time_on: current_time
        },
    ]);

    useEffect(() => {
        GetCloseDatesConfig();
    }, [])

    const GetCloseDatesConfig = async () => {
        const response = await PostApi(API_PATH.getCloseDatesConfig);
        if (response.statusCode === 200) {
            let data = response.data;
            set_cutoff_arr((prevState) => prevState?.map((f) => ({
                name: f.name,
                is_off: data[0]?.[`is_off_${f.name?.toLowerCase()}`],
                close_days_from: data[0]?.[`close_days_from_${f.name?.toLowerCase()}`],
                close_time_on: data[0]?.[`close_time_on_${f.name?.toLowerCase()}`]
            })));
        }
    }

    const handleChange = (e, name, value) => {
        let temp_arr = [...cutoff_arr];
        let temp_obj = temp_arr?.find((f) => f.name == name);
        let temp_index = temp_arr?.findIndex((f) => f.name == name);

        if (e.target.name == 'is_off') {
            document.getElementById(e.target.id).checked = e.target.checked;
            if (e.target.checked) {
                Object.assign(temp_obj, { [e.target.name]: 1 });
            } else {
                Object.assign(temp_obj, { [e.target.name]: 0, close_time_on: '00:00:00', close_days_from: 0 });
            }
        } else if (e.target.name == 'close_time_on') {
            Object.assign(temp_obj, { [e.target.name]: moment(e.target.value, "HH:mm").format("kk:mm:ss") });
        } else if (e.target.name == 'close_days_from') {
            if (value < 0 || value > 7) {
                setDisplayError((prevState) => ({ ...prevState, [name]: true }));
            } else {
                setDisplayError((prevState) => ({ ...prevState, [name]: false }));
            }
            Object.assign(temp_obj, { [e.target.name]: value });
        }

        temp_arr.splice(temp_index, 1, temp_obj);
        set_cutoff_arr(temp_arr);
    };

    const handleSubmit = async () => {
        set_isLoading(true);
        let temp_arr = [...cutoff_arr];

        const dataToSend = temp_arr.reduce((acc, day) => {
            const { name, is_off, close_days_from, close_time_on } = day;
            const keyPrefix = name.toLowerCase();
            acc[`is_off_${keyPrefix}`] = is_off;
            acc[`close_days_from_${keyPrefix}`] = close_days_from;
            acc[`close_time_on_${keyPrefix}`] = close_time_on;
            return acc;
        }, {});

        const response = await PostApi(API_PATH.saveCloseDatesConfig, dataToSend);
        if (response.statusCode === 200) {
            toast.success('Data updated successfully');
        }
        set_isLoading(false);
    };

    const shouldDisableButton = Object.values(displayError).some(value => value === true);

    const getDaysStartingFrom = (day, count) => {
        let arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const startIndex = arr.indexOf(day);
        if (startIndex !== -1 && count >= 1) {
            let result = [];
            for (let i = 0; i < count; i++) {
                if (i < 7) result.push(arr[(startIndex + i) % 7]);
            }
            return result;
        }
    }

    const handleButtonClick = () => {
        const element = document.getElementById('meal-prep');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <div id="meal-prep"></div>
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center pt-1">
                            <h4 className="mb-sm-0 font-size-18">Cut-off Timer</h4>
                            <div className="ms-auto">
                                <button type="submit" disabled={shouldDisableButton} className={`btn btn-${shouldDisableButton ? 'secondary' : 'success'} px-3`} onClick={handleSubmit}>
                                    {isLoading ? <IconLoader /> : 'SAVE'}
                                </button>
                            </div>
                        </div>
                        <div className="mx-3 mb-3 py-2">
                            <button className='btn btn-success' onClick={handleButtonClick}>
                                Meal Prep
                            </button>
                        </div>

                    </div>
                    <div className="col-12">
                        {
                            cutoff_arr?.map((item, index) => {
                                const days = getDaysStartingFrom(item.name, item.close_days_from);
                                const time = moment(item.close_time_on, "HH:mm:ss").format('hh:mm A');
                                const timeValue = moment(item.close_time_on, "kk:mm:ss").format('HH:mm');

                                return (
                                    <div className="row cutoff-timer-bxs" key={item.name + index}>
                                        <div className="col-md-12 mb-2">
                                            <label className='fw-bold form-check-label mb-2' htmlFor={item.name?.toLowerCase()}>
                                                {item.name}
                                            </label>
                                            <div className="form-check form-switch form-switch-md">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="is_off"
                                                    id={item.name?.toLowerCase()}
                                                    checked={item.is_off == 1}
                                                    onChange={(e) => handleChange(e, item.name)}
                                                />
                                            </div>
                                        </div>
                                        {
                                            item.is_off == 1 &&
                                            <>
                                                <div className='col-md-6 mb-2'>
                                                    <label className={`${displayError?.[item.name] ? 'text-danger' : ''}`}>How many Days to Close?</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="close_days_from"
                                                            type="number"
                                                            placeholder="Enter Days"
                                                            value={item.close_days_from}
                                                            onChange={(e) => handleChange(e, item.name, (Number(e.target.value === '' ? 0 : e.target.value).toString()))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='col-md-6 mb-3'>
                                                    <label>Time to Close?</label>
                                                    <div>
                                                        <input
                                                            className="form-control"
                                                            name="close_time_on"
                                                            type="time"
                                                            value={timeValue}
                                                            onChange={(e) => handleChange(e, item.name)}
                                                        />
                                                    </div>
                                                </div>
                                                <span className='mb-1'>On {item.name} at {time} it will close {days?.join(', ')}</span>
                                            </>
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
