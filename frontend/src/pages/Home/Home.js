import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../../api/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import './Home.css';

// Existing components (reuse what we have)
import FeaturedSlider from '../../components/features/Home/FeaturedSlider';
import TestimonialSlider from '../../components/features/Home/TestimonialSlider';
import LatestNewsSlider from '../../components/features/Home/LatestNewsSlider';
import NewsLetter from '../../components/features/NewsLetter';
import CounterSection from '../../components/common/CounterSection';

// Demo data for reading rooms
const readingRooms = [
    {
        id: 1,
        title: 'Classic Literature Circle',
        topic: 'Discussing "Pride and Prejudice" — Chapters 20-30',
        participants: 24,
        iconClass: 'purple',
        icon: 'fa-solid fa-book-open',
        colors: ['#EAA451', '#1a1668', '#029e76', '#ff6b6b'],
    },
    {
        id: 2,
        title: 'Sci-Fi Explorers',
        topic: 'Monthly pick: "Dune" by Frank Herbert — Deep dive into world-building',
        participants: 18,
        iconClass: 'golden',
        icon: 'fa-solid fa-rocket',
        colors: ['#3a32b8', '#e58c23', '#00aeff', '#ff1e6f'],
    },
    {
        id: 3,
        title: 'Mystery & Thriller Hub',
        topic: 'Who guessed the twist in "Gone Girl"? Let\'s discuss!',
        participants: 31,
        iconClass: 'green',
        icon: 'fa-solid fa-magnifying-glass',
        colors: ['#029e76', '#EAA451', '#1a1668', '#ff4444'],
    },
];

// Colors for mini bookshelf
const bookColors = [
    '#EAA451', '#1a1668', '#029e76', '#ff6b6b', '#00aeff',
    '#e58c23', '#3a32b8', '#ff1e6f', '#6c5ce7', '#00b894',
    '#d63384', '#198754', '#0dcaf0', '#ffc107',
];

