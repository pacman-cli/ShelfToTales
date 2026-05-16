import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, wishlistService, cartService } from '../../api/api';
import Swal from 'sweetalert2';
import ClientsSlider from '../../components/features/Home/ClientsSlider';
import NewsLetter from '../../components/features/NewsLetter';
import CounterSection from '../../components/common/CounterSection';
import ShopSidebar from '../../components/common/ShopSidebar';

const bookColors = [
    '#EAA451', '#1a1668', '#029e76', '#ff6b6b', '#00aeff',
    '#e58c23', '#3a32b8', '#ff1e6f', '#6c5ce7', '#00b894',
];

function BooksGridViewSidebar() {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const size = 12;

    useEffect(() => {
        const fetchBooks = async () => {
        try {
            const res = await bookService.getAll({ page, size, q: search || undefined });
            setBooks(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (err) {
            console.error('Error fetching books:', err);
        }
        };
        fetchBooks();
    }, [page, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
    };

    const handleAddToWishlist = async (bookId) => {
        try {
            await wishlistService.addToWishlist(bookId);
            Swal.fire({ icon: 'success', title: 'Added to wishlist', showConfirmButton: false, timer: 1500, toast: true, position: 'top-end' });
        } catch (error) {
            Swal.fire('Error', 'Please login to add to wishlist', 'error');
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await cartService.addToCart(bookId, 1);
            Swal.fire({ icon: 'success', title: 'Added to cart', showConfirmButton: false, timer: 1500, toast: true, position: 'top-end' });
        } catch (error) {
            Swal.fire('Error', 'Please login to add to cart', 'error');
        }
    };

    return (
        <div className="page-content bg-grey">
            <div className="content-inner-1 border-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3">
                            <ShopSidebar />
                        </div>

                        <div className="col-xl-9">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="title">Books</h4>
                                <form onSubmit={handleSearch} className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search books..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ maxWidth: 200 }}
                                    />
                                    <button type="submit" className="btn btn-primary btn-sm">Search</button>
                                </form>
                            </div>

                            <div className="row book-grid-row">
                                {books.length > 0 ? books.map((book) => (
                                    <div className="col-book style-2" key={book.id}>
                                        <div className="dz-shop-card style-1">
                                            <div className="dz-media">
                                                <img
                                                    src={book.coverUrl || `https://via.placeholder.com/250x350/${bookColors[book.id % bookColors.length].replace('#', '')}/ffffff?text=${encodeURIComponent(book.title?.substring(0, 10) || 'Book')}`}
                                                    alt={book.title}
                                                />
                                            </div>
                                            <div className="bookmark-btn style-2">
                                                <input className="form-check-input" type="checkbox" id={`wish-${book.id}`}
                                                    onChange={() => handleAddToWishlist(book.id)} />
                                                <label className="form-check-label" htmlFor={`wish-${book.id}`}>
                                                    <i className="flaticon-heart"></i>
                                                </label>
                                            </div>
                                            <div className="dz-content">
                                                <h5 className="title">
                                                    <Link to={`/shop-detail/${book.id}`}>{book.title}</Link>
                                                </h5>
                                                <ul className="dz-tags">
                                                    <li><Link to={`/books-grid-view-sidebar?category=${book.categoryId}`}>{book.categoryName || 'General'}</Link></li>
                                                </ul>
                                                <div className="book-author" style={{ fontSize: '0.85rem', color: '#888' }}>by {book.author}</div>
                                                <ul className="dz-rating">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <li key={i}><i className="flaticon-star text-yellow"></i></li>
                                                    ))}
                                                </ul>
                                                <div className="book-footer">
                                                    <div className="price">
                                                        <span className="price-num">${book.price || '9.99'}</span>
                                                    </div>
                                                    <button onClick={() => handleAddToCart(book.id)} className="btn btn-secondary box-btn btnhover btnhover2">
                                                        <i className="flaticon-shopping-cart-1 m-r10"></i> Add to cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-12 text-center py-5">
                                        <p>No books found. Try a different search.</p>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="row page mt-0">
                                    <div className="col-md-6">
                                        <p className="page-text">Showing {Math.min(size, totalElements - page * size)} from {totalElements} data</p>
                                    </div>
                                    <div className="col-md-6">
                                        <nav aria-label="Blog Pagination">
                                            <ul className="pagination style-1 p-t20">
                                                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                                    <button className="page-link prev" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
                                                </li>
                                                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                                    <li className={`page-item ${page === i ? 'active' : ''}`} key={i}>
                                                        <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link next" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white py-5">
                <div className="container">
                    <ClientsSlider />
                </div>
            </div>
            <section className="content-inner">
                <div className="container">
                    <div className="row sp15">
                        <CounterSection />
                    </div>
                </div>
            </section>
            <NewsLetter />
        </div>
    );
}

export default BooksGridViewSidebar;
