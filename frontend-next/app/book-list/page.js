'use client';

// Force fully-dynamic rendering — page reads localStorage/window at render time.
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookService, wishlistService, cartService } from '../lib/api';
import Swal from 'sweetalert2';
import { Dropdown } from 'react-bootstrap';

// Components
import ClientsSlider from '../components/features/Home/ClientsSlider';
import CounterSection from '../components/common/CounterSection';
import NewsLetter from '../components/features/NewsLetter';
import PageTitle from '../components/layout/PageTitle';
import { FadeIn } from '../components/common/AnimationUtils';

function BookListPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectBtn, setSelectBtn] = useState('Newest');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    const sortMap = {
        'Newest': { sortBy: 'id', sortDir: 'desc' },
        'Oldest': { sortBy: 'id', sortDir: 'asc' },
        'Price Low': { sortBy: 'price', sortDir: 'asc' },
        'Price High': { sortBy: 'price', sortDir: 'desc' },
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await bookService.getAll({ page: currentPage, size: 20, sortBy, sortDir });
                setBooks(response.data.content || response.data || []);
                setTotalPages(response.data.totalPages || 1);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching books:', error);
                setLoading(false);
            }
        };
        fetchBooks();
    }, [currentPage, sortBy, sortDir]);

    const handleSortChange = (label) => {
        setSelectBtn(label);
        const s = sortMap[label];
        if (s) {
            setSortBy(s.sortBy);
            setSortDir(s.sortDir);
        }
        setCurrentPage(0);
    };

    const handleAddToWishlist = async (bookId) => {
        try {
            await wishlistService.addToWishlist(bookId);
            Swal.fire({
                icon: 'success',
                title: 'Added to wishlist',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add to wishlist', 'error');
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await cartService.addToCart(bookId, 1);
            Swal.fire({ icon: 'success', title: 'Added to cart', showConfirmButton: false, timer: 1500, toast: true, position: 'top-end' });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content bg-grey">
            <PageTitle parentPage="Pages" childPage="Book List" />
                <FadeIn>
            
            <section className="content-inner-1 border-bottom">
                <div className="container">
                    {/* Title */}
                    <div className="d-flex justify-content-between align-items-center m-b20">
                        <h4 className="title mb-0 fw-bold" style={{ color: '#1A162E' }}>Books</h4>
                    </div>

                    {/* Toolbar */}
                    <div className="filter-area m-b30 p-3 bg-white rounded-3 border d-flex justify-content-between align-items-center shadow-sm">
                        <div className="d-flex align-items-center gap-4 ps-2">
                            <Link href="/book-list" className="text-decoration-none" style={{ color: '#1A162E' }} aria-label="List View">
                                <i className="fa-solid fa-bars fa-lg"></i>
                            </Link>
                            <Link href="/book-list" className="text-decoration-none" style={{ color: '#1A162E' }} aria-label="Grid View">
                                <i className="fa-solid fa-table-cells fa-lg"></i>
                            </Link>
                            <Link href="/book-list" className="text-decoration-none" style={{ color: '#1A162E' }} aria-label="Detailed Grid View">
                                <i className="fa-solid fa-table-list fa-lg"></i>
                            </Link>
                        </div>
                        <div className="d-flex align-items-center gap-4 pe-2">
                            <div className="dropdown">
                                <button className="btn btn-link fw-bold text-decoration-none d-flex align-items-center gap-2 p-0" type="button" style={{ color: '#1A162E' }} aria-label="Toggle categories list">
                                    <i className="fa-solid fa-list-ul"></i> Categories
                                </button>
                            </div>
                            <Dropdown className="dropdown">
                                <Dropdown.Toggle className="btn btn-link fw-bold text-decoration-none d-flex align-items-center gap-2 p-0 border-0 bg-transparent i-false" style={{ color: '#1A162E', boxShadow: 'none' }} aria-label={`Sort books by: ${selectBtn}`}>
                                    <i className="fa-solid fa-arrow-down-wide-short"></i> {selectBtn} <i className="fa-solid fa-caret-down small ms-1"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleSortChange('Newest')}>Newest</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleSortChange('Oldest')}>Oldest</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleSortChange('Price Low')}>Price Low</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleSortChange('Price High')}>Price High</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="row book-grid-row">
                        {books.map((book, index) => (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 m-b30" key={index}>
                                <div className="dz-shop-card style-1 bg-white p-3 rounded shadow-sm h-100 d-flex flex-column">
                                    <div className="dz-media position-relative mb-3 overflow-hidden rounded">
                                        <img loading="lazy" decoding="async" src={book.coverUrl} alt={`Cover of ${book.title}`} style={{ height: '300px', width: '100%', objectFit: 'cover' }} />
                                        <div className="bookmark-btn position-absolute top-0 end-0 m-3">
                                            <button onClick={() => handleAddToWishlist(book.id)} className="btn btn-white btn-sm rounded-circle shadow-sm" style={{ width: '35px', height: '35px', padding: '0' }} aria-label={`Add ${book.title} to wishlist`}>
                                                <i className="fa-regular fa-heart text-muted"></i>
                                            </button>
                                        </div>
                                        <div className="shop-card-btn position-absolute bottom-0 start-0 w-100 p-2 opacity-0 transition-3s">
                                            <button onClick={() => handleAddToWishlist(book.id)} className="btn btn-primary w-100 btn-sm mb-1" aria-label={`Add ${book.title} to wishlist`}>
                                                <i className="fa-solid fa-heart me-2"></i> Add To Wishlist
                                            </button>
                                            <button onClick={() => handleAddToCart(book.id)} className="btn btn-secondary w-100 btn-sm" aria-label={`Add ${book.title} to cart`}>
                                                <i className="fa-solid fa-cart-shopping me-2"></i> Add To Cart
                                            </button>
                                        </div>
                                    </div>
                                    <div className="dz-content text-center flex-grow-1">
                                        <h5 className="title mb-2">
                                            <Link href={`/books-detail/${book.id}`} className="text-dark fw-bold" aria-label={`View details of ${book.title}`}>{book.title}</Link>
                                        </h5>
                                        <div className="text-uppercase small fw-bold mb-2" style={{ color: '#E9AD28' }}>
                                            {book.category?.name || 'ADVENTURE'}
                                        </div>
                                        <div className="dz-rating mb-2">
                                            <ul className="d-flex justify-content-center list-unstyled mb-0 text-yellow">
                                                <li><i className="fa-solid fa-star"></i></li>
                                                <li><i className="fa-solid fa-star"></i></li>
                                                <li><i className="fa-solid fa-star"></i></li>
                                                <li><i className="fa-solid fa-star"></i></li>
                                                <li><i className="fa-solid fa-star"></i></li>
                                            </ul>
                                        </div>
                                        <div className="price mb-0">
                                            <span className="h5 fw-bold" style={{ color: '#E9AD28' }}>${book.discountPrice || book.price}</span>
                                            {book.discountPrice && <del className="ms-2 text-muted small">${book.price}</del>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Section */}
                    {totalPages > 1 && (
                        <div className="row align-items-center mt-5">
                            <div className="col-12">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center mb-0 gap-2 border-0">
                                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                            <button className="page-link border-0 bg-light rounded text-dark px-3 py-2" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} aria-label="Previous page">Prev</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                                <button className={`page-link border-0 rounded px-3 py-2 ${currentPage === i ? 'text-white' : 'bg-light text-dark'}`} style={currentPage === i ? { backgroundColor: '#1A162E' } : {}} onClick={() => setCurrentPage(i)} aria-label={`Page ${i + 1}`} aria-current={currentPage === i ? "page" : undefined}>{i + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                                            <button className="page-link border-0 bg-light rounded text-dark px-3 py-2" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} aria-label="Next page">Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="bg-white py-5">
                <div className="container">
                    <ClientsSlider />
                </div>
            </div>

            <section className="content-inner bg-grey">
                <div className="container">
                    <div className="row sp15">
                        <CounterSection />
                    </div>
                </div>
            </section>
                </FadeIn>

            <NewsLetter />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .text-yellow {
                    color: #FFC107;
                }
                .dz-shop-card.style-1 .dz-media:hover .shop-card-btn {
                    opacity: 1 !important;
                }
                .transition-3s {
                    transition: all 0.3s ease;
                }
                .pagination .page-link:hover {
                    background-color: #1A162E !important;
                    color: white !important;
                }
            ` }} />
        </div>
    );
}

export default BookListPage;

