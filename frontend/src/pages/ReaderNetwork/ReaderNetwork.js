import React from 'react';
import '../../assets/css/reader-network.css';

const ReaderNetwork = () => {
    return (
        <div className="reader-network-page">
            {/* Hero Section */}
            <div className="rn-hero">
                <div className="container">
                    <h1>Build your <span>Reader Network</span></h1>
                    <p>Connect with bibliophiles in your neighborhood, join curated clubs, and share the magic of a good story.</p>
                    <button className="rn-btn-join mt-4">Join Room</button>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        <section className="rn-section pb-0">
                            <h2 className="rn-section-title">Public Virtual Reading Rooms</h2>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <div className="rn-card">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <span className="rn-badge rn-badge-yellow">Public Library Mall</span>
                                            <i className="fa-regular fa-heart text-muted"></i>
                                        </div>
                                        <h4 className="fw-bold mt-2">Classic Literature Morning</h4>
                                        <p className="text-muted small">Discussing 'Pride & Prejudice' over artisanal coffee at the Central Library gardens.</p>
                                        <div className="d-flex flex-column gap-2 small text-muted mb-4">
                                            <span><i className="fa-regular fa-calendar me-2"></i>Sat, Oct 14 • 10:00 AM</span>
                                            <span><i className="fa-solid fa-location-dot me-2"></i>Brooklyn Central Branch</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="avatar-group d-flex">
                                                <img src="https://i.pravatar.cc/150?u=a" alt="" className="rounded-circle border border-white" style={{width: '30px', height: '30px', marginRight: '-10px'}} />
                                                <img src="https://i.pravatar.cc/150?u=b" alt="" className="rounded-circle border border-white" style={{width: '30px', height: '30px', marginRight: '-10px'}} />
                                                <div className="rounded-circle border border-white bg-light d-flex align-items-center justify-content-center small fw-bold" style={{width: '30px', height: '30px', fontSize: '0.7rem'}}>+12</div>
                                            </div>
                                            <button className="rn-btn-join btn-sm">Join Room</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <div className="rn-card">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <span className="rn-badge rn-badge-blue">Cozy Reading Room</span>
                                            <i className="fa-regular fa-bookmark text-muted"></i>
                                        </div>
                                        <h4 className="fw-bold mt-2">Silent Reading Hour</h4>
                                        <p className="text-muted small">Bring your current read and enjoy a curated lofi study session in a quiet, sunlit loft.</p>
                                        <div className="d-flex flex-column gap-2 small text-muted mb-4">
                                            <span><i className="fa-regular fa-calendar me-2"></i>Wed, Oct 11 • 6:30 PM</span>
                                            <span><i className="fa-solid fa-location-dot me-2"></i>The Nook Collective</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="avatar-group d-flex">
                                                <img src="https://i.pravatar.cc/150?u=c" alt="" className="rounded-circle border border-white" style={{width: '30px', height: '30px', marginRight: '-10px'}} />
                                                <img src="https://i.pravatar.cc/150?u=d" alt="" className="rounded-circle border border-white" style={{width: '30px', height: '30px', marginRight: '-10px'}} />
                                                <div className="rounded-circle border border-white bg-light d-flex align-items-center justify-content-center small fw-bold" style={{width: '30px', height: '30px', fontSize: '0.7rem'}}>+8</div>
                                            </div>
                                            <button className="rn-btn-join btn-sm">Join Room</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rn-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="rn-section-title mb-0">Community Clubs</h2>
                                <button className="btn btn-outline-primary rounded-pill btn-sm">Explore All Clubs</button>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400" alt="" className="rn-club-img" />
                                        <div className="rn-club-content">
                                            <span className="small text-warning fw-bold mb-1 d-block"><i className="fa-solid fa-star me-1"></i> TRENDING</span>
                                            <h5 className="fw-bold">The Inkwell Society</h5>
                                            <p className="text-muted small mb-4">A haven for lovers of classic literature and deep thematic analysis.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">1.2k Members</span>
                                                <i className="fa-solid fa-arrow-right text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" alt="" className="rn-club-img" />
                                        <div className="rn-club-content">
                                            <span className="small text-primary fw-bold mb-1 d-block"><i className="fa-solid fa-bolt me-1"></i> ACTIVE NOW</span>
                                            <h5 className="fw-bold">Neon Odyssey</h5>
                                            <p className="text-muted small mb-4">Exploring speculative fiction, cyberpunk, and the frontiers of space opera.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">850 Members</span>
                                                <i className="fa-solid fa-arrow-right text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img src="https://images.unsplash.com/photo-1474367658818-e81f34b73b0a?auto=format&fit=crop&q=80&w=400" alt="" className="rn-club-img" />
                                        <div className="rn-club-content">
                                            <span className="small text-info fw-bold mb-1 d-block"><i className="fa-solid fa-leaf me-1"></i> NEWEST</span>
                                            <h5 className="fw-bold">Modern Prose Collective</h5>
                                            <p className="text-muted small mb-4">Dedicated to contemporary fiction, short stories, and emerging voices.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">420 Members</span>
                                                <i className="fa-solid fa-arrow-right text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="rn-friends-sidebar mt-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Friends in Rooms</h5>
                                <span className="badge bg-danger rounded-pill" style={{fontSize: '0.6rem'}}>Active Now</span>
                            </div>
                            <div className="friend-item">
                                <img src="https://i.pravatar.cc/150?u=sarah" alt="" className="friend-avatar" />
                                <div className="friend-info">
                                    <h6>Sarah J.</h6>
                                    <p>in <span className="text-primary">Cozy Reading Room</span></p>
                                </div>
                                <i className="fa-solid fa-arrow-right-to-bracket ms-auto text-muted cursor-pointer"></i>
                            </div>
                            <div className="friend-item">
                                <img src="https://i.pravatar.cc/150?u=marcus" alt="" className="friend-avatar" />
                                <div className="friend-info">
                                    <h6>Marcus V.</h6>
                                    <p>in <span className="text-primary">Sci-Fi Lounge</span></p>
                                </div>
                                <i className="fa-solid fa-arrow-right-to-bracket ms-auto text-muted cursor-pointer"></i>
                            </div>
                            <div className="text-center mt-4">
                                <p className="small text-muted">Connect with friends to see where they are reading!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Host Section */}
                <div className="rn-host-box my-5">
                    <div className="row align-items-center">
                        <div className="col-lg-5">
                            <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" alt="" className="img-fluid rounded-4 shadow-lg" />
                        </div>
                        <div className="col-lg-7">
                            <h2 className="rn-section-title">Host a Virtual Reading Room</h2>
                            <p className="text-muted">Set up your own digital sanctuary, invite friends, play ambient music, and read together in a distraction-free space.</p>
                            <div className="d-flex gap-3 mt-4">
                                <button className="btn btn-primary px-4 py-2 rounded-pill fw-bold">Create a Room</button>
                                <button className="btn btn-outline-dark px-4 py-2 rounded-pill fw-bold">Learn More</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="rn-host-box mb-5 text-center d-block">
                    <h2 className="rn-section-title">Can't find your tribe?</h2>
                    <p className="text-muted mb-4">Start your own Community Club and invite readers with similar tastes to join you on a literary journey.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-primary px-5 py-3 rounded-pill fw-bold">Create a Club</button>
                        <button className="btn btn-outline-dark px-5 py-3 rounded-pill fw-bold">How it works</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReaderNetwork;
