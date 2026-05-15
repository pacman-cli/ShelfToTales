import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nav, Tab } from 'react-bootstrap';
import { bookService, wishlistService } from '../../api/api';
import Swal from 'sweetalert2';

// Components
import ClientsSlider from '../../components/features/Home/ClientsSlider';
import CounterSection from '../../components/common/CounterSection';
import NewsLetter from '../../components/features/NewsLetter';

// Images
import profile2 from '../../assets/images/profile2.jpg';
import profile4 from '../../assets/images/profile4.jpg';
import book16 from '../../assets/images/books/grid/book16.jpg';
import book8 from '../../assets/images/books/grid/book8.jpg';
import book14 from '../../assets/images/books/grid/book14.jpg';
import book15 from '../../assets/images/books/grid/book15.jpg';
import book4 from '../../assets/images/books/grid/book4.jpg';
import book9 from '../../assets/images/books/grid/book9.jpg';
import book2 from '../../assets/images/books/grid/book2.jpg';
import book7 from '../../assets/images/books/grid/book7.jpg';
import book13 from '../../assets/images/books/grid/book13.jpg';
import book10 from '../../assets/images/books/grid/book10.jpg';
import book11 from '../../assets/images/books/grid/book11.jpg';
import book12 from '../../assets/images/books/grid/book12.jpg';

const MOCK_BOOKS = [
    {id: 1, imageUrl:book16, title:'Thunder Stunt', author: 'Kevin Smiley', category: {name: 'ADVENTURE'}, price: 54.78, discountPrice: 70.00, description: 'A thrilling adventure through the stormy mountains.' },
    {id: 2, imageUrl:book14, title:'A Heavy Lift', author: 'John Doe', category: {name: 'RACING'}, price: 25.18, discountPrice: 68.00, description: 'The story of a legendary racer overcoming all odds.' },
    {id: 3, imageUrl:book15, title:'Terrible Madness', author: 'Sarah Jenkins', category: {name: 'SPORTS'}, price: 25.30, discountPrice: 38.00, description: 'Inside the mind of the worlds greatest athletes.' },
    {id: 4, imageUrl:book4, title:'Such Fun Age', author: 'Kiley Reid', category: {name: 'ADVENTURE'}, price: 20.15, discountPrice: 33.00, description: 'A striking and surprising debut novel about race and privilege.' },
    {id: 5, imageUrl:book9, title:'Pushing Clouds', author: 'Amanda Sky', category: {name: 'ADVENTURE'}, price: 30.12, discountPrice: 40.00, description: 'A poetic journey through the clouds and beyond.' },
    {id: 6, imageUrl:book2, title:'Homie', author: 'Danez Smith', category: {name: 'HORROR'}, price: 15.25, discountPrice: 45.00, description: 'A magnificent anthem about the care and feeding of friendship.' },
    {id: 7, imageUrl:book7, title:'SECONDS', author: 'Bryan Lee OMalley', category: {name: 'SPORTS'}, price: 21.78, discountPrice: 36.00, description: 'A young chef gets a second chance at fixing her mistakes.' },
    {id: 8, imageUrl:book13, title:'REWORK', author: 'Jason Fried', category: {name: 'THRILLER'}, price: 23.20, discountPrice: 49.00, description: 'A better, faster, easier way to succeed in business.' },
    {id: 9, imageUrl:book11, title:'ALL GOOD NEWS', author: 'Happy Ray', category: {name: 'DRAMA'}, price: 40.78, discountPrice: 68.00, description: 'A collection of the most inspiring stories of the decade.' },
    {id: 10, imageUrl:book10, title:'Emily The Back', author: 'Tim Burton', category: {name: 'DRAMA'}, price: 54.78, discountPrice: 63.00, description: 'The gothic tale of a girl who lives in the shadows.' },
    {id: 11, imageUrl:book8, title:'The Adventure', author: 'Mark Twain', category: {name: 'BIOGRAPHY'}, price: 37.00, discountPrice: 47.00, description: 'The classic tale of Huckleberry Finn on the Mississippi.' },
    {id: 12, imageUrl:book12, title:'The Missadventure of David', author: 'Charles Dickens', category: {name: 'DRAMA'}, price: 23.00, discountPrice: 52.00, description: 'The life and times of David Copperfield.' },
];

