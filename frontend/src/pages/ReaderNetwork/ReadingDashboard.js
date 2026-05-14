import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/reader-network.css';

const ReadingDashboard = () => {
    return (
        <div className="rn-dashboard">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="mb-5 text-center">
                    <div className="bg-light p-3 rounded-4 mb-3 d-inline-block">
                        <span className="text-danger small fw-bold">● Reading Now</span>
                        <p className="mb-0 small fw-bold">Lofi Girl - Study Session</p>
                    </div>
                    <button className="rn-btn-join w-100 btn-sm mt-2">Join Room</button>
                </div>

                <nav>
                    <div className="nav-item-dash active">
                        <i className="fa-solid fa-house"></i>
                        <span>Home</span>
                    </div>
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-compass"></i>
                        <span>Explore</span>
                    </div>
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-bookmark"></i>
                        <span>Bookmarks</span>
                    </div>
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-users"></i>
                        <span>Groups</span>
                    </div>
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-gear"></i>
                        <span>Settings</span>
                    </div>
                </nav>

                <div className="mt-5 pt-5">
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-circle-play"></i>
                        <span>Music Player</span>
                    </div>
                    <div className="nav-item-dash">
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Help</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="fw-bold mb-0">Currently Reading</h2>
                    <Link to="/virtual-bookshelf" className="text-primary text-decoration-none small fw-bold">View Library</Link>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div className="rn-card mb-4" style={{background: '#fffefb'}}>
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" alt="" className="img-fluid rounded-3 shadow" />
                                </div>
                                <div className="col-md-8">
                                    <span className="small text-muted fw-bold">Last read 2h ago</span>
                                    <h2 className="fw-bold my-2" style={{fontSize: '2.5rem'}}>The Quiet Echo</h2>
                                    <p className="text-muted">Elena Thorne</p>
                                    
                                    <div className="mt-4">
                                        <div className="progress mb-2" style={{height: '8px', borderRadius: '10px'}}>
                                            <div className="progress-bar bg-primary" role="progressbar" style={{width: '65%'}} aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                        <span className="small text-muted fw-bold">65% Completed</span>
                                    </div>

                                    <button className="btn btn-primary mt-4 px-4 py-2 rounded-pill fw-bold" style={{background: '#8b5a2b', border: 'none'}}>
                                        <i className="fa-solid fa-book-open me-2"></i> Resume Reading
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="rn-card d-flex align-items-center gap-3 p-3">
                                    <img src="https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=100" alt="" className="rounded-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                    <div>
                                        <h6 className="fw-bold mb-1">Digital Horizons</h6>
                                        <span className="small text-muted">Marcus Vane</span>
                                        <div className="progress mt-2" style={{height: '4px', width: '100px'}}>
                                            <div className="progress-bar bg-danger" style={{width: '30%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-4">
                                <div className="rn-card d-flex align-items-center gap-3 p-3">
                                    <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=100" alt="" className="rounded-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                    <div>
                                        <h6 className="fw-bold mb-1">Antique Wisdom</h6>
                                        <span className="small text-muted">Sarah J. Miller</span>
                                        <div className="progress mt-2" style={{height: '4px', width: '100px'}}>
                                            <div className="progress-bar bg-warning" style={{width: '80%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="rn-card h-auto">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Friends Online</h5>
                                <span className="badge bg-warning rounded-pill text-dark" style={{fontSize: '0.65rem'}}>12 Active</span>
                            </div>
                            <div className="friend-item mb-3">
                                <img src="https://i.pravatar.cc/150?u=sophie" alt="" className="friend-avatar" />
                                <div className="friend-info">
                                    <h6>Sophie Chen</h6>
                                    <p className="small text-muted"><i className="fa-solid fa-book-open me-1"></i> Atomic Habits</p>
                                </div>
                                <i className="fa-regular fa-comment-dots ms-auto text-muted"></i>
                            </div>
                            <div className="friend-item mb-3">
                                <img src="https://i.pravatar.cc/150?u=david" alt="" className="friend-avatar" />
                                <div className="friend-info">
                                    <h6>David Wright</h6>
                                    <p className="small text-muted"><i className="fa-solid fa-book-open me-1"></i> Dune</p>
                                </div>
                                <i className="fa-regular fa-comment-dots ms-auto text-muted"></i>
                            </div>
                            <div className="friend-item mb-3">
                                <img src="https://i.pravatar.cc/150?u=amara" alt="" className="friend-avatar" />
                                <div className="friend-info">
                                    <h6>Amara Okafor</h6>
                                    <p className="small text-muted"><i className="fa-solid fa-book-open me-1"></i> Circe</p>
                                </div>
                                <i className="fa-regular fa-comment-dots ms-auto text-muted"></i>
                            </div>
                            <button className="btn btn-outline-dark w-100 rounded-pill btn-sm mt-3 fw-bold">Invite Friends</button>
                        </div>
                    </div>
                </div>

                <div className="rn-music-player">
                    <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300" alt="" className="music-cover" />
                    <div className="flex-grow-1">
                        <span className="small text-muted fw-bold">NOW PLAYING</span>
                        <h2 className="fw-bold my-1">Autumn Rainfall</h2>
                        <p className="text-muted mb-4">By Lofi Girl & Study Beats</p>
                        
                        <div className="d-flex align-items-center gap-3">
                            <i className="fa-solid fa-backward-step cursor-pointer"></i>
                            <div className="bg-primary p-2 rounded-circle text-white d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                                <i className="fa-solid fa-pause"></i>
                            </div>
                            <i className="fa-solid fa-forward-step cursor-pointer"></i>
                            <div className="progress flex-grow-1 mx-3" style={{height: '6px'}}>
                                <div className="progress-bar bg-primary" style={{width: '40%'}}></div>
                            </div>
                            <span className="small text-muted">14:20 / 35:00</span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 justify-content-center" style={{width: '180px'}}>
                        <div className="p-2 border rounded-3 text-center" style={{width: '80px'}}>
                            <i className="fa-solid fa-cloud-showers-heavy d-block mb-1"></i>
                            <span style={{fontSize: '0.65rem'}}>Rain</span>
                        </div>
                        <div className="p-2 border rounded-3 text-center" style={{width: '80px'}}>
                            <i className="fa-solid fa-mug-hot d-block mb-1"></i>
                            <span style={{fontSize: '0.65rem'}}>Cafe</span>
                        </div>
                        <div className="p-2 border rounded-3 text-center" style={{width: '80px'}}>
                            <i className="fa-solid fa-fire d-block mb-1"></i>
                            <span style={{fontSize: '0.65rem'}}>Fire</span>
                        </div>
                        <div className="p-2 border rounded-3 text-center" style={{width: '80px'}}>
                            <i className="fa-solid fa-leaf d-block mb-1"></i>
                            <span style={{fontSize: '0.65rem'}}>Nature</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <h3 className="fw-bold mb-4">Discover what others are devouring this week.</h3>
                    <div className="row">
                        <div className="col-md-7">
                            <p className="text-muted mb-4">Join the conversation in the 'Book-Tok' Reading Room where over 500 readers are currently discussing the latest thriller sensations.</p>
                            <div className="d-flex gap-2 mb-4">
                                <span className="badge rounded-pill bg-light text-dark px-3 py-2">#Suspense</span>
                                <span className="badge rounded-pill bg-light text-dark px-3 py-2">#Bestseller</span>
                                <span className="badge rounded-pill bg-light text-dark px-3 py-2">#Historical</span>
                            </div>
                            <button className="btn btn-primary rounded-pill px-4 py-2" style={{background: '#8b5a2b', border: 'none'}}>Explore Rooms <i className="fa-solid fa-arrow-right ms-2"></i></button>
                        </div>
                        <div className="col-md-5">
                            <div className="d-flex gap-3">
                                <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300" alt="" className="img-fluid rounded-4 shadow" style={{height: '200px', objectFit: 'cover'}} />
                                <img src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300" alt="" className="img-fluid rounded-4 shadow" style={{height: '200px', objectFit: 'cover'}} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingDashboard;
