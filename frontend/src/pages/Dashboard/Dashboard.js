import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../components/layout/PageTitle';
import { userService } from '../../api/api';

// Images
import book1 from '../../assets/images/books/grid/book1.jpg';
import book2 from '../../assets/images/books/grid/book2.jpg';
import book3 from '../../assets/images/books/grid/book3.jpg';

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            userService.getProfile()
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) setUser(JSON.parse(storedUser));
                });
        }
    }, []);

    const feeds = [
        {
            user: 'John Doe',
            time: '2 hours ago',
            content: 'Just finished reading "The Great Gatsby". Highly recommended!',
            image: book1,
            likes: 12,
            comments: 4
        },
        {
            user: 'Jane Smith',
            time: '5 hours ago',
            content: 'New book alert! Check out the latest thriller by Stephen King.',
            image: book2,
            likes: 25,
            comments: 8
        },
        {
            user: 'Alex Johnson',
            time: '1 day ago',
            content: 'Can anyone recommend a good sci-fi book for my weekend?',
            image: book3,
            likes: 15,
            comments: 20
        }
    ];

    const friends = [
        { name: 'Sarah Wilson', status: 'Online' },
        { name: 'Michael Brown', status: 'Offline' },
        { name: 'Emily Davis', status: 'Online' },
        { name: 'Chris Miller', status: 'Online' },
        { name: 'Jessica Taylor', status: 'Offline' }
    ];

    return (
        <div className="page-content bg-grey">
            <PageTitle parentPage="User" childPage="Dashboard" />
            <div className="container py-4">
                <div className="row">
                    {/* Left Sidebar */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
                            <div className="card-body p-0">
                                <div className="p-3 text-center border-bottom">
                                    <img src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=9cd2ef&color=fff&size=80`} alt="profile" className="rounded-circle mb-2" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                    <h5 className="mb-0">{user?.fullName || 'User'}</h5>
                                    <small className="text-muted">{user?.email}</small>
                                </div>
                                <div className="list-group list-group-flush">
                                    <Link to="/my-profile" className="list-group-item list-group-item-action border-0">
                                        <i className="fa-solid fa-user me-2 text-primary"></i> Profile
                                    </Link>
                                    <Link to="/shop-cart" className="list-group-item list-group-item-action border-0">
                                        <i className="fa-solid fa-cart-shopping me-2 text-success"></i> My Cart
                                    </Link>
                                    <Link to="/wishlist" className="list-group-item list-group-item-action border-0">
                                        <i className="fa-solid fa-heart me-2 text-danger"></i> Wishlist
                                    </Link>
                                    <Link to="/purchase-history" className="list-group-item list-group-item-action border-0">
                                        <i className="fa-solid fa-history me-2 text-warning"></i> Purchase History
                                    </Link>
                                    <Link to="/virtual-bookshelf" className="list-group-item list-group-item-action border-0">
                                        <i className="fa-solid fa-book me-2 text-info"></i> Virtual Bookshelf
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* News Feed */}
                    <div className="col-lg-6 col-md-12">
                        {/* Create Post */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <img src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=9cd2ef&color=fff&size=40`} alt="profile" className="rounded-circle me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                    <input type="text" className="form-control rounded-pill bg-light" placeholder={`What's on your mind, ${user?.fullName || 'User'}?`} />
                                </div>
                                <hr />
                                <div className="d-flex justify-content-around">
                                    <button className="btn btn-light btn-sm flex-fill me-2"><i className="fa-solid fa-video text-danger me-1"></i> Live Video</button>
                                    <button className="btn btn-light btn-sm flex-fill me-2"><i className="fa-solid fa-image text-success me-1"></i> Photo/Video</button>
                                    <button className="btn btn-light btn-sm flex-fill"><i className="fa-solid fa-smile text-warning me-1"></i> Feeling</button>
                                </div>
                            </div>
                        </div>

                        {/* Feeds */}
                        {feeds.map((feed, index) => (
                            <div className="card shadow-sm mb-4" key={index}>
                                <div className="card-header bg-white border-0 py-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                            {feed.user.charAt(0)}
                                        </div>
                                        <div>
                                            <h6 className="mb-0">{feed.user}</h6>
                                            <small className="text-muted">{feed.time}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p>{feed.content}</p>
                                    <img src={feed.image} alt="post" className="img-fluid rounded mb-3 w-100" />
                                    <div className="d-flex justify-content-between text-muted small mb-3">
                                        <span><i className="fa-solid fa-thumbs-up me-1"></i> {feed.likes} likes</span>
                                        <span>{feed.comments} comments</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-around">
                                        <button className="btn btn-light btn-sm flex-fill me-1"><i className="fa-solid fa-thumbs-up me-1"></i> Like</button>
                                        <button className="btn btn-light btn-sm flex-fill me-1"><i className="fa-solid fa-comment me-1"></i> Comment</button>
                                        <button className="btn btn-light btn-sm flex-fill"><i className="fa-solid fa-share me-1"></i> Share</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar - Friend List */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="mb-0">Friends List</h6>
                            </div>
                            <div className="card-body p-0">
                                <ul className="list-group list-group-flush">
                                    {friends.map((friend, index) => (
                                        <li className="list-group-item border-0 d-flex align-items-center py-2" key={index}>
                                            <div className="position-relative me-3">
                                                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                                    {friend.name.charAt(0)}
                                                </div>
                                                <span className={`position-absolute bottom-0 end-0 p-1 border border-white rounded-circle ${friend.status === 'Online' ? 'bg-success' : 'bg-secondary'}`} style={{ width: '10px', height: '10px' }}></span>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 small">{friend.name}</h6>
                                                <small className="text-muted d-block" style={{ fontSize: '10px' }}>{friend.status}</small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;