function Home() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await bookService.getAll({ page: 0, size: 8 });
                setBooks(response.data?.content || []);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    return (
        <div className="page-content bg-white">
            {/* ===== SECTION 1: HERO BANNER ===== */}
            <section className="stt-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="hero-content">
                                <h1>Where Every <span>Shelf</span> Tells a <span>Story</span></h1>
                                <p>Discover, buy, read, and discuss books with a passionate community of readers. Your next great adventure starts here.</p>
                                <div className="hero-cta">
                                    <Link to="/books-grid-view-sidebar" className="btn-hero-primary">
                                        <i className="fa-solid fa-store"></i> Browse Books
                                    </Link>
                                    <Link to="/reader-network" className="btn-hero-secondary">
                                        <i className="fa-solid fa-users"></i> Join Community
                                    </Link>
                                </div>
                                <div className="hero-stats">
                                    <div className="hero-stat-item">
                                        <h3>10K+</h3>
                                        <p>Books Available</p>
                                    </div>
                                    <div className="hero-stat-item">
                                        <h3>5K+</h3>
                                        <p>Active Readers</p>
                                    </div>
                                    <div className="hero-stat-item">
                                        <h3>500+</h3>
                                        <p>Reading Rooms</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 d-none d-lg-block">
                            <div className="hero-visual">
                                <Swiper
                                    className="hero-book-slider"
                                    modules={[Autoplay, EffectFade, Pagination]}
                                    autoplay={{ delay: 10000, disableOnInteraction: false }}
                                    effect="fade"
                                    fadeEffect={{ crossFade: true }}
                                    loop={books.length > 1}
                                    pagination={{ clickable: true, el: '.hero-slider-pagination' }}
                                    speed={800}
                                >
                                    {books.length > 0 ? books.slice(0, 6).map((book, i) => (
                                        <SwiperSlide key={book.id || i}>
                                            <Link to={`/shop-detail/${book.id}`} className="hero-slide-inner">
                                                <div className="hero-slide-cover">
                                                    <img src={book.coverUrl || `https://via.placeholder.com/300x420/${bookColors[i % bookColors.length].replace('#','')}/ffffff?text=${encodeURIComponent(book.title?.substring(0,10) || 'Book')}`} alt={book.title} />
                                                </div>
                                                <div className="hero-slide-info">
                                                    <span className="hero-slide-badge">{book.categoryName || 'Featured'}</span>
                                                    <h3>{book.title}</h3>
                                                    <p className="hero-slide-author">by {book.author}</p>
                                                    <p className="hero-slide-desc">{book.description?.substring(0, 100) || 'A captivating read that will keep you turning pages late into the night.'}...</p>
                                                    <div className="hero-slide-price">${book.price || '19.99'}</div>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    )) : (
                                        <SwiperSlide>
                                            <div className="hero-slide-inner">
                                                <div className="hero-slide-cover" style={{background: 'linear-gradient(135deg, #EAA451, #e58c23)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                    <i className="fa-solid fa-book" style={{fontSize:'3rem', color:'rgba(255,255,255,0.3)'}}></i>
                                                </div>
                                                <div className="hero-slide-info">
                                                    <span className="hero-slide-badge">Loading</span>
                                                    <h3>Discovering Books...</h3>
                                                    <p className="hero-slide-author">Please wait</p>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )}
                                </Swiper>
                                <div className="hero-slider-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 2: HOW IT WORKS ===== */}
            <section className="stt-how-it-works">
                <div className="container">
                    <div className="stt-section-header">
                        <span className="section-badge">How It Works</span>
                        <h2>Shop. Read. Discuss.</h2>
                        <p>Shelf To Tales brings together the joy of buying books and the magic of discussing them with fellow readers.</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6">
                            <div className="stt-step-card">
                                <div className="step-icon shop">
                                    <i className="fa-solid fa-bag-shopping"></i>
                                </div>
                                <h5>Shop</h5>
                                <p>Browse thousands of books across every genre. Find your next read with curated recommendations and smart filters.</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="stt-step-card">
                                <div className="step-icon read">
                                    <i className="fa-solid fa-book-open-reader"></i>
                                </div>
                                <h5>Read</h5>
                                <p>Build your Virtual Bookshelf, track your reading progress, and organize your personal library in stunning 3D.</p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-12">
                            <div className="stt-step-card">
                                <div className="step-icon discuss">
                                    <i className="fa-solid fa-comments"></i>
                                </div>
                                <h5>Discuss</h5>
                                <p>Join live Reading Rooms, share reviews, and connect with readers who share your taste in literature.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 3: TRENDING BOOKS ===== */}
            <section className="stt-trending">
                <div className="container">
                    <div className="stt-section-header">
                        <span className="section-badge">E-Commerce</span>
                        <h2>Trending This Week</h2>
                        <p>The most popular books our community is reading and recommending right now.</p>
                    </div>
                    <div className="row g-4">
                        {books.slice(0, 4).map((book, i) => (
                            <div className="col-lg-3 col-md-6" key={book.id || i}>
                                <Link to={`/shop-detail/${book.id}`} style={{textDecoration:'none'}}>
                                    <div className="stt-book-card">
                                        <div className="book-cover">
                                            <img src={book.coverUrl || `https://via.placeholder.com/250x350/${bookColors[i].replace('#','')}/ffffff?text=${encodeURIComponent(book.title?.substring(0,10) || 'Book')}`} alt={book.title} />
                                            <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
                                                <i className="fa-regular fa-heart"></i>
                                            </button>
                                        </div>
                                        <div className="book-info">
                                            <div className="book-category">{book.categoryName || 'General'}</div>
                                            <h6>{book.title}</h6>
                                            <div className="book-author">by {book.author}</div>
                                            <div className="book-price">
                                                $ {book.price || '19.99'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                        {books.length === 0 && [1,2,3,4].map(i => (
                            <div className="col-lg-3 col-md-6" key={i}>
                                <div className="stt-book-card">
                                    <div className="book-cover" style={{background: `linear-gradient(135deg, ${bookColors[i]}, ${bookColors[i+4]})`}}>
                                    </div>
                                    <div className="book-info">
                                        <div className="book-category">Loading...</div>
                                        <h6>Fetching books...</h6>
                                        <div className="book-author">Please wait</div>
                                        <div className="book-price">$--</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-5">
                        <Link to="/books-grid-view-sidebar" className="stt-view-all">
                            View All Books <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 4: COMMUNITY HIGHLIGHTS ===== */}
            <section className="stt-community">
                <div className="container">
                    <div className="stt-section-header">
                        <span className="section-badge">Community</span>
                        <h2>Live Discussions Happening Now</h2>
                        <p>Jump into an active Reading Room and share your thoughts with fellow book lovers.</p>
                    </div>
                    <div className="row g-4">
                        {readingRooms.map((room) => (
                            <div className="col-lg-4 col-md-6" key={room.id}>
                                <div className="stt-room-card">
                                    <div className="room-header">
                                        <div className={`room-icon ${room.iconClass}`}>
                                            <i className={room.icon}></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-0">{room.title}</h6>
                                            <div className="room-meta"><span>● Live</span> · {room.participants} members</div>
                                        </div>
                                    </div>
                                    <p>{room.topic}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="room-participants">
                                            <div className="participant-avatars">
                                                {room.colors.map((color, j) => (
                                                    <div className="avatar" key={j} style={{background: color}}>
                                                        {String.fromCharCode(65 + j)}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="participant-count">+{room.participants - 4} more</span>
                                        </div>
                                        <Link to="/reading-room" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                            Join <i className="fa-solid fa-arrow-right ms-1"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-5">
                        <Link to="/reader-network" className="stt-view-all">
                            Explore All Rooms <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 5: FEATURED BOOKS (EXISTING SLIDER) ===== */}
            <section className="content-inner-1 bg-grey reccomend">
                <div className="container">
                    <div className="stt-section-header">
                        <span className="section-badge">Staff Picks</span>
                        <h2>Featured Books</h2>
                        <p>Hand-picked by our team for their outstanding stories and community buzz.</p>
                    </div>
                </div>
                <div className="container">
                    <FeaturedSlider />
                </div>
            </section>

            {/* ===== SECTION 6: VIRTUAL BOOKSHELF SHOWCASE ===== */}
            <section className="stt-bookshelf-showcase">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="showcase-content">
                                <h2>Your Personal <span>Virtual Bookshelf</span></h2>
                                <p>Organize, display, and share your book collection in a stunning 3D environment. Multiple themes, drag-and-drop sorting, and social sharing built right in.</p>
                                <ul className="showcase-features">
                                    <li><i className="fa-solid fa-check"></i> Three premium themes: Glass, Wood, Carbon</li>
                                    <li><i className="fa-solid fa-check"></i> Drag-and-drop book arrangement</li>
                                    <li><i className="fa-solid fa-check"></i> Share your shelf with the community</li>
                                    <li><i className="fa-solid fa-check"></i> Custom logo and branding support</li>
                                </ul>
                                <Link to="/virtual-bookshelf" className="btn-hero-primary" style={{display:'inline-flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
                                    <i className="fa-solid fa-book"></i> Build Your Shelf
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-6 mt-4 mt-lg-0">
                            <div className="showcase-preview">
                                {/* Mini 3D bookshelf visual */}
                                <div className="shelf-row">
                                    {bookColors.slice(0, 7).map((color, i) => (
                                        <div className="mini-book" key={i} style={{background: color, height: `${55 + Math.random() * 20}px`}}></div>
                                    ))}
                                </div>
                                <div className="shelf-plank"></div>
                                <div className="shelf-row">
                                    {bookColors.slice(7, 14).map((color, i) => (
                                        <div className="mini-book" key={i} style={{background: color, height: `${55 + Math.random() * 20}px`}}></div>
                                    ))}
                                </div>
                                <div className="shelf-plank"></div>
                                <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '15px', marginBottom: '0'}}>✨ Interactive 3D Preview — Click "Build Your Shelf" to explore</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 7: TESTIMONIALS ===== */}
            <section className="content-inner-2 testimonial-wrapper">
                <TestimonialSlider />
            </section>

            {/* ===== SECTION 8: LATEST BLOG ===== */}
            <section className="content-inner-2">
                <div className="container">
                    <div className="stt-section-header">
                        <span className="section-badge">From The Blog</span>
                        <h2>Latest News & Articles</h2>
                        <p>Book reviews, author interviews, and reading tips from our community.</p>
                    </div>
                    <LatestNewsSlider />
                    <div className="text-center mt-4">
                        <Link to="/blog-grid" className="stt-view-all">
                            Read More Articles <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SECTION 9: STATS COUNTER ===== */}
            <section className="content-inner">
                <div className="container">
                    <div className="row sp15">
                        <CounterSection />
                    </div>
                </div>
            </section>

            {/* ===== SECTION 10: NEWSLETTER ===== */}
            <section className="stt-newsletter">
                <div className="container">
                    <div className="newsletter-box">
                        <h2>Stay in the Loop</h2>
                        <p>Get weekly book recommendations, community updates, and exclusive deals delivered to your inbox.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your email address" />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
