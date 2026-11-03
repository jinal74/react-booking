import React from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export default function HowToModal({ data, close }) {
    return (
        <div className="">
            <Modal isOpen={data.show} centered className="modal modal-650 how-to-main position-relative modal-not-centered">
                <ModalHeader className='fw-bold'>{data.title} help video</ModalHeader>
                <ModalBody className='p-0'>
                    <iframe width="100%" height="380" src={data.link} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen=""></iframe>
                </ModalBody>
                <ModalFooter className='p-0 upld-mls-btn overflow-hidden'>
                    <button className='w-100 font-size-16' onClick={() => close({ show: false, title: '', link: '' })}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>
        </div >
    )
}
