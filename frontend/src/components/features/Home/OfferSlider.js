import React from "react";
import {Link} from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
//import "swiper/css";
import { Navigation, Pagination } from "swiper";

//Images

import blog3 from './../../../assets/images/blog/blog5.jpg';
import blog5 from './../../../assets/images/blog/blog6.jpg';
import blog7 from './../../../assets/images/blog/blog7.jpg';



// import Swiper core and required modules

const dataBlog = [
	{ image: blog3, title:'SECONDS [Part I]'},
	{ image: blog5, title:'TERRRIBLE MADNESS'},
	{ image: blog7, title:'REWORK'},
	{ image: blog3, title:'SECONDS [Part I]'},
	{ image: blog5, title:'TERRRIBLE MADNESS'},
	{ image: blog7, title:'REWORK'},
]; 

function OfferSlider() {
	const navigationPrevRef = React.useRef(null)
	const navigationNextRef = React.useRef(null)
   // const paginationRef = React.useRef(null)
	return (
		<>
					
            <div className="section-head book-align">
                <h2 className="title mb-0">Special Offers</h2>
                <div className="pagination-align style-1">
                    <div className="book-button-prev swiper-button-prev" ref={navigationPrevRef}><i className="fa-solid fa-angle-left"></i></div>
                    <div className="book-button-next swiper-button-next" ref={navigationNextRef}><i className="fa-solid fa-angle-right"></i></div>
                </div>
            </div>	
            <Swiper className="swiper-container  book-swiper"						
               // speed= {1500}
                //parallax= {true}
                slidesPerView={3}
                spaceBetween= {30}
                //loop={true}
                // pagination= {{
                //     el: ".swiper-pagination-two",
                //     clickable: true,
                // }}
                autoplay= {{
                    delay: 4000,
                }}								

                    navigation={{
                        prevEl: navigationPrevRef.current,
                        nextEl: navigationNextRef.current,
                    }}
                modules={[Navigation, Pagination]}
                breakpoints = {{
                    360: {
                        slidesPerView: 1,
                    },
                    600: {
                        slidesPerView: 1,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    1200: {
                        slidesPerView: 3,
                    },
                    1680: {
                        slidesPerView: 3,
                    }
                }}						
            >	
            
                {dataBlog.map((item,ind)=>(
                    <SwiperSlide key={ind}>                       
                        <div className="dz-card style-2">
                            <div className="dz-media">
                                <Link to={"/books-detail"}><img src={item.image} alt="/" /></Link>
                            </div>
                            <div className="dz-info">
                                <h4 className="dz-title"><Link to={"/books-detail"}>{item.title}</Link></h4>
                                <div className="dz-meta">
                                    <ul className="dz-tags">
                                        <li><Link to={"/books-detail"} className="me-1">BIOGRAPHY</Link></li>
                                        <li><Link to={"/books-detail"} className="me-1">THRILLER</Link></li>
                                        <li><Link to={"/books-detail"} >HORROR</Link></li>
                                    </ul>
                                </div>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
                                <div className="bookcard-footer">
                                    <Link to={"/shop-cart"} className="btn btn-primary m-t15 btnhover btnhover2"><i className="flaticon-shopping-cart-1 m-r10"></i> Add to cart</Link>
                                    <div className="price-details">
                                        $18,78 <del>$25</del>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}										
            </Swiper>			
		</>
	)
}
export default OfferSlider;


