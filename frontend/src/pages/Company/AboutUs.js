import React from 'react';
import {Link} from 'react-router-dom';
import CountUp from 'react-countup';


//Components 
import PageTitle from '../../components/layout/PageTitle';
import TestimonialSlider from '../../components/features/Home/TestimonialSlider';
import ClientsSlider from '../../components/features/Home/ClientsSlider';
import NewsLetter from '../../components/features/NewsLetter';

//element
import CounterSection from '../../components/common/CounterSection';

//Imgaes
import about1 from '../../assets/images/about/about1.jpg';
import about2 from '../../assets/images/about/about2.jpg';


const missionBlog = [
    {iconClass:'flaticon-open-book-1', title:'Best Bookstore' },
    {iconClass:'flaticon-exclusive', title:'Trusted Seller' },
    {iconClass:'flaticon-store', title:'Expand Store' },
];

function AboutUs(){
    return(
        <>
            <div className="page-content bg-white">
               <PageTitle  parentPage="Home" childPage="About us" />
               <section className="content-inner overlay-white-middle">
                    <div className="container">
                        <div className="row about-style1 align-items-center">
                            <div className="col-lg-6 m-b30">
                                <div className="row sp10 about-thumb">
                                    <div className="col-sm-6 aos-item" >
                                        <div className="split-box">
                                            <div>
                                                <img className="m-b30" src={about1} alt="" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="split-box ">
                                            <div>
                                                <img className="m-b20 aos-item" src={about2} alt=""  />
                                            </div>
                                        </div>
                                        <div className="exp-bx aos-item" >
                                            <div className="exp-head">
                                                <div className="counter-num">
                                                    <h2><span className="counter"> <CountUp end={50} /></span><small>+</small></h2>
                                                </div>
                                                <h6 className="title">Years of Experience</h6>
                                            </div>
                                            <div className="exp-info">
                                                <ul className="list-check primary">
                                                    <li>Comics & Graphics</li>
                                                    <li>Biography</li>
                                                    <li>Literary Collections</li>
                                                    <li>Children Fiction</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 m-b30 aos-item">
                                <div className="about-content px-lg-4">
                                    <div className="section-head style-1">
                                        <h2 className="title">Bookland Is Best Choice For Learners</h2>
                                        <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration which don’t look even slightly believable. It Is A Long Established Fact That A Reader Will Be Distracted</p>
                                    </div>
                                    <Link to={"/contact-us"} className="btn btn-primary btnhover shadow-primary">Contact Us</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content-inner-1 bg-light">
                    <div className="container">
                        <div className="section-head text-center">
                            <h2 className="title">Our Mission</h2>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris</p>
                        </div>
                        <div className="row">
                            {missionBlog.map((data, i)=>(
                                <div className="col-lg-4 col-md-6" key={i}>
                                    <div className="icon-bx-wraper style-3 m-b30">
                                        <div className="icon-lg m-b20">
                                            <i className={`icon-cell ${data.iconClass}`}></i>
                                        </div>
                                        <div className="icon-content">
                                            <h4 className="title">{data.title}</h4>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
                                            <Link to={"/about-us"}>Learn More <i className="fa-solid fa-angles-right"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="content-inner-1 testimonial-wrapper">
					<TestimonialSlider />	
				</section>	
                <section className="content-inner bg-light">
                    <div className="container">
				        <div className="row sp15">
                            <CounterSection /> 
                         </div>
                    </div>        
                </section>
                <div className="py-5">
			        <div className="container">
                         <ClientsSlider />       
                    </div>
                </div>    
                <NewsLetter />             
            </div>
        </>
    )
}
export default AboutUs;

