import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { userService } from '../../api/api';
import Swal from 'sweetalert2';

import profile from '../../assets/images/profile3.jpg';

const proiflePages = [
    {to:'/shop-cart', icons:'flaticon-shopping-cart-1', name:'My Cart'},
    {to:'/wishlist', icons:'far fa-heart', name:'Wishlist'},
    {to:'/books-grid-view', icons:'fa fa-briefcase', name:'Shop'},
    {to:'/shop-login', icons:'fas fa-sign-out-alt', name:'Log Out'},
];

function MyProfile(){
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getProfile();
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateProfile(userData);
            Swal.fire('Success', 'Profile updated successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update profile', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return(
        <>
             <div className="page-content bg-white">
                <div className="content-block">
                    <section className="content-inner bg-white">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-3 col-lg-4 m-b30">
                                    <div className="sticky-top">
                                        <div className="shop-account">
                                            <div className="account-detail text-center">
                                                <div className="my-image">
                                                    <Link to={"#"}>
                                                        <img alt="profile" src={profile} />
                                                    </Link>
                                                </div>
                                                <div className="account-title">
                                                    <div className="">
                                                        <h4 className="m-b5"><Link to={"#"}>{userData.firstName} {userData.lastName}</Link></h4>
                                                        <p className="m-b0"><Link to={"#"}>{userData.email}</Link></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <ul className="account-list">
                                                <li>
                                                    <Link to={"/my-profile"} className="active"><i className="far fa-user" aria-hidden="true"></i> 
                                                    <span>Profile</span></Link>
                                                </li>
                                                {proiflePages.map((item, ind)=>(
                                                    <li key={ind}>
                                                        <Link to={item.to} onClick={item.name === 'Log Out' ? handleLogout : null}>
                                                            <i className={item.icons}></i>
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}                                                
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-9 col-lg-8 m-b30">
                                    <div className="shop-bx shop-profile">
                                        <div className="shop-bx-title clearfix">
                                            <h5 className="text-uppercase">Basic Information</h5>
                                        </div>
                                        <form onSubmit={handleSubmit}>
                                            <div className="row m-b30">
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">First Name :</label>
                                                        <input type="text" name="firstName" className="form-control" value={userData.firstName || ''} onChange={handleChange} />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Last Name :</label>
                                                        <input type="text" name="lastName" className="form-control" value={userData.lastName || ''} onChange={handleChange} />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Email :</label>
                                                        <input type="email" className="form-control" value={userData.email || ''} readOnly />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Phone :</label>
                                                        <input type="text" name="phone" className="form-control" value={userData.phone || ''} onChange={handleChange} />
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary btnhover mt-2">Save Setting</button>
                                        </form>
                                    </div>    
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
             </div>
        </>
    )
}
export default MyProfile;

