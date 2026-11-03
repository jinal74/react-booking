import React, { useContext, useEffect, useState } from 'react';
import Topbar from '../../../pages/common/Topbar';
import Landing from '../../../pages/common/Landing';
import TitleHeader from '../../components/TitleHeader';
import HowToModal from '../../../pages/ModalsCommon/HowToModal';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../context/GeneralContext';

export default function GiftCards() {
    const navigate = useNavigate();
    const context = useContext(Context);
    const [openHowToModal, setOpenHowToModal] = useState({ show: false, link: '', title: '' });
    const [data, setData] = useState({ name: "", email: "", phone: "", value: 50 });

    useEffect(() => {
        if (context.cartData?.giftcards) setData(context.cartData.giftcards);
    }, [context.cartData])

    const handleChange = (key, value) => {
        let tempData = { ...data };
        tempData[key] = value;
        setData(tempData);
    };

    const SetCartData = () => {
        let cart = JSON.parse(JSON.stringify(context.cartData));

        Object.assign(cart, {
            giftcards: data
        });
        context.setCartData({
            ...cart,
            totalItems: cart.totalItems + (context.cartData?.giftcards ? 0 : 1),
            subTotal: (context.cartData?.giftcards ? (cart.subTotal - context.cartData?.giftcards?.value) : cart.subTotal) + data.value,
        });
        navigate('/cart');
    }

    return (
        <div className="choose_giftcard">
            <Topbar />
            <Landing>
                <TitleHeader
                    title="Gift Card"
                    paragraph={true}
                    state={setOpenHowToModal}
                    link="https://www.youtube.com/embed/C3gPmWZJXtQ?controls=0"
                />
                <div className='container spacer-top spacer_bottom'>
                    <div className=''>
                        <div className='row'>
                            <div className='col-12 mb-3'>
                                <div className={`btn-selector ${data.value === 50 ? 'active' : ''}`} onClick={() => handleChange('value', 50)}>
                                    $50.00
                                </div>
                                <div className={`btn-selector ${data.value === 75 ? 'active' : ''}`} onClick={() => handleChange('value', 75)}>
                                    $75.00
                                </div>
                                <div className={`btn-selector ${data.value === 100 ? 'active' : ''}`} onClick={() => handleChange('value', 100)}>
                                    $100.00
                                </div>
                                <div className={`btn-selector ${data.value === 125 ? 'active' : ''}`} onClick={() => handleChange('value', 125)}>
                                    $125.00
                                </div>
                                <div className={`btn-selector ${data.value === 150 ? 'active' : ''}`} onClick={() => handleChange('value', 150)}>
                                    $150.00
                                </div>
                                <div className={`btn-selector ${data.value === 175 ? 'active' : ''}`} onClick={() => handleChange('value', 175)}>
                                    $175.00
                                </div>
                                <div className={`btn-selector ${data.value === 200 ? 'active' : ''}`} onClick={() => handleChange('value', 200)}>
                                    $200.00
                                </div>
                                <div className={`btn-selector ${data.value === 250 ? 'active' : ''}`} onClick={() => handleChange('value', 250)}>
                                    $250.00
                                </div>
                            </div>
                            <div className='col-md-6 col-sm-12 me-1'>
                                <div className="form-group">
                                    <label className="control-label">Recipient's Name</label>
                                    <input type="text" placeholder="" className="form-control border-bottom-input" onChange={(e) => handleChange('name', e.target.value)} value={data.name} />
                                </div>
                            </div>
                            <div className='col-md-6 col-sm-12'>
                                <div className="form-group">
                                    <label className="control-label">Recipient's Email</label>
                                    <input type="email" placeholder="" className="form-control border-bottom-input" onChange={(e) => handleChange('email', e.target.value)} value={data.email} />
                                </div>
                            </div>
                            <div className='col-md-6 col-sm-12'>
                                <div className="form-group">
                                    <label className="control-label">Recipient's Phone</label>
                                    <input type="text" placeholder="" className="form-control border-bottom-input" onChange={(e) => handleChange('phone', e.target.value)} value={data.phone} />
                                </div>
                            </div>
                            <div className='col-12 text-end'>
                                <button type="submit" className="new_button_square_big btn primary-bg-cls" onClick={SetCartData}>
                                    <i className='fas fa-shopping-basket me-2'></i>
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Landing>

            {openHowToModal.show && <HowToModal data={openHowToModal} close={setOpenHowToModal} />}
        </div>
    )
}
