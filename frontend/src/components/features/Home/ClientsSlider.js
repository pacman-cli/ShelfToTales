import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";

//Images
import client1 from './../../../assets/images/client/client1.svg';
import client2 from './../../../assets/images/client/client2.svg';
import client3 from './../../../assets/images/client/client3.svg';
import client4 from './../../../assets/images/client/client4.svg';
import client5 from './../../../assets/images/client/client5.svg';



// import Swiper core and required modules
import { Autoplay } from "swiper";

//SwiperCore.use([EffectCoverflow,Pagination]);

const clientData = [
	{image: client1},
	{image: client2},
	{image: client3},
	{image: client4},
	{image: client5},
];

export default function ClientsSlider() {
	
	return (
		<>
			<Swiper className="swiper-container  client-swiper"						
				speed= {1500}
				parallax= {true}
				slidesPerView= {5}
				spaceBetween= {30}
				//loop={true}
				autoplay= {{
				   delay: 2000,
				}}
				modules={[ Autoplay ]}
				breakpoints = {{
					1600: {
                        slidesPerView: 5,
                    },
                    1400: {
                        slidesPerView: 4,
                    },
                    1200: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    591: {
                        slidesPerView: 2,
                    },
                    320: {
                        slidesPerView: 2,
                    },
				}}
			>	
				{clientData.map((d,i)=>(
					<SwiperSlide key={i}>						
						<img className="logo-main" src={d.image} alt="clientimg" />						
					</SwiperSlide>
				))}				
			</Swiper>
		</>
	)
}


