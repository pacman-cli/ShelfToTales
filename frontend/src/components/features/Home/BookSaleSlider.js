import React from "react";
import { Link } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
//import "swiper/css";
import { Navigation, Pagination } from "swiper";

//Images

import book3 from './../../../assets/images/books/grid/book3.jpg';
import book5 from './../../../assets/images/books/grid/book5.jpg';
import book7 from './../../../assets/images/books/grid/book7.jpg';
import book11 from './../../../assets/images/books/grid/book11.jpg';
import book12 from './../../../assets/images/books/grid/book12.jpg';
import book15 from './../../../assets/images/books/grid/book15.jpg';




// import Swiper core and required modules

const dataBlog = [
    { image: book5, title: 'Take Out Tango' },
    { image: book11, title: 'The Missadventure' },
    { image: book7, title: 'Seconds [PART 1]' },
    { image: book12, title: 'The Missadventure' },
    { image: book15, title: 'Terrible Madness' },
    { image: book3, title: 'Battle Drive' },
];

function BookSaleSlider() {
    const navigationPrevRef = React.useRef(null)
    const navigationNextRef = React.useRef(null)
    const paginationRef = React.useRef(null)
    return (
        <>

            <div className="section-head book-align">
                <h2 className="title mb-0">Books on Sale</h2>
                <div className="pagination-align style-1">
                    <div className="swiper-button-prev" ref={navigationPrevRef}><i className="fa-solid fa-angle-left"></i></div>
                    <div className="swiper-pagination-two" ref={paginationRef}></div>
                    <div className="swiper-button-next" ref={navigationNextRef}><i className="fa-solid fa-angle-right"></i></div>
                </div>
            </div>
            <Swiper className="swiper-container books-wrapper-3 swiper-four"
                speed={1500}
                parallax={true}
                slidesPerView={5}
                spaceBetween={30}
                loop={true}
                pagination={{
                    el: ".swiper-pagination-two",
                    clickable: true,
                }}
                autoplay={{
                    delay: 3000,
                }}

                navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                }}
                modules={[Navigation, Pagination]}
                breakpoints={{
                    1200: {
                        slidesPerView: 5,
                    },
                    1191: {
                        slidesPerView: 4,
                    },
                    767: {
                        slidesPerView: 3,
                    },
                    591: {
                        slidesPerView: 2,
                        centeredSlides: true,
                    },
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 15,
                        centeredSlides: true,
                    },
                }}
            >

                {dataBlog.map((item, ind) => (
                    <SwiperSlide key={ind}>
                        <div className="books-card style-3 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="dz-media">
                                <img src={item.image} alt="book" />
                            </div>
                            <div className="dz-content">
                                <h5 className="title"><Link to={"/books-grid-view"}>Take Out Tango</Link></h5>
                                <ul className="dz-tags">
                                    <li><Link to={"/books-grid-view"}>SPORTS,</Link></li>
                                    <li><Link to={"/books-grid-view"}>DRAMA</Link></li>
                                </ul>
                                <div className="book-footer">
                                    <div className="rate">
                                        <i className="flaticon-star"></i> {ind + 1}.8
                                    </div>
                                    <div className="price">
                                        <span className="price-num">${ind + 2}.5</span>
                                        <del>$12.0</del>
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
export default BookSaleSlider;


