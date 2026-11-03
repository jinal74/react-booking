import React from 'react'

export default function TitleHeader({ title, link, paragraph, state, container }) {
    return (
        <div className='main-topbar-cls main-title-header'>
            <div className={container ? 'py-2 px-3' : 'container-user'}>
                <div className="row align-items-center">
                    <div className={`col-md-${link ? '6' : '12'} col-12`}>
                        <h1 className="text-white text-center text-md-start my-0">{title}</h1>
                        {
                            paragraph &&
                            <p className="page_subtitle text-center text-md-start text-white">Select the value of the Gift Card you would like to purchase.<br /> Please note: Gift Cards may only be used for online purchases and not valid in the grab and go.</p>
                        }
                    </div>
                    {
                        link &&
                        <div className="col-md-6 col-12 text-md-end text-center">
                            <button type="button" className="btn btn-dark new_button_square_big" onClick={() => state({ show: true, title: `How to Order ${title}?`, link: link })}>
                                <i className="fas fa-question-circle white me-2"></i>
                                How to Order {title}?
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
