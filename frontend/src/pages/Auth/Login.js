import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/api';
import Swal from 'sweetalert2';

// Styles & Images
import './AuthLayout.css';
import loginImage from '../../assets/images/login-signup.jpg';

function Login(){
    const [forgotPass, setForgotPass] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login({ email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            Swal.fire('Success', 'Logged in successfully', 'success');
            window.location.href = '/dashboard'; 
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Login failed', 'error');
        }
    };

    return(
        <div className="auth-split-container">
            <div className="auth-form-side">
                {!forgotPass ? (
                    <>
                        <h1 className="auth-heading">Welcome Back!</h1>
                        <p className="auth-subheading">Sign in to continue leafing through<br />your favorite literature today.</p>
                        
                        <form onSubmit={handleLogin}>
                            <div className="auth-input-group">
                                <label className="auth-input-label">Email</label>
                                <input 
                                    className="auth-input" 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="auth-input-group">
                                <label className="auth-input-label">Password</label>
                                <input 
                                    className="auth-input" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="auth-checkbox-group" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                                <Link to="#" onClick={(e) => { e.preventDefault(); setForgotPass(true); }}>Forgot Password?</Link>
                            </div>
                            
                            <button type="submit" className="auth-submit-btn">Login</button>
                            
                            <div className="auth-switch-link">
                                Don't have an account? <Link to="/shop-registration">Sign up here</Link>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className="auth-heading">Forgot Password?</h1>
                        <p className="auth-subheading">We will send you an email to reset your password.</p>
                        
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="auth-input-group">
                                <label className="auth-input-label">Email</label>
                                <input 
                                    className="auth-input" 
                                    type="email" 
                                    required
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="button" className="auth-submit-btn" style={{ backgroundColor: '#ccc', color: '#333' }} onClick={() => setForgotPass(false)}>Back</button>
                                <button type="submit" className="auth-submit-btn">Submit</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            
            <div className="auth-image-side">
                <img src={loginImage} alt="Girl reading a book with a cat" />
            </div>
        </div>
    )
}
export default Login;

