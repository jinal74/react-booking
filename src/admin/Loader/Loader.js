import React from 'react';
import { Spinner } from 'reactstrap';

export default function Loader() {
    return (
        <div className="loading loading-div">
            <Spinner color="primary" className="position-absolute top-50 start-50" />
        </div>
    );
}
