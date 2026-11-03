import React, { useEffect } from 'react'
import { useAuth } from '../../../admin/hooks/useAuth';
import { Card, CardBody, Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

export default function Verify() {
    const navigate = useNavigate();
    const { resendEmailVerification, verifyEmail } = useAuth();

    useEffect(() => {
        resend();
    }, [])

    const resend = async () => {
        await resendEmailVerification();
    };

    useEffect(() => {
        verifyEmail('is_mount');
    }, [verifyEmail]);

    return (
        <React.Fragment>
            <div className="account-pages my-5 pt-sm-5">
                <Container>
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6 col-xl-5">
                            <Card className="overflow-hidden">
                                <div className="bg-primary-subtle">
                                    <div className="text-primary text-center">
                                        <h5 className="text-primary m-0 py-3">Confirm your email</h5>
                                    </div>
                                </div>
                                <CardBody className="text-center">
                                    <div>
                                        <div className="px-5 fw-normal">
                                            We&apos;ve sent an email to your inbox - please click that link to activate your account.
                                            Didn&apos;t receive it?{' '}
                                            <span className="text-decoration-underline text-primary fw-bolder cursor-pointer" onClick={resend}>Click Here</span> to
                                            resend!
                                        </div>
                                        <div className="d-flex justify-content-center align-items-center mt-4">
                                            <button className="btn btn-primary me-1" onClick={() => navigate("/login")}>
                                                Back To Login
                                            </button>
                                            <button className="btn btn-primary" onClick={() => verifyEmail('is_dashboard')}>
                                                Go To dashboard
                                            </button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <div className="mt-5 text-center">
                                <p>© {new Date().getFullYear()} TTP Fitness.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    )
}
