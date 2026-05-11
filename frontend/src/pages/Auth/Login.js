import React,{useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { authService } from '../../api/api';
import Swal from 'sweetalert2';

//Components 
import PageTitle from '../../components/layout/PageTitle';

function Login(){
    const [forgotPass, setForgotPass] = useState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login({ username: email, password: password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            Swal.fire('Success', 'Logged in successfully', 'success');
            window.location.href = '/dashboard'; 
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Login failed', 'error');
        }
    };

    return(
        <>
            <div className="page-content">
                <PageTitle  parentPage="Shop" childPage="Login" />               
                <section className="content-inner shop-account">                    
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 mb-4">
                                <div className="login-area">
                                    <div className="tab-content">
                                        <h4>NEW CUSTOMER</h4>
                                        <p>By creating an account with our store, you will be able to move through the checkout process faster, store multiple shipping addresses, view and track your orders in your account and more.</p>
                                        <Link to={"/shop-registration"} className="btn btn-primary btnhover m-r5 button-lg radius-no">CREATE AN ACCOUNT</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 mb-4">
                                <div className="login-area">
                                    <div className="tab-content nav">
                                        <form onSubmit={handleLogin} className={` col-12 ${forgotPass ? 'd-none' : ''}`}>
                                            <h4 className="text-secondary">LOGIN</h4>
                                            <p className="font-weight-600">If you have an account with us, please log in.</p>
                                            <div className="mb-4">
                                                <label className="label-title">E-MAIL *</label>
                                                <input 
                                                    name="dzName" 
                                                    required="" 
                                                    className="form-control" 
                                                    placeholder="Your Email Id" 
                                                    type="email" 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="label-title">PASSWORD *</label>
                                                <input 
                                                    name="dzName" 
                                                    required="" 
                                                    className="form-control " 
                                                    placeholder="Type Password" 
                                                    type="password" 
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <button type="submit" className="btn btn-primary btnhover me-2">login</button>
                                                <Link to={"#"}  className="m-l5"
                                                    onClick={()=>setForgotPass(!forgotPass)}
                                                >
                                                    <i className="fas fa-unlock-alt"></i> Forgot Password
                                                </Link> 
                                            </div>
                                        </form>
                                        <form  onSubmit={(e) => e.preventDefault()} className={`  col-12 ${forgotPass ? '' : 'd-none'}`} >
                                            <h4 className="text-secondary">FORGET PASSWORD ?</h4>
                                            <p className="font-weight-600">We will send you an email to reset your password. </p>
                                            <div className="mb-3">
                                                <label className="label-title">E-MAIL *</label>
                                                <input name="dzName" required="" className="form-control" placeholder="Your Email Id" type="email" />
                                            </div>
                                            <div className="text-left"> 
                                                <Link to={"#"} className="btn btn-outline-secondary btnhover m-r10 active"
                                                    onClick={()=>setForgotPass(!forgotPass)}
                                                >Back</Link>
                                                <button type="submit" className="btn btn-primary btnhover">Submit</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    
                </section>
            </div>
        </>
    )
}
export default Login;

