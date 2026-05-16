import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nav, Tab } from 'react-bootstrap';
import { bookService, wishlistService, cartService } from '../../api/api';
import Swal from 'sweetalert2';

//Component
import NewsLetter from '../../components/features/NewsLetter';

//Images
import profile2 from '../../assets/images/profile2.jpg';

function CommentBlog({title, comment, date, rating}){
    return(
        <>
            <div className="comment-body" id="div-comment-3">
                <div className="comment-author vcard">
                    <img src={profile2} alt="" className="avatar"/>
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
        </>
    )
}

function ShopDetail(){
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [count, setCount] = useState(1);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookRes = await bookService.getById(id);
                setBook(bookRes.data);
                // Reviews are currently not supported by the backend, using empty array
                setReviews([]);
            } catch (error) {
                console.error('Error fetching book data:', error);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToWishlist = async () => {
        try {
            await wishlistService.addToWishlist(id);
            Swal.fire({ icon: 'success', title: 'Added to wishlist', showConfirmButton: false, timer: 1500, toast: true, position: 'top-end' });
        } catch (error) {
            Swal.fire('Error', 'Please login to add to wishlist', 'error');
        }
    };

    const handleAddToCart = async () => {
        try {
            await cartService.addToCart(id, count);
            Swal.fire({ icon: 'success', title: 'Added to cart', showConfirmButton: false, timer: 1500, toast: true, position: 'top-end' });
        } catch (error) {
            Swal.fire('Error', 'Please login to add to cart', 'error');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        Swal.fire('Info', 'Reviews are currently disabled', 'info');
    };

    if (!book) return <div>Loading...</div>;

    const tableDetail = [
        {tablehead:'Book Title', tabledata: book.title},
        {tablehead:'Author', tabledata: book.author},
        {tablehead:'Category', tabledata: book.category?.name},
        {tablehead:'Stock', tabledata: book.stock},
    ];

    return(
        <>
            <div className="page-content bg-grey">
                <section className="content-inner-1">
                    <div className="container">
                        <div className="row book-grid-row style-4 m-b60">
                            <div className="col">
                                <div className="dz-box">
                                    <div className="dz-media">
                                        <img src={book.coverUrl} alt="book" style={{maxWidth: '300px'}} />
                                    </div>
                                    <div className="dz-content">
                                        <div className="dz-header">
                                            <h3 className="title">{book.title}</h3>
                                            <div className="shop-item-rating">
                                                <div className="d-lg-flex d-sm-inline-flex d-flex align-items-center">
                                                    <ul className="dz-rating">
                                                        <li><i className="flaticon-star text-yellow"></i></li>	
                                                        <li><i className="flaticon-star text-yellow"></i></li>	
                                                        <li><i className="flaticon-star text-yellow"></i></li>	
                                                        <li><i className="flaticon-star text-yellow"></i></li>		
                                                        <li><i className="flaticon-star text-muted"></i></li>		
                                                    </ul>
                                                    <h6 className="m-b0">4.0</h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dz-body">
                                            <div className="book-detail">
                                                <ul className="book-info">
                                                    <li>
                                                        <div className="writer-info">
                                                            <img src={profile2} alt="book" />
                                                            <div>
                                                                <span>Writen by</span>{book.author}
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p className="text-1">{book.description}</p>
                                            <div className="book-footer">
                                                <div className="price">
                                                    <h5>${book.discountPrice || book.price}</h5>
                                                    {book.discountPrice && <p className="p-lr10">${book.price}</p>}
                                                </div>
                                                <div className="product-num">
                                                    <div className="quantity btn-quantity style-1 me-3">
                                                            <button className="btn btn-plus" type="button"                                                                 
                                                                onClick={() => setCount(count + 1)}
                                                            >
                                                                <i className="ti-plus"></i>
                                                            </button>
                                                            <input className="quantity-input" type="text" value={count} name="demo_vertical2" readOnly />
                                                            <button className="btn btn-minus " type="button"                                                             
                                                                onClick={() => setCount(Math.max(1, count - 1))}
                                                            >
                                                                <i className="ti-minus"></i>
                                                            </button> 
                                                        </div>
                                                                                    <button onClick={handleAddToWishlist} className="btn btn-primary btnhover btnhover2"><i className="flaticon-heart"></i> <span>Add to wishlist</span></button>
                                                    <button onClick={handleAddToCart} className="btn btn-primary btnhover btnhover2 ms-2"><i className="flaticon-shopping-cart-1"></i> <span>Add to cart</span></button>
                                                </div>
                                            </div>
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
                                            <Nav.Item as="li"><Nav.Link  eventKey="details">Details Product</Nav.Link></Nav.Item>
                                            <Nav.Item as="li"><Nav.Link  eventKey="review">Customer Reviews</Nav.Link></Nav.Item>
                                        </Nav>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="details">
                                                <table className="table border book-overview">
                                                    <tbody>
                                                        {tableDetail.map((data, index)=>(
                                                            <tr key={index}>
                                                                <th>{data.tablehead}</th>
                                                                <td>{data.tabledata}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="review">
                                                <div className="clear" id="comment-list">
                                                    <div className="post-comments comments-area style-1 clearfix">
                                                        <h4 className="comments-title">{reviews.length} COMMENTS</h4>
                                                        <div id="comment">
                                                            <ol className="comment-list">
                                                                {reviews.map((rev, index) => (
                                                                    <li key={index} className="comment even thread-even depth-1">
                                                                        <CommentBlog title={rev.user?.username || 'User'} comment={rev.comment} date={rev.createdAt} rating={rev.rating} />
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                        <div className="default-form comment-respond style-1" id="respond">
                                                            <h4 className="comment-reply-title" id="reply-title">LEAVE A REPLY</h4>
                                                            <div className="clearfix">
                                                                <form onSubmit={handleReviewSubmit} className="comment-form">
                                                                    <p className="comment-form-comment">
                                                                        <select className="form-control mb-2" value={rating} onChange={(e) => setRating(e.target.value)}>
                                                                            <option value="5">5 Stars</option>
                                                                            <option value="4">4 Stars</option>
                                                                            <option value="3">3 Stars</option>
                                                                            <option value="2">2 Stars</option>
                                                                            <option value="1">1 Star</option>
                                                                        </select>
                                                                        <textarea placeholder="Type Comment Here" className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
                                                                    </p>
                                                                    <p className="col-md-12 col-sm-12 col-xs-12 form-submit">
                                                                        <button type="submit" className="submit btn btn-primary filled">
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
                <NewsLetter />      
            </div>
        </>
    )
}
export default ShopDetail;

