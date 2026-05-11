import React from 'react';
import {Link} from 'react-router-dom';

//Components 
import PageTitle from '../../components/layout/PageTitle';
import ClientsSlider from '../../components/features/Home/ClientsSlider';
//element
import CounterSection from '../../components/common/CounterSection';
import NewsLetter from '../../components/features/NewsLetter';

//images
import service1 from '../../assets/images/services/service1.jpg';
import service2 from '../../assets/images/services/service2.jpg';
import service3 from '../../assets/images/services/service3.jpg';
import service4 from '../../assets/images/services/service4.jpg';
import service5 from '../../assets/images/services/service5.jpg';
import service6 from '../../assets/images/services/service6.jpg';

const serviceCard = [
    {title:'24*7 Support', image: service5},
    {title:'Sitting Arrangement', image: service2},
    {title:'Proper Management', image: service3},
    {title:'Online Registration', image: service4},
    {title:'Download PDF', image: service1},
    {title:'Flexible Timing', image: service6},
];

function Services(){
    return(
        <>
            <div className="page-content">
                <PageTitle  parentPage="Pages" childPage="Services" />
                <section className="content-inner bg-white">
                    <div className="container">	
                        <div className="row">
                            {serviceCard.map((data, index)=>(
                                <div className="col-lg-4 col-md-6" key={index}>
                                    <div className="content-box style-1 m-b30">
                                        <div className="dz-info">
                                            <h4 className="title">{data.title}</h4>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna </p>
                                        </div>
                                        <div className="dz-banner-media1.jpg m-b30">
                                            <img src={data.image} alt="" />
                                        </div>
                                        <div className="dz-bottom">
                                            <Link to={"/services"} className="btn-link btnhover3">READ MORE<i className="fas fa-arrow-right m-l10"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>  
                    </div>
                </section> 
                <section className="content-inner bg-light">
                    <div className="container">
                        <div className="row sp15">   
                            <CounterSection />        
                        </div>
                    </div>
                </section>    
                <div className="bg-white py-5">
				    <div className="container">        
                        <ClientsSlider />      
                    </div>
                </div>  
                <NewsLetter />  
            </div>
        </>
    )
}
export default Services;

