import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";

//Images
import wave from './../../../assets/images/testimonial/wave.png';
import test5 from './../../../assets/images/testimonial/testimonial5.jpg';
import test6 from './../../../assets/images/testimonial/testimonial6.jpg';

// import Swiper core and required modules
import { Autoplay } from "swiper";

//SwiperCore.use([EffectCoverflow,Pagination]);

const clientData = [
	{image: test5},
	{image: test6},
]
export default function CustomerSlider() {
	return (
		<>
			<Swiper className="swiper-container  testimonial-swiper-2"						
				speed= {1500}
				parallax= {true}
				slidesPerView= {1}
				spaceBetween= {30}
				loop={true}
				autoplay= {{
				   delay: 2000,
				}}
				modules={[ Autoplay ]}
				
			>	
				{clientData.map((d,i)=>(
					<SwiperSlide key={i}>	
                        <div className="testimonial-2">
                            <i className="fa-solid fa-quote-right test-quotes"></i>
                            <img src={wave} className="pattern" alt="/" />
                            <div className="testimonial-pic">
                                <img src={d.image} alt="/" />
                            </div>
                            <div className="testimonial-info">
                                <p className="testimonial-text">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur
                                </p>
                                <div className="testimonial-detail">
                                    <div className="clearfix">
                                        <h5 className="testimonial-name m-t10 m-b5">Johnson Simanungkalit</h5> 
                                        <span className="testimonial-position">faculty of Economics 2022</span> 
                                    </div>
                                    <div className="dz-rating-bar">
                                        <ul className="dz-rating">
                                            <li><i className="flaticon-star text-yellow"></i></li>	
                                            <li><i className="flaticon-star text-yellow"></i></li>	
                                            <li><i className="flaticon-star text-yellow"></i></li>	
                                            <li><i className="flaticon-star text-yellow"></i></li>		
                                            <li><i className="flaticon-star text-muted"></i></li>		
                                        </ul>
                                        <span className="rate">4.8</span>
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


