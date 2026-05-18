'use client';

import React from "react";
import Link from 'next/link';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";

//Images
const book1 = '/assets/images/books/grid/book1.jpg';
const book2 = '/assets/images/books/grid/book2.jpg';
const book5 = '/assets/images/books/grid/book5.jpg';
const book6 = '/assets/images/books/grid/book6.jpg';
const book14 = '/assets/images/books/grid/book14.jpg';
const book15 = '/assets/images/books/grid/book15.jpg';
const book16 = '/assets/images/books/grid/book16.jpg';
// import Swiper core and required modules
import { Autoplay } from "swiper/modules";

//SwiperCore.use([EffectCoverflow,Pagination]);

const dataBlog = [
	{image: book6  , title:'Adventure', price:'$18.78'},
	{image: book5  , title:'Take Tango', price:'$20.50'},
	{image: book2  , title:'Homie', price:'$25.50'},
	{image: book16 , title:'Thunder Stunt', price:'$16.70'},
	{image: book14 , title:'Heavy Lift', price:'$19.25'},
	{image: book1  , title:'Real Life', price:'$27.30'},
	{image: book15 , title:'Terrible', price:'$24.89'},
];

export default function RecomendedSlider() {
	
	return (
		<>
			<Swiper className="swiper-container  swiper-two"						
				speed= {1500}
				//parallax= {true}
				slidesPerView= {5}
				spaceBetween= {30}
				loop={true}
				autoplay= {{
				   delay: 2500,
				}}
				modules={[ Autoplay ]}
				breakpoints = {{
					1200: {
                        slidesPerView: 5,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 3,
                        centeredSlides: true,
                    },
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 15,
                        centeredSlides: true,
                    },
				}}
			>	
				{dataBlog.map((d,i)=>(
					<SwiperSlide key={i}>						
                        <div className="books-card style-1 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="dz-media">
                                <img loading="lazy" decoding="async" src={d.image} alt="book" />									
                            </div>
                            <div className="dz-content">
                                <h4 className="title">{d.title}</h4>
                                <span className="price">{d.price}</span>
                                <Link href={"/shop-cart"} className="btn btn-secondary btnhover btnhover2"><i className="flaticon-shopping-cart-1 m-r10"></i> Add to cart</Link>
                            </div>
                        </div>						
					</SwiperSlide>
				))}				
			</Swiper>
		</>
	)
}


