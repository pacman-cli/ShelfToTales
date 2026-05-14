import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination } from "swiper";
import { bookService } from '../../../api/api';

function FeaturedSlider() {
    const [books, setBooks] = useState([]);
	const navigationPrevRef = React.useRef(null)
	const navigationNextRef = React.useRef(null)
    const paginationRef = React.useRef(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await bookService.getAll();
                setBooks(response.data.slice(0, 5)); // Just take first 5
            } catch (error) {
                console.error('Error fetching featured books:', error);
            }
        };
        fetchBooks();
    }, []);

	return (
		<>			
            <Swiper className="swiper-container books-wrapper-2 swiper-three"						
                centeredSlides={true}
                slidesPerView={"auto"}
                spaceBetween= {90}
                loop={books.length > 1}
				speed={1000}
                pagination= {{
                    el: ".swiper-pagination-three",
                    clickable: true,
                }}
                navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                }}
                modules={[Navigation, Pagination]}
                breakpoints = {{
                    320: { slidesPerView: 1 },
                    1200: { slidesPerView: 1 },
                    1680: { slidesPerView: 1 },
                }}						
            >	
            
                {books.map((item,ind)=>(
                    <SwiperSlide key={ind}>                       
                        <div className="books-card style-2">
                            <div className="dz-media">
                                <img src={item.coverUrl} alt="book" style={{width: '250px'}} />									
                            </div>
                            <div className="dz-content">
                                <h6 className="sub-title">BEST SELLER</h6>
                                <h2 className="title">{item.title}</h2>
                                <ul className="dz-tags">
                                    <li>{item.author}</li>
                                    <li>{item.category?.name}</li>
                                </ul>
                                <p className="text">{item.description}</p>
                                <div className="price">
                                    <span className="price-num">${item.discountPrice || item.price}</span>
                                    {item.discountPrice && <del>${item.price}</del>}
                                </div>
                                <div className="bookcard-footer">
                                    <Link to={`/shop-detail/${item.id}`} className="btn btn-outline-secondary btnhover m-t15">See Details</Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                    
                ))}	
                <div className="pagination-align style-2">
                    <div className="swiper-button-prev" ref={navigationPrevRef}><i className="fa-solid fa-angle-left"></i></div>
                    <div className="swiper-pagination-three" ref={paginationRef}></div>
                    <div className="swiper-button-next"  ref={navigationNextRef}><i className="fa-solid fa-angle-right"></i></div>
                </div>									
            </Swiper>			
		</>
	)
}
export default FeaturedSlider;