function StarRating({ rating = 4, max = 5 }) {
    return (
        <ul className="dz-rating">
            {[...Array(max)].map((_, i) => (
                <li key={i}>
                    <i className={`flaticon-star ${i < rating ? 'text-yellow' : 'text-muted'}`}></i>
                </li>
            ))}
        </ul>
    );
}

function CommentBlog({ title, comment, date, rating }) {
    return (
        <div className="comment-body" id="div-comment-3">
            <div className="comment-author vcard">
                <img src={profile2} alt="" className="avatar" />
                <cite className="fn">{title}</cite> <span className="says">says:</span>
                <div className="comment-meta">
                    <Link to={"#"}>{new Date(date).toLocaleDateString()}</Link>
                </div>
            </div>
            <div className="comment-content dlab-page-text">
                <p>{comment}</p>
                <div className="dz-rating">
                    {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa fa-star ${i < rating ? 'text-yellow' : 'text-muted'}`}></i>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RelatedBookCard({ book }) {
    return (
        <div className="col-book style-2">
            <div className="dz-shop-card style-1">
                <div className="dz-media">
                    <Link to={`/books-detail/${book.id}`}>
                        <img src={book.coverUrl || book.imageUrl} alt={book.title} />
                    </Link>
                </div>
                <div className="dz-content">
                    <h5 className="title">
                        <Link to={`/books-detail/${book.id}`}>{book.title}</Link>
                    </h5>
                    <ul className="dz-tags">
                        <li>{book.category?.name || 'General'}</li>
                    </ul>
                    <ul className="dz-rating">
                        <li><i className="flaticon-star text-yellow"></i></li>
                        <li><i className="flaticon-star text-yellow"></i></li>
                        <li><i className="flaticon-star text-yellow"></i></li>
                        <li><i className="flaticon-star text-yellow"></i></li>
                        <li><i className="flaticon-star text-muted"></i></li>
                    </ul>
                    <div className="book-footer">
                        <div className="price">
                            <span className="price-num">${book.discountPrice || book.price}</span>
                            {book.discountPrice && <del>${book.price}</del>}
                        </div>
                        <Link to={`/books-detail/${book.id}`} className="btn btn-secondary box-btn btnhover btnhover2">
                            <i className="flaticon-shopping-cart-1 m-r10"></i> Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [count, setCount] = useState(1);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(true);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Try fetching from real API
                const bookRes = await bookService.getById(id);
                if (bookRes.data) {
                    setBook(bookRes.data);
                } else {
                    // Fallback to mock if API returns empty
                    const mock = MOCK_BOOKS.find(b => String(b.id) === String(id));
                    setBook(mock || null);
                }
                
                const allBooksRes = await bookService.getAll();
                const others = (allBooksRes.data && allBooksRes.data.length > 0) 
                    ? allBooksRes.data.filter(b => String(b.id) !== String(id)).slice(0, 3)
                    : MOCK_BOOKS.filter(b => String(b.id) !== String(id)).slice(0, 3);
                
                setRelatedBooks(others);
            } catch (error) {
                console.error('Error fetching book data, using mock fallback:', error);
                // Final fallback if API fails completely (e.g. backend down)
                const mock = MOCK_BOOKS.find(b => String(b.id) === String(id));
                setBook(mock || null);
                setRelatedBooks(MOCK_BOOKS.filter(b => String(b.id) !== String(id)).slice(0, 3));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToWishlist = async () => {
        try {
            await wishlistService.addToWishlist(id);
            Swal.fire({
                icon: 'success',
                title: 'Added to Wishlist!',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end',
            });
        } catch (error) {
            Swal.fire('Error', 'Please login to add to wishlist', 'error');
        }
    };

    const handleAddToCart = () => {
        Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: `${count} copy(s) of "${book?.title}"`,
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-end',
        });
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        Swal.fire('Info', 'Reviews are currently disabled', 'info');
    };

    if (loading) {
        return (
            <div className="page-content bg-grey">
                <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="page-content bg-grey">
                <div className="container text-center py-5">
                    <h4>Book not found.</h4>
                    <Link to="/books-grid-view" className="btn btn-primary mt-3">Back to Books</Link>
                </div>
            </div>
        );
    }

    const tableDetail = [
        { tablehead: 'Book Title', tabledata: book.title },
        { tablehead: 'Author', tabledata: book.author },
        { tablehead: 'Publisher', tabledata: book.publisher || 'Printarea Studios' },
        { tablehead: 'Year', tabledata: book.year || '2024' },
        { tablehead: 'Category', tabledata: book.category?.name || 'General' },
        { tablehead: 'In Stock', tabledata: book.stock > 0 ? `${book.stock} Available` : 'Out of Stock' },
    ];

    const tags = book.tags || ['Drama', 'Adventure', 'Biography', 'Bestseller'];

    return (
        <>
            <div className="page-content bg-grey">

                <section className="content-inner-1">
                    <div className="container">
                        <div className="row book-grid-row style-4 m-b60">
                            <div className="col">
                                <div className="dz-box">
                                    <div className="dz-media" style={{ 
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '15px',
                                        boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                                    }}>
                                        <img
                                            src={book.coverUrl || book.imageUrl}
                                            alt={book.title}
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />
                                    </div>
                                    <div className="dz-content">
                                        <div className="dz-header">
                                            <h3 className="title">{book.title}</h3>
                                            <div className="shop-item-rating">
                                                <div className="d-lg-flex d-sm-inline-flex d-flex align-items-center">
                                                    <StarRating rating={4} />
                                                    <h6 className="m-b0 ms-2">4.0</h6>
                                                    <span className="ms-2 text-muted" style={{ fontSize: '13px' }}>
                                                        ({reviews.length} Reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dz-body">
                                            <div className="book-detail">
                                                <ul className="book-info">
                                                    <li>
                                                        <div className="writer-info">
                                                            <img src={profile2} alt="author" />
                                                            <div>
                                                                <span>Written by</span>
                                                                <strong>{book.author}</strong>
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p className="text-1">{book.description}</p>
                                            <div className="book-footer">
                                                <div className="price">
                                                    <h5>${book.discountPrice || book.price}</h5>
                                                    {book.discountPrice && (
                                                        <p className="p-lr10">
                                                            <del>${book.price}</del>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="product-num mt-3 d-flex flex-wrap gap-3">
                                                    <div className="quantity btn-quantity style-1">
                                                        <button
                                                            className="btn btn-minus"
                                                            type="button"
                                                            onClick={() => setCount(Math.max(1, count - 1))}
                                                            style={{ border: '1px solid #eee' }}
                                                        >
                                                            <i className="ti-minus"></i>
                                                        </button>
                                                        <input
                                                            className="quantity-input"
                                                            type="text"
                                                            value={count}
                                                            readOnly
                                                            style={{ width: '50px', textAlign: 'center', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}
                                                        />
                                                        <button
                                                            className="btn btn-plus"
                                                            type="button"
                                                            onClick={() => setCount(count + 1)}
                                                            style={{ border: '1px solid #eee' }}
                                                        >
                                                            <i className="ti-plus"></i>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        className="btn btn-primary btnhover px-4"
                                                        style={{ borderRadius: '30px' }}
                                                    >
                                                        <i className="flaticon-shopping-cart-1 m-r10"></i>
                                                        <span>Add to Cart</span>
                                                    </button>
                                                    <button
                                                        onClick={handleAddToWishlist}
                                                        className="btn btn-outline-primary btnhover px-4"
                                                        style={{ borderRadius: '30px' }}
                                                    >
                                                        <i className="flaticon-heart m-r10"></i>
                                                        <span>Wishlist</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {tags.length > 0 && (
                                                <div className="mt-4">
                                                    <strong className="me-2">Tags:</strong>
                                                    {tags.map((tag, i) => (
                                                        <Link
                                                            key={i}
                                                            to={"#"}
                                                            className="badge bg-light text-dark me-1 px-3 py-2"
                                                            style={{
                                                                borderRadius: '20px',
                                                                border: '1px solid #dee2e6',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                textDecoration: 'none',
                                                            }}
                                                        >
                                                            {tag}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xl-8">
                                <Tab.Container defaultActiveKey="details">
                                    <div className="product-description tabs-site-button">
                                        <Nav as="ul" className="nav nav-tabs">
                                            <Nav.Item as="li">
                                                <Nav.Link eventKey="details">Details Product</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item as="li">
                                                <Nav.Link eventKey="review">Customer Reviews</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="details">
                                                <table className="table border book-overview">
                                                    <tbody>
                                                        {tableDetail.map((data, index) => (
                                                            <tr key={index}>
                                                                <th style={{ width: '35%' }}>{data.tablehead}</th>
                                                                <td>{data.tabledata}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="review">
                                                <div className="clear" id="comment-list">
                                                    <div className="post-comments comments-area style-1 clearfix">
                                                        <h4 className="comments-title">
                                                            {reviews.length} COMMENTS
                                                        </h4>
                                                        <div id="comment">
                                                            <ol className="comment-list">
                                                                {reviews.map((rev, index) => (
                                                                    <li key={index} className="comment even thread-even depth-1">
                                                                        <CommentBlog
                                                                            title={rev.user?.username || 'Anonymous'}
                                                                            comment={rev.comment}
                                                                            date={rev.createdAt}
                                                                            rating={rev.rating}
                                                                        />
                                                                    </li>
                                                                ))}
                                                                {reviews.length === 0 && (
                                                                    <li className="text-muted py-3">
                                                                        No reviews yet. Be the first to review!
                                                                    </li>
                                                                )}
                                                            </ol>
                                                        </div>
                                                        <div className="default-form comment-respond style-1" id="respond">
                                                            <h4 className="comment-reply-title">LEAVE A REPLY</h4>
                                                            <div className="clearfix">
                                                                <form onSubmit={handleReviewSubmit} className="comment-form">
                                                                    <p className="comment-form-comment">
                                                                        <div className="mb-2 d-flex align-items-center gap-1">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <i
                                                                                    key={star}
                                                                                    className={`fa fa-star fs-5 ${star <= (hoverRating || rating) ? 'text-warning' : 'text-muted'}`}
                                                                                    style={{ cursor: 'pointer' }}
                                                                                    onClick={() => setRating(star)}
                                                                                    onMouseEnter={() => setHoverRating(star)}
                                                                                    onMouseLeave={() => setHoverRating(0)}
                                                                                ></i>
                                                                            ))}
                                                                        </div>
                                                                        <textarea
                                                                            placeholder="Type Comment Here"
                                                                            className="form-control"
                                                                            rows="4"
                                                                            value={comment}
                                                                            onChange={(e) => setComment(e.target.value)}
                                                                            required
                                                                        ></textarea>
                                                                    </p>
                                                                    <p className="col-md-12 col-sm-12 col-xs-12 form-submit">
                                                                        <button
                                                                            type="submit"
                                                                            className="submit btn btn-primary filled"
                                                                        >
                                                                            Submit Now <i className="fa fa-angle-right m-l10"></i>
                                                                        </button>
                                                                    </p>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </div>
                                </Tab.Container>
                            </div>
                        </div>
                    </div>
                </section>

                {relatedBooks.length > 0 && (
                    <section className="content-inner-1 bg-white">
                        <div className="container">
                            <div className="section-head book-align">
                                <h2 className="title mb-0">Related Books</h2>
                                <Link to="/books-grid-view" className="btn btn-primary btnhover">
                                    View All <i className="fa fa-angle-right ms-1"></i>
                                </Link>
                            </div>
                            <div className="row book-grid-row">
                                {relatedBooks.map((rb, i) => (
                                    <RelatedBookCard key={i} book={rb} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

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

                <NewsLetter />
            </div>
        </>
    );
}

export default BookDetail;
