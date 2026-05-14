import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {Collapse, Dropdown} from 'react-bootstrap';

//Component
import ClientsSlider from '../../components/features/Home/ClientsSlider';
import NewsLetter from '../../components/features/NewsLetter';

//element
import PageTitle from '../../components/layout/PageTitle';
import CounterSection from '../../components/common/CounterSection';
import ShopSidebar from '../../components/common/ShopSidebar';

//Images
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

const lableBlogData = [
    {name:'Architecture'},
    {name:'Art'},
    {name:'Action'},
    {name:'Biography & Autobiography'},
    {name:'Body, Mind & Spirit'},
    {name:'Business & Economics'},    
    {name:'Children Fiction'},
    {name:'Children Non-Fiction'},
    {name:'Comics & Graphic Novels'},
    {name:'Cooking'},
    {name:'Crafts & Hobbies'},
    {name:'Design'},
    {name:'Drama'},
    {name:'Education'},
    {name:'Family & Relationships'},
    {name:'Fiction'},
    {name:'Foreign Language Study'},
    {name:'Games'},
    {name:'Gardening'},
    {name:'Health & Fitness'},
    {name:'History'},
    {name:'House & Home'},
    {name:'Humor'},
    {name:'Literary Collections'},
    {name:'Mathematics'}
];

const cardDetials = [
    {image:book16, title:'Thunder Stunt', subtitle1:'ADVANTURE',subtitle2:'SCIENCE', price1:'54.78', price2:'70.00' },
    {image:book14, title:'A Heavy Lift', subtitle1:'RACING',subtitle2:'DRAMA', price1:'25.18', price2:'68.00' },
    {image:book15, title:'Terrible Madness', subtitle1:'SPORTS',subtitle2:'GAME', price1:'25.30', price2:'38.00' },
    {image:book4, title:'Such Fun Age', subtitle1:'ADVANTURE', price1:'20.15', price2:'33.00' },
    {image:book9, title:'Pushing Clouds', subtitle1:'ADVANTURE', price1:'30.12', price2:'40.00' },
    {image:book2, title:'Homie', subtitle1:'HORROR',subtitle2:'DRAMA', price1:'15.25', price2:'45.00' },
    {image:book7, title:'SECONDS', subtitle1:'SPORTS',subtitle2:'GAME', price1:'21.78', price2:'36.00' },
    {image:book13, title:'REWORK', subtitle1:'THRILLER', price1:'23.20', price2:'49.00' },
    {image:book11, title:'ALL GOOD NEWS', subtitle1:'DRAMA',subtitle2:'COMEDY', price1:'40.78', price2:'68.00' },
    {image:book10, title:'Emily The Back', subtitle1:'DRAMA',subtitle2:'SIRIAL', price1:'54.78', price2:'63.00' },
    {image:book8, title:'The Adventure', subtitle1:'BIOGRAPHY', price1:'37.00', price2:'47.00' },
    {image:book14, title:'A Heavy Lift', subtitle1:'STORY',subtitle2:'BIOGRAPHY', price1:'22.00', price2:'51.00' },
];



