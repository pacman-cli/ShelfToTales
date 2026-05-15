import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, userService } from '../../api/api';
import Swal from 'sweetalert2';

// Styles & Images
import './AuthLayout.css';
import loginImage from '../../assets/images/login-signup.jpg';

const GOOGLE_CLIENT_ID = '908376284076-qp26p58bj59uatj3am37l9dk6sqm5bcb.apps.googleusercontent.com';

function Login(){
    const [forgotPass, setForgotPass] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                { theme: 'outline', size: 'large', width: 250, text: 'continue_with' }
            );
        }
    }, []);

    const handleGoogleResponse = async (response) => {
        try {
            console.log('Google token received, sending to backend...');
            const res = await authService.googleAuth(response.credential);
            localStorage.setItem('token', res.data.token);
            const profileRes = await userService.getProfile();
            localStorage.setItem('user', JSON.stringify(profileRes.data));
            Swal.fire('Success', 'Logged in with Google', 'success');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Google auth error:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            Swal.fire('Error', error.response?.data?.message || error.message || 'Google login failed', 'error');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login({ email, password });
            localStorage.setItem('token', response.data.token);
            // Fetch full profile — this is the canonical user data
            const profileRes = await userService.getProfile();
            localStorage.setItem('user', JSON.stringify(profileRes.data));
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
                        
                        <div id="google-signin-btn" className="auth-google-btn"></div>

                        <div className="auth-divider"><span>or</span></div>
                        
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
                        </form>

                        <div className="auth-switch-link">
                            Don't have an account? <Link to="/shop-registration">Sign up here</Link>
                        </div>
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

