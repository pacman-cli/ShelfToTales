import React from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function QuickView({ show, onHide, book }) {
    if (!book) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="quick-view-modal">
            <Modal.Header closeButton className="border-0"></Modal.Header>
            <Modal.Body className="p-4 pt-0">
                <div className="row">
                    <div className="col-md-5 mb-4 mb-md-0">
                        <img src={book.imageUrl} alt={book.title} className="img-fluid rounded shadow" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                    </div>
                    <div className="col-md-7">
                        <div className="dz-content">
                            <span className="badge bg-primary mb-2">{book.category}</span>
                            <h2 className="title mb-2">{book.title}</h2>
                            <div className="d-flex align-items-center mb-3">
                                <ul className="dz-rating d-flex text-warning list-unstyled mb-0 me-3">
                                    <li><i className="fa-solid fa-star"></i></li>
                                    <li><i className="fa-solid fa-star"></i></li>
                                    <li><i className="fa-solid fa-star"></i></li>
                                    <li><i className="fa-solid fa-star"></i></li>
                                    <li><i className="fa-solid fa-star-half-stroke"></i></li>
                                </ul>
                                <span className="text-muted small">(4.5 Rating)</span>
                            </div>
                            <h3 className="text-primary mb-3">${book.price}</h3>
                            <p className="mb-4">{book.description || "No description available for this book. It's a wonderful journey into the world of literature."}</p>
                            
                            <div className="book-info-list mb-4">
                                <ul className="list-unstyled">
                                    <li className="mb-2"><strong>Author:</strong> <span className="text-muted">{book.author}</span></li>
                                    <li className="mb-2"><strong>Availability:</strong> <span className="text-success">In Stock</span></li>
                                </ul>
                            </div>

                            <div className="d-flex gap-3">
                                <div className="input-group" style={{ width: '120px' }}>
                                    <button className="btn btn-outline-secondary btn-sm" type="button">-</button>
                                    <input type="text" className="form-control form-control-sm text-center" defaultValue="1" />
                                    <button className="btn btn-outline-secondary btn-sm" type="button">+</button>
                                </div>
                                <button className="btn btn-primary btnhover flex-fill">Add to Cart</button>
                            </div>
                            <div className="mt-4">
                                <Link to={`/books-detail/${book.id}`} className="btn btn-link p-0 text-primary" onClick={onHide}>View Full Details</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default QuickView;



