import React from "react";
//import {Link} from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
//import "swiper/css";
import { Navigation, Pagination } from "swiper";

//Images

import test1 from './../../../assets/images/testimonial/testimonial1.jpg';
import test2 from './../../../assets/images/testimonial/testimonial2.jpg';
import test3 from './../../../assets/images/testimonial/testimonial3.jpg';
import test4 from './../../../assets/images/testimonial/testimonial4.jpg';


const testBlog = [
	{ image: test1, title:'Jason Huang'},
	{ image: test2, title:'Miranda Lee'},
	{ image: test3, title:'Steve Henry'},
	{ image: test4, title:'Angela Moss'},
	{ image: test1, title:'Miranda Lee'},
	{ image: test2, title:'Jason Huang'},
]; 

function TestimonialSlider() {
	const navigationPrevRef = React.useRef(null)
	const navigationNextRef = React.useRef(null)
   // const paginationRef = React.useRef(null)
	return (
		<>
            <div className="container">
				<div className="testimonial">
					<div className="section-head book-align">
						<div>
							<h2 className="title mb-0">Testimonials</h2>
							<p className="m-b0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
						</div>
						<div className="pagination-align style-1">
							<div className="testimonial-button-prev swiper-button-prev" ref={navigationPrevRef}><i className="fa-solid fa-angle-left"></i></div>
							<div className="testimonial-button-next swiper-button-next" ref={navigationNextRef}><i className="fa-solid fa-angle-right"></i></div>
						</div>
					</div>
				</div>
			</div>
            <Swiper className="swiper-container  testimonial-swiper"						
               // speed= {1500}
                //parallax= {true}
                slidesPerView={3}
                spaceBetween= {30}
                loop={true}
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
                    1200: {
                        slidesPerView: 3,
                    },
                }}						
            >	
            
                {testBlog.map((item,ind)=>(
                    <SwiperSlide key={ind}>                       
                        <div className="testimonial-1" >
							<div className="testimonial-info">
								<ul className="dz-rating">
									<li><i className="flaticon-star text-yellow"></i></li>	
									<li><i className="flaticon-star text-yellow"></i></li>	
									<li><i className="flaticon-star text-yellow"></i></li>	
									<li><i className="flaticon-star text-yellow"></i></li>	
									<li><i className="flaticon-star text-yellow"></i></li>	
								</ul>
								<div className="testimonial-text">
									<p>Very impresive store. Your book made studying for the ABC certification exams a breeze. Thank you very much</p>
								</div>
								<div className="testimonial-detail">
									<div className="testimonial-pic">
										<img src={item.image} alt="" />
									</div>
									<div className="info-right">
										<h6 className="testimonial-name">{item.title}</h6> 
										<span className="testimonial-position">Book Lovers</span> 
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
export default TestimonialSlider;


