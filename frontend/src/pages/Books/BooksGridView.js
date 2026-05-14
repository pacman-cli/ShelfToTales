import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Dropdown } from 'react-bootstrap';
import { bookService, wishlistService } from '../../api/api';
import Swal from 'sweetalert2';

//Component
import ClientsSlider from '../../components/features/Home/ClientsSlider';
import CounterSection from '../../components/common/CounterSection';
import NewsLetter from '../../components/features/NewsLetter';
import QuickView from '../../components/features/Shop/QuickView';

function BooksGridView() {
    const [books, setBooks] = useState([]);
    const [accordBtn, setAccordBtn] = useState();
    const [selectBtn, setSelectBtn] = useState('Newest');
    const [showQuickView, setShowQuickView] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await bookService.getAll();
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    const handleAddToWishlist = async (bookId) => {
        try {
            await wishlistService.addToWishlist(bookId);
            Swal.fire('Success', 'Added to wishlist', 'success');
        } catch (error) {
            Swal.fire('Error', 'Please login to add to wishlist', 'error');
        }
    };

    return (
        <>
            <div className="page-content bg-grey">
                <section className="content-inner-1 border-bottom">
                    <div className="container">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="title">Books Grid</h4>
                        </div>
                        <div className="filter-area m-b30">
                            <div className="grid-area">
                                <div className="shop-tab">
                                    <ul className="nav text-center product-filter justify-content-end" role="tablist">
                                        <li className="nav-item">
                                            <Link to={"/shop-list"} className="nav-link" >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 5H21C21.2652 5 21.5196 4.89464 21.7071 4.7071C21.8946 4.51957 22 4.26521 22 4C22 3.73478 21.8946 3.48043 21.7071 3.29289C21.5196 3.10536 21.2652 3 21 3H3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4C2 4.26521 2.10536 4.51957 2.29289 4.7071C2.48043 4.89464 2.73478 5 3 5Z" fill="#AAAAAA"></path>
                                                    <path d="M3 13H21C21.2652 13 21.5196 12.8947 21.7071 12.7071C21.8946 12.5196 22 12.2652 22 12C22 11.7348 21.8946 11.4804 21.7071 11.2929C21.5196 11.1054 21.2652 11 21 11H3C2.73478 11 2.48043 11.1054 2.29289 11.2929C2.10536 11.4804 2 11.7348 2 12C2 12.2652 2.10536 12.5196 2.29289 12.7071C2.48043 12.8947 2.73478 13 3 13Z" fill="#AAAAAA"></path>
                                                    <path d="M3 21H21C21.2652 21 21.5196 20.8947 21.7071 20.7071C21.8946 20.5196 22 20.2652 22 20C22 19.7348 21.8946 19.4804 21.7071 19.2929C21.5196 19.1054 21.2652 19 21 19H3C2.73478 19 2.48043 19.1054 2.29289 19.2929C2.10536 19.4804 2 19.7348 2 20C2 20.2652 2.10536 20.5196 2.29289 20.7071C2.48043 20.8947 2.73478 21 3 21Z" fill="#AAAAAA"></path>
                                                </svg>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="row book-grid-row">
                            {books.map((data, i) => (
                                <div className="col-book style-1" key={i}>
                                    <div className="dz-shop-card style-1">
                                        <div className="dz-media">
                                            <img src={data.imageUrl} alt="book" style={{ height: '250px', objectFit: 'cover' }} />
                                            <div className="shop-card-btn" style={{position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)'}}>
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => { setSelectedBook(data); setShowQuickView(true); }}
                                                >
                                                    <i className="fa-solid fa-eye me-1"></i> Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div className="dz-content">
                                            <h5 className="title"><Link to={`/shop-detail/${data.id}`}>{data.title}</Link></h5>
                                            <ul className="dz-tags">
                                                <li>{data.category}</li>
                                            </ul>
                                            <div className="book-footer">
                                                <div className="price">
                                                    <span className="price-num">${data.discountPrice || data.price}</span>
                                                    {data.discountPrice && <del>${data.price}</del>}
                                                </div>
                                                <button onClick={() => handleAddToWishlist(data.id)} className="btn btn-secondary box-btn btnhover btnhover2">
                                                    <i className="flaticon-heart m-r10"></i> Add to wishlist
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <NewsLetter />
                <QuickView 
                    show={showQuickView} 
                    onHide={() => setShowQuickView(false)} 
                    book={selectedBook} 
                />
            </div>
        </>
    );
}

export default BooksGridView;

