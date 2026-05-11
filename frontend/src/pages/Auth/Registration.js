import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/api';
import Swal from 'sweetalert2';

//Components 
import PageTitle from '../../components/layout/PageTitle';

function Registration(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await authService.register({ username, email, password });
            Swal.fire('Success', 'Account created successfully! Please login.', 'success');
            navigate('/shop-login');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
        }
    };

    return(
        <>
            <div className="page-content">
                <PageTitle  parentPage="Shop" childPage="Registration" />               
                <section className="content-inner shop-account">
				
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-md-6 mb-4">
                                <div className="login-area">
                                    <form onSubmit={handleRegister}> 
                                        <h4 className="text-secondary">Registration</h4>
                                        <p className="font-weight-600">If you don't have an account with us, please Registration.</p>
                                        <div className="mb-4">
                                            <label className="label-title">Username *</label>
                                            <input 
                                                name="dzName" 
                                                required="" 
                                                className="form-control" 
                                                placeholder="Your Username" 
                                                type="text" 
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="label-title">Email address *</label>
                                            <input 
                                                name="dzName" 
                                                required="" 
                                                className="form-control" 
                                                placeholder="Your Email address" 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="label-title">Password *</label>
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
                                        <div className="mb-5">
                                            <small>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <Link to={"/privacy-policy"}>privacy policy</Link>.</small>
                                        </div>
                                        <div className="text-left">
                                            <button type="submit" className="btn btn-primary btnhover w-100 me-2">Register</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
            </div>
        </>
    )
}
export default Registration;

