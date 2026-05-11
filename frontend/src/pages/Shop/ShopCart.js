import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/api';
import Swal from 'sweetalert2';

//Components 
import PageTitle from '../../components/layout/PageTitle';

function ShopCart(){
    const [cart, setCart] = useState(null);

    const fetchCart = async () => {
        try {
            const response = await orderService.getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (bookId, delta) => {
        try {
            await orderService.addToCart(bookId, delta);
            fetchCart();
        } catch (error) {
            Swal.fire('Error', 'Failed to update quantity', 'error');
        }
    };

    if (!cart) return <div className="page-content"><PageTitle parentPage="Shop" childPage="Cart" /><div className="container">Loading...</div></div>;

    return(
        <>
            <div className="page-content">
                <PageTitle  parentPage="Shop" childPage="Cart" />
                <section className="content-inner shop-account">
                    <div className="container">
                        <div className="row mb-5">
                            <div className="col-lg-12">
                                <div className="table-responsive">
                                    <table className="table check-tbl">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Product name</th>
                                                <th>Unit Price</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.items.map((item, index)=>(
                                                <tr key={index}>
                                                    <td className="product-item-img"><img src={item.book.imageUrl} alt="" style={{width: '50px'}} /></td>
                                                    <td className="product-item-name">{item.book.title}</td>
                                                    <td className="product-item-price">${item.price}</td>
                                                    <td className="product-item-quantity">
                                                        <div className="quantity btn-quantity style-1 me-3">
                                                            <button className="btn btn-plus" type="button" onClick={() => handleUpdateQuantity(item.book.id, 1)}>
                                                                <i className="ti-plus"></i>
                                                            </button>
                                                            <input type="text" className="quantity-input" value={item.quantity} readOnly />
                                                            <button className="btn btn-minus" type="button" onClick={() => handleUpdateQuantity(item.book.id, -1)}>
                                                                <i className="ti-minus"></i>
                                                            </button>    
                                                        </div>
                                                    </td>
                                                    <td className="product-item-totle">${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6 offset-lg-6">
                                <div className="widget">
                                    <h4 className="widget-title">Cart Totals</h4>
                                    <table className="table-bordered check-tbl m-b25">
                                        <tbody>
                                            <tr>
                                                <td>Total</td>
                                                <td>${cart.totalAmount?.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="form-group m-b25">
                                        <Link to={"/shop-checkout"} className="btn btn-primary btnhover">Proceed to Checkout</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
export default ShopCart;

