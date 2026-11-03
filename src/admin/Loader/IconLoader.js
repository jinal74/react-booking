import { Spinner } from 'reactstrap';

export const IconLoader = () => {
    return (
        <div className="btn-loader-1">
            <section className="btn-loader"></section>
        </div>
    );
};

export const SelectLoader = () => {
    return (
        <div className="btn-loader-2">
            <section className="btn-loader"></section>
        </div>
    );
};

export const RoundBtnLoader = () => {
    return (
        <div className="loading loading-div-sm">
            <Spinner size="sm" color="light" className="position-absolute top-0 start-0 m-2" />
        </div>
    );
};
