import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/api';
import Swal from 'sweetalert2';

// Styles & Images
import './AuthLayout.css';
import loginImage from '../../assets/images/login-signup.jpg';

function Registration(){
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!termsAccepted) {
            Swal.fire('Notice', 'Please agree to the Terms & Conditions', 'warning');
            return;
        }

        try {
            // Note: Sending fullName instead of username to match the updated backend
            await authService.register({ fullName, email, password });
            Swal.fire('Success', 'Account created successfully! Please login.', 'success');
            navigate('/shop-login');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
        }
    };

    return(
        <div className="auth-split-container">
            <div className="auth-form-side">
                <h1 className="auth-heading">Ready to start your<br />success story?</h1>
                <p className="auth-subheading">Signup to our website and start leafing<br />through your favorite literature today!</p>
                
                <form onSubmit={handleRegister}>
                    <div className="auth-input-group">
                        <label className="auth-input-label">Full name</label>
                        <input 
                            className="auth-input" 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    
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
                    
                    <div className="auth-checkbox-group">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                        <label htmlFor="terms">I agree to the <Link to="/privacy-policy">Terms & Conditions</Link></label>
                    </div>
                    
                    <button type="submit" className="auth-submit-btn">Sign up</button>
                    
                    <div className="auth-switch-link">
                        Already have an account? <Link to="/shop-login">Login here</Link>
                    </div>
                </form>
            </div>
            
            <div className="auth-image-side">
                <img src={loginImage} alt="Girl reading a book with a cat" />
            </div>
        </div>
    )
}
export default Registration;

