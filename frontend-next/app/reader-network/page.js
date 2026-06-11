'use client';

// Force fully-dynamic rendering — page reads localStorage/window at render time.
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readingRoomService, socialService, bookService } from '../lib/api';
import '../assets/css/reader-network.css';

const ReaderNetwork = () => {
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [following, setFollowing] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedMood, setSelectedMood] = useState('cozy');
    const [moodBooks, setMoodBooks] = useState([]);

    const fetchMoodBooks = async (mood) => {
        try {
            const res = await bookService.getByMood(mood);
            setMoodBooks(res.data || []);
        } catch (err) {
            console.error("Failed to load mood books", err);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchFollowingList();
    }, []);

    useEffect(() => {
        fetchMoodBooks(selectedMood);
    }, [selectedMood]);

    const fetchRooms = async () => {
        try {
            const res = await readingRoomService.getAll();
            setRooms(res.data || []);
        } catch (err) {
            console.error("Failed to load reading rooms", err);
        }
    };

    const fetchFollowingList = async () => {
        try {
            const currentUserStr = localStorage.getItem('user');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                const res = await socialService.getFollowing();
                setFollowing(res.data?.content || res.data || []);
            }
        } catch (err) {
            console.error("Failed to load following list", err);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await socialService.search(query);
            setSearchResults(res.data || []);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const toggleFollow = async (userId, isCurrentlyFollowing) => {
        try {
            if (isCurrentlyFollowing) {
                await socialService.unfollow(userId);
            } else {
                await socialService.follow(userId);
            }
            handleSearch(searchQuery);
            fetchFollowingList();
        } catch (err) {
            console.error("Follow/unfollow failed", err);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!newRoomName.trim()) {
            setErrorMsg("Room name is required");
            return;
        }
        try {
            await readingRoomService.create({ name: newRoomName, description: newRoomDesc });
            setNewRoomName('');
            setNewRoomDesc('');
            setShowCreateModal(false);
            setSuccessMsg("Reading room created successfully!");
            fetchRooms();
        } catch (err) {
            setErrorMsg("Failed to create reading room. Please try again.");
            console.error("Create room failed", err);
        }
    };

    const moodIcons = {
        cozy: 'fa-solid fa-mug-hot',
        melancholic: 'fa-solid fa-cloud-showers-heavy',
        adventurous: 'fa-solid fa-compass',
        suspenseful: 'fa-solid fa-mask',
        reflective: 'fa-solid fa-brain'
    };

    return (
        <div className="reader-network-page">
            {/* Hero Section */}
            <div className="rn-hero">
                <div className="container text-center">
                    <h1>Build your <span>Reader Network</span></h1>
                    <p>Connect with bibliophiles in your neighborhood, join curated clubs, and share the magic of a good story.</p>
                    <button className="rn-btn-join mt-4 px-5 py-3" onClick={() => setShowCreateModal(true)}>
                        <i className="fa-solid fa-plus me-2" aria-hidden="true"></i> Host a New Room
                    </button>
                </div>
            </div>

            <div className="container my-5">
                {successMsg && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert" aria-live="polite">
                        {successMsg}
                        <button type="button" className="btn-close" aria-label="Dismiss" onClick={() => setSuccessMsg('')}></button>
                    </div>
                )}

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        <section className="rn-section pb-0 pt-0">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="rn-section-title mb-0">Public Virtual Reading Rooms</h2>
                                <button className="btn btn-primary rounded-pill btn-sm" onClick={() => setShowCreateModal(true)}>
                                    + Host Room
                                </button>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="text-center p-5 border rounded bg-light">
                                    <i className="fa-solid fa-book-open display-4 text-muted mb-3" aria-hidden="true"></i>
                                    <p className="text-muted">No active virtual reading rooms. Be the first to host one!</p>
                                    <button className="btn btn-outline-primary rounded-pill mt-2" onClick={() => setShowCreateModal(true)}>
                                        Create Room
                                    </button>
                                </div>
                            ) : (
                                <div className="row">
                                    {rooms.map(room => (
                                        <div className="col-md-6 mb-4" key={room.id}>
                                            <div className="rn-card h-100 d-flex flex-column justify-content-between">
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <span className="rn-badge rn-badge-blue">Hosted by {room.createdBy?.fullName || 'User'}</span>
                                                        <i className="fa-regular fa-bookmark text-muted" aria-hidden="true"></i>
                                                    </div>
                                                    <h4 className="fw-bold mt-2">{room.name}</h4>
                                                    <p className="text-muted small">{room.description || "Grab your favorite book and join this cozy virtual club."}</p>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                                    <span className="small text-muted">
                                                        <i className="fa-regular fa-clock me-1" aria-hidden="true"></i> Active
                                                    </span>
                                                    <button className="rn-btn-join btn-sm" onClick={() => router.push(`/reading-room/${room.id}`)}>
                                                        Join Room
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rn-section rn-mood-section">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h2 className="rn-section-title rn-mood-section-title mb-1">
                                        <i className="fa-solid fa-wand-magic-sparkles text-primary me-2" aria-hidden="true"></i>AI Mood Matchmaker
                                    </h2>
                                    <p className="text-muted small mb-0">Select your current reading vibe to find book recommendations matching your mood.</p>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Mood selection">
                                {['cozy', 'melancholic', 'adventurous', 'suspenseful', 'reflective'].map((mood) => (
                                    <button
                                        key={mood}
                                        className={`rn-mood-btn${selectedMood === mood ? ' active' : ''}`}
                                        onClick={() => setSelectedMood(mood)}
                                        aria-pressed={selectedMood === mood}
                                    >
                                        <i className={`${moodIcons[mood]} me-1`} aria-hidden="true"></i>
                                        {mood}
                                    </button>
                                ))}
                            </div>

                            {moodBooks.length === 0 ? (
                                <p className="text-muted small">No books found matching this mood on our shelves yet.</p>
                            ) : (
                                <div className="row">
                                    {moodBooks.map((mBook) => (
                                        <div className="col-md-4 mb-3" key={mBook.id}>
                                            <button
                                                className="rn-mood-book-card"
                                                onClick={() => router.push(`/shop-detail/${mBook.id}`)}
                                            >
                                                <img
                                                    src={mBook.coverUrl}
                                                    alt={`Cover of ${mBook.title}`}
                                                    width="80"
                                                    height="115"
                                                    className="rn-mood-book-cover"
                                                />
                                                <h6 className="rn-mood-book-title">
                                                    {mBook.title}
                                                </h6>
                                                <span className="text-muted rn-mood-book-author">
                                                    By {mBook.author}
                                                </span>
                                                <span className="rn-mood-tag">
                                                    {selectedMood}
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rn-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="rn-section-title mb-0">Community Clubs</h2>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400" alt="" width="400" height="200" className="rn-club-img" aria-hidden="true" />
                                        <div className="rn-club-content">
                                            <span className="small text-warning fw-bold mb-1 d-block"><i className="fa-solid fa-star me-1" aria-hidden="true"></i> TRENDING</span>
                                            <h5 className="fw-bold">The Inkwell Society</h5>
                                            <p className="text-muted small mb-4">A haven for lovers of classic literature and deep thematic analysis.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">1.2k Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" alt="" width="400" height="200" className="rn-club-img" aria-hidden="true" />
                                        <div className="rn-club-content">
                                            <span className="small text-primary fw-bold mb-1 d-block"><i className="fa-solid fa-bolt me-1" aria-hidden="true"></i> ACTIVE NOW</span>
                                            <h5 className="fw-bold">Neon Odyssey</h5>
                                            <p className="text-muted small mb-4">Exploring speculative fiction, cyberpunk, and the frontiers of space opera.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">850 Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-4">
                                    <div className="rn-club-card">
                                        <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1474367658818-e81f34b73b0a?auto=format&fit=crop&q=80&w=400" alt="" width="400" height="200" className="rn-club-img" aria-hidden="true" />
                                        <div className="rn-club-content">
                                            <span className="small text-info fw-bold mb-1 d-block"><i className="fa-solid fa-leaf me-1" aria-hidden="true"></i> NEWEST</span>
                                            <h5 className="fw-bold">Modern Prose Collective</h5>
                                            <p className="text-muted small mb-4">Dedicated to contemporary fiction, short stories, and emerging voices.</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="small text-muted">420 Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* User Finder Search */}
                        <div className="rn-friends-sidebar mb-4">
                            <h5 className="fw-bold mb-3">Find Readers</h5>
                            <label htmlFor="reader-search" className="visually-hidden">Search readers by name or email</label>
                            <div className="input-group">
                                <input
                                    id="reader-search"
                                    type="search"
                                    className="form-control rounded-start-pill"
                                    placeholder="Search by name or email\u2026"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                <span className="input-group-text bg-white rounded-end-pill" aria-hidden="true">
                                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                                </span>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="rn-search-results mt-3 border rounded p-2 bg-light shadow-sm" role="list" aria-label="Search results">
                                    {searchResults.map(user => (
                                        <div key={user.id} className="d-flex align-items-center justify-content-between p-2 border-bottom" role="listitem">
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={user.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                                                    alt=""
                                                    width="32"
                                                    height="32"
                                                    className="rounded-circle border"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="mb-0 fw-bold small">{user.fullName}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</small>
                                                </div>
                                            </div>
                                            <button
                                                className={`btn btn-xs rounded-pill px-2 py-1 ${user.isFollowing ? 'btn-outline-danger' : 'btn-primary'}`}
                                                style={{ fontSize: '0.7rem' }}
                                                aria-label={user.isFollowing ? `Unfollow ${user.fullName}` : `Follow ${user.fullName}`}
                                                onClick={() => toggleFollow(user.id, user.isFollowing)}
                                            >
                                                {user.isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Following List */}
                        <div className="rn-friends-sidebar">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Following ({following.length})</h5>
                            </div>

                            {following.length === 0 ? (
                                <p className="small text-muted text-center py-3">You aren&apos;t following anyone yet. Search for friends above!</p>
                            ) : (
                                following.map(user => (
                                    <div className="friend-item d-flex align-items-center gap-2 mb-3" key={user.id}>
                                        <img
                                            src={user.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                                            alt=""
                                            width="36"
                                            height="36"
                                            className="friend-avatar"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div className="friend-info">
                                            <h6 className="mb-0 fw-bold">{user.fullName}</h6>
                                            <span className="small text-muted">{user.email}</span>
                                        </div>
                                        <button
                                            className="btn btn-outline-secondary btn-sm ms-auto rounded-pill py-0 px-2"
                                            style={{ fontSize: '0.75rem' }}
                                            aria-label={`Unfollow ${user.fullName}`}
                                            onClick={() => toggleFollow(user.id, true)}
                                        >
                                            Unfollow
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Host Section */}
                <div className="rn-host-box my-5">
                    <div className="row align-items-center">
                        <div className="col-lg-5">
                            <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" alt="Library with warm lighting" width="600" height="400" className="img-fluid rounded-4 shadow-lg" />
                        </div>
                        <div className="col-lg-7">
                            <h2 className="rn-section-title">Host a Virtual Reading Room</h2>
                            <p className="text-muted">Set up your own digital sanctuary, invite friends, play ambient music, and read together in a distraction-free space.</p>
                            <div className="d-flex gap-3 mt-4">
                                <button className="btn btn-primary px-4 py-2 rounded-pill fw-bold" onClick={() => setShowCreateModal(true)}>
                                    Create a Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal show d-block rn-modal-backdrop" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '15px' }}>
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Host a Virtual Reading Room</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateRoom}>
                                <div className="modal-body">
                                    {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}
                                    <div className="mb-3">
                                        <label htmlFor="room-name" className="form-label fw-bold">Room Name</label>
                                        <input
                                            id="room-name"
                                            type="text"
                                            className="form-control"
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            placeholder="e.g. Silent Coffee Shop Lounge\u2026"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="room-desc" className="form-label fw-bold">Description</label>
                                        <textarea
                                            id="room-desc"
                                            className="form-control"
                                            rows="3"
                                            value={newRoomDesc}
                                            onChange={(e) => setNewRoomDesc(e.target.value)}
                                            placeholder="Describe what you want to read or talk about here\u2026"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill">Create &amp; Join</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReaderNetwork;
