import React,{useState} from 'react';
import {Link} from 'react-router-dom';

//images
import book3 from '../../assets/images/books/grid/book3.jpg';
import book2 from '../../assets/images/books/grid/book2.jpg';
import book4 from '../../assets/images/books/grid/book4.jpg';
import book1 from '../../assets/images/books/grid/book1.jpg';
import book6 from '../../assets/images/books/grid/book6.jpg';
import book5 from '../../assets/images/books/grid/book5.jpg';
//Components 
import PageTitle from '../../components/layout/PageTitle';

const wishListData = [
    {id:'1', image: book1, title: 'Prduct Item 1', price:'28.00', number: 1},
    {id:'2', image: book2, title: 'Prduct Item 2', price:'28.00', number: 1},
    {id:'3', image: book3, title: 'Prduct Item 3', price:'28.00', number: 1},
    {id:'4', image: book4, title: 'Prduct Item 4', price:'28.00', number: 1},
    {id:'5', image: book5, title: 'Prduct Item 5', price:'28.00', number: 1},
    {id:'6', image: book6, title: 'Prduct Item 6', price:'28.00', number: 1},
];

function Wishlist(){
    const [wishData, setWishData] = useState(wishListData);
    const handleDeleteClick = (shopId) => {
        const newItem = [...wishData];    
        const index = wishData.findIndex((data)=> data.id === shopId);
        newItem.splice(index, 1);
        setWishData(newItem);
    }
	
	const handleNumPlus = (e) =>{
		let temp = wishData.map((data) => {
            if (e === data.id) {
                return { ...data, number: data.number + 1 };
            }
            return data;
        });
        setWishData(temp);
	}
	const handleNumMinus = (e) =>{

		let temp = wishData.map((data) => {
            if (e === data.id) {
                return { ...data, number: data.number > 0 ? data.number - 1 : data.number };
            }
            return data;
        });
        setWishData(temp);
	}
    return(
        <>
            <div className="page-content">
                <PageTitle  parentPage="Shop" childPage="Wishlist" />
                <section className="content-inner-1">
                    {/* <!-- Product --> */}
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="table-responsive">
                                    <table className="table check-tbl">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Product name</th>
                                                <th>Unit Price</th>
                                                <th>Quantity</th>
                                                <th>Add to cart</th>
                                                <th>Close</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wishData.map((data, index)=>(
                                                <tr key={index}>
                                                    <td className="product-item-img"><img src={data.image} alt="" /></td>
                                                    <td className="product-item-name">{data.title}</td>
                                                    <td className="product-item-price">${data.price}</td>
                                                    <td className="product-item-quantity">
                                                        <div className="quantity btn-quantity style-1 me-3">
                                                            <button className="btn btn-plus" type="button" 
                                                                onClick={()=> {handleNumPlus(data.id)}}>
                                                                <i className="ti-plus"></i>
                                                            </button>
                                                            <input type="text" className="quantity-input" value={data.number} />
                                                            <button className="btn btn-minus " type="button"
                                                                onClick={()=>{handleNumMinus(data.id)}}>
                                                                <i className="ti-minus"></i>
                                                            </button>    
                                                        </div>
                                                    </td>
                                                    <td className="product-item-totle"><Link to={"/shop-cart"} className="btn btn-primary btnhover">Add To Cart</Link></td>
                                                    <td className="product-item-close">
                                                        <Link to={"#"} className="ti-close" onClick={()=>handleDeleteClick(data.id)}></Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>
                    {/* <!-- Product END --> */}
                </section>
            
            </div>
        </>
    )
}
export default Wishlist;