function BooksGridViewSidebar(){
    const [accordBtn, setAccordBtn] = useState();
    const [selectBtn, setSelectBtn] = useState('Newest');
    return(
        <>
            <PageTitle parentPage="Home" childPage="Books Grid View Sidebar" />
            <div className="page-content bg-grey">
                <div className="content-inner-1 border-bottom">
                    <div className="container">
                        <div className="row ">  
                            <div className="col-xl-3">
                                <ShopSidebar />
                            </div>
                           
                            <div className="col-xl-9">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="title">Books</h4>
                                    <Link to={"#"} className="btn btn-primary panel-btn">Filter</Link>
                                </div>
                                <div className="filter-area m-b30">
                                    <div className="grid-area">
                                        <div className="shop-tab">
                                            <ul className="nav text-center product-filter justify-content-end" role="tablist">

                                                <li className="nav-item">
                                                    <Link to={"/books-list"} className="nav-link">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 5H21C21.2652 5 21.5196 4.89464 21.7071 4.7071C21.8946 4.51957 22 4.26521 22 4C22 3.73478 21.8946 3.48043 21.7071 3.29289C21.5196 3.10536 21.2652 3 21 3H3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4C2 4.26521 2.10536 4.51957 2.29289 4.7071C2.48043 4.89464 2.73478 5 3 5Z" fill="#AAAAAA"></path>
                                                        <path d="M3 13H21C21.2652 13 21.5196 12.8947 21.7071 12.7071C21.8946 12.5196 22 12.2652 22 12C22 11.7348 21.8946 11.4804 21.7071 11.2929C21.5196 11.1054 21.2652 11 21 11H3C2.73478 11 2.48043 11.1054 2.29289 11.2929C2.10536 11.4804 2 11.7348 2 12C2 12.2652 2.10536 12.5196 2.29289 12.7071C2.48043 12.8947 2.73478 13 3 13Z" fill="#AAAAAA"></path>
                                                        <path d="M3 21H21C21.2652 21 21.5196 20.8947 21.7071 20.7071C21.8946 20.5196 22 20.2652 22 20C22 19.7348 21.8946 19.4804 21.7071 19.2929C21.5196 19.1054 21.2652 19 21 19H3C2.73478 19 2.48043 19.1054 2.29289 19.2929C2.10536 19.4804 2 19.7348 2 20C2 20.2652 2.10536 20.5196 2.29289 20.7071C2.48043 20.8947 2.73478 21 3 21Z" fill="#AAAAAA"></path>
                                                        </svg>
                                                    </Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link to={"/books-grid-view"} className="nav-link">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 11H10C10.2652 11 10.5196 10.8946 10.7071 10.7071C10.8946 10.5196 11 10.2652 11 10V3C11 2.73478 10.8946 2.48043 10.7071 2.29289C10.5196 2.10536 10.2652 2 10 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11ZM4 4H9V9H4V4Z" fill="#AAAAAA"></path>
                                                        <path d="M14 11H21C21.2652 11 21.5196 10.8946 21.7071 10.7071C21.8946 10.5196 22 10.2652 22 10V3C22 2.73478 21.8946 2.48043 21.7071 2.29289C21.5196 2.10536 21.2652 2 21 2H14C13.7348 2 13.4804 2.10536 13.2929 2.29289C13.1054 2.48043 13 2.73478 13 3V10C13 10.2652 13.1054 10.5196 13.2929 10.7071C13.4804 10.8946 13.7348 11 14 11ZM15 4H20V9H15V4Z" fill="#AAAAAA"></path>
                                                        <path d="M3 22H10C10.2652 22 10.5196 21.8946 10.7071 21.7071C10.8946 21.5196 11 21.2652 11 21V14C11 13.7348 10.8946 13.4804 10.7071 13.2929C10.5196 13.1054 10.2652 13 10 13H3C2.73478 13 2.48043 13.1054 2.29289 13.2929C2.10536 13.4804 2 13.7348 2 14V21C2 21.2652 2.10536 21.5196 2.29289 21.7071C2.48043 21.8946 2.73478 22 3 22ZM4 15H9V20H4V15Z" fill="#AAAAAA"></path>
                                                        <path d="M14 22H21C21.2652 22 21.5196 21.8946 21.7071 21.7071C21.8946 21.5196 22 21.2652 22 21V14C22 13.7348 21.8946 13.4804 21.7071 13.2929C21.5196 13.1054 21.2652 13 21 13H14C13.7348 13 13.4804 13.1054 13.2929 13.2929C13.1054 13.4804 13 13.7348 13 14V21C13 21.2652 13.1054 21.5196 13.2929 21.7071C13.4804 21.8946 13.7348 22 14 22ZM15 15H20V20H15V15Z" fill="#AAAAAA"></path>
                                                        </svg>
                                                    </Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link to={"/books-grid-view-sidebar"} className="nav-link active">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 22H21C21.2652 22 21.5196 21.8946 21.7071 21.7071C21.8946 21.5196 22 21.2652 22 21V3C22 2.73478 21.8946 2.48043 21.7071 2.29289C21.5196 2.10536 21.2652 2 21 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V21C2 21.2652 2.10536 21.5196 2.29289 21.7071C2.48043 21.8946 2.73478 22 3 22ZM13 4H20V11H13V4ZM13 13H20V20H13V13ZM4 4H11V20H4V4Z" fill="#AAAAAA"></path>
                                                        </svg>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="category">
                                        <div className="filter-category">
                                            <Link to={"#"} data-bs-toggle="collapse"  
                                                onClick={() => setAccordBtn(!accordBtn)}
                                            >
                                                <i className="fas fa-list me-2"></i>
                                                Categories
                                            </Link>
                                        </div>
                                        <div className="form-group">
                                            <i className="fas fa-sort-amount-down me-2 text-secondary"></i>                                   
                                            <Dropdown>
                                                <Dropdown.Toggle  className="i-false">{selectBtn} <i className="ms-4 font-14 fa-solid fa-caret-down" /></Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={()=>setSelectBtn('Newest')}>Newest</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>setSelectBtn('1 Days')}>1 Days</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>setSelectBtn('2 Week')}>2 Week</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>setSelectBtn('3 Week')}>3 Weeks</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=>setSelectBtn('1 Month')}>1 Month</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                                <Collapse in={accordBtn} className="acod-content">
                                    <div>
                                        <div className="widget widget_services style-2">
                                            {lableBlogData.map((item, ind)=>(
                                                <div className="form-check search-content" key={ind}>
                                                    <input className="form-check-input" type="checkbox" value="" id={`productCheckBox${ind+1}`} /> 
                                                    <label className="form-check-label" htmlFor={`productCheckBox${ind+1}`}>
                                                        {item.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>   
                                    </div>
                                </Collapse>
                                <div className="row book-grid-row">
                                    {cardDetials.map((data, i)=>(
                                        <div className="col-book style-2" key={i}>
                                            <div className="dz-shop-card style-1">
                                                <div className="dz-media">
                                                    <img src={data.image} alt="book" />									
                                                </div>
                                                <div className="bookmark-btn style-2">
                                                    <input className="form-check-input" type="checkbox" id={`flexCheckDefault${i+21}`} />
                                                    <label className="form-check-label" htmlFor={`flexCheckDefault${i+21}`}>
                                                        <i className="flaticon-heart"></i>
                                                    </label>
                                                </div> 
                                                <div className="dz-content">
                                                    <h5 className="title"><Link to={"/books-grid-view"}>{data.title}</Link></h5>
                                                    <ul className="dz-tags">
                                                        <li><Link to={"/books-grid-view"}>{data.subtitle1},</Link></li>
                                                        <li><Link to={"/books-grid-view"}>{data.subtitle2}</Link></li>
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
                                                            <span className="price-num">${data.price1}</span>
                                                            <del>${data.price2}</del>
                                                        </div>
                                                        <Link to={"/shop-cart"} className="btn btn-secondary box-btn btnhover btnhover2"><i className="flaticon-shopping-cart-1 m-r10"></i> Add to cart</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}   
                                    
                                </div>
                                <div className="row mt-0">
                                    <div className="col-md-6">
                                        <p className="page-text">Showing 12 from 50 data</p>
                                    </div>
                                    <div className="col-md-6">
                                        <nav aria-label="Blog Pagination">
                                            <ul className="pagination style-1 p-t20">
                                                <li className="page-item"><Link className="page-link prev" to={"#"}>Prev</Link></li>
                                                <li className="page-item"><Link className="page-link active" to={"#"}>1</Link></li>
                                                <li className="page-item"><Link className="page-link" to={"#"}>2</Link></li>
                                                <li className="page-item"><Link className="page-link" to={"#"}>3</Link></li>
                                                <li className="page-item"><Link className="page-link next" to={"#"}>Next</Link></li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
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
        </>
    )
}
export default BooksGridViewSidebar;

