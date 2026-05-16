import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import Collapse from 'react-bootstrap/Collapse';
//images


function heartToggle(){
 	var  heartBlaste = document.querySelector('.heart');
 	if(heartBlaste){
		heartBlaste.classList.toggle("heart-blast");			
 	}	
}

const accordList = [
	{name:'Architecture'},{name:'Art'},{name:'Action'},{name:'Biography'},
	{name:'Body, Mind & Spirit'},{name:'Business & Economics'},
	{name:'Children Fiction'},{name:'Children Non-Fiction'},
	{name:'Comics & Graphics'},{name:'Cooking'},
	{name:'Crafts & Hobbies'},{name:'Design'},
	{name:'Drama'},{name:'Education'},
	{name:'Family & Relationships'},{name:'Fiction'},
	{name:'Foreign Language'},{name:'Games'},
	{name:'Gardening'},{name:'Health & Fitness'},
	{name:'History'},{name:'House & Home'},
	{name:'Humor'},{name:'Literary Collections'},
	{name:'Mathematics'},{name:'Medical'},
	{name:'Nature'},{name:'Performing Arts'},
	{name:'Pets'},{name:'Show others'}
];

function Footer({footerChange, logoImage}){
	//const [open, setOpen] = useState(false);
	const  d = new Date();
	const [accordBtn, setAccordBtn] = useState();
	return(
		<>
			<footer className={`site-footer ${footerChange}`}>				
				<div className="footer-category">
					<div className="container">
						<div className="category-toggle">
							<Link to={"#"} className={`toggle-btn ${accordBtn ? 'active' : ''}`}
								onClick={() => setAccordBtn(!accordBtn)}
							>Books categories</Link>
							<div className="toggle-items row">
								<Collapse in={accordBtn} className="footer-col-book">
									<ul>
										{accordList.map((data, ind)=>(
											<li key={ind}><Link to={"/books-grid-view"}>{data.name}</Link></li>
										))}
									</ul>
								</Collapse>
							</div>
						</div>
					</div>
				</div>				
				<div className="footer-top">
					<div className="container">
						<div className="row">
							<div className="col-xl-3 col-lg-12 wow fadeInUp" data-wow-delay="0.1s">
								<div className="widget widget_about">
									<div className="footer-logo logo-white">
										<Link to={"/"}><img src={logoImage} alt="" /></Link> 
									</div>
									<p className="text">Shelf To Tales is a Book Store Ecommerce Website Template by DexignZone lorem ipsum dolor sit</p>
									<div className="dz-social-icon style-1">
										<ul>
											<li><a href="https://www.facebook.com/dexignzone" target="_blank" rel="noreferrer"><i className="fa-brands fa-facebook-f"></i></a></li>
											<li><a href="https://www.youtube.com/channel/UCGL8V6uxNNMRrk3oZfVct1g" target="_blank" rel="noreferrer"><i className="fa-brands fa-youtube"></i></a></li>
											<li><a href="https://www.linkedin.com/showcase/3686700/admin/" target="_blank" rel="noreferrer"><i className="fa-brands fa-linkedin"></i></a></li>
											<li><a href="https://www.instagram.com/website_templates__/" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i></a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-4 wow fadeInUp" data-wow-delay="0.2s">
								<div className="widget widget_services">
									<h5 className="footer-title">Our Links</h5>
									<ul>
										<li><Link to={"/about-us"}>About us</Link></li>
										<li><Link to={"/contact-us"}>Contact us</Link></li>
										<li><Link to={"/privacy-policy"}>Privacy Policy</Link></li>
										<li><Link to={"/pricing"}>Pricing Table</Link></li>
										<li><Link to={"/faq"}>FAQ</Link></li>
									</ul>
								</div>
							</div>
							<div className="col-xl-2 col-lg-3 col-sm-4 col-4 wow fadeInUp" data-wow-delay="0.3s">
								<div className="widget widget_services">
									<h5 className="footer-title">Shelf To Tales ?</h5>
									<ul>
										<li><Link to={"/"}>Shelf To Tales</Link></li>
										<li><Link to={"/books-detail"}>Book Details</Link></li>
										<li><Link to={"/blog-detail"}>Blog Details</Link></li>
										<li><Link to={"/books-grid-view"}>Shop</Link></li>
									</ul>   
								</div>
							</div>
							<div className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-4 wow fadeInUp" data-wow-delay="0.4s">
								<div className="widget widget_services">
									<h5 className="footer-title">Resources</h5>
									<ul>
										<li><Link to={"/services"}>Download</Link></li>
										<li><Link to={"/help-desk"}>Help Center</Link></li>
										<li><Link to={"/shop-cart"}>Shop Cart</Link></li>
										<li><Link to={"/shop-login"}>Login</Link></li>
										<li><Link to={"/about-us"}>Partner</Link></li>
									</ul>
								</div>
							</div>
							<div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 wow fadeInUp" data-wow-delay="0.5s">
								<div className="widget widget_getintuch">
									<h5 className="footer-title">Get in Touch With Us</h5>
									<ul>
										<li>
											<i className="flaticon-placeholder"></i>
											<span>832  Thompson Drive, San Fransisco CA 94107,US</span>
										</li>
										<li>
											<i className="flaticon-phone"></i>
											<span>+123 345123 556<br/>
											+123 345123 556</span>
										</li>
										<li>
											<i className="flaticon-email"></i> 
											<span>support@Shelf To Tales.id<br/>
											info@Shelf To Tales.id</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					<div className="container">
						<div className="row fb-inner">
							<div className="col-lg-6 col-md-12 text-start"> 
								<p className="copyright-text">Shelf To Tales Book Store Ecommerce Website - © {d.getFullYear()} All Rights Reserved</p>
							</div>
							<div className="col-lg-6 col-md-12 text-end"> 
								<p>Made with <span className="heart"
									onClick={heartToggle}
								></span> by 
								<a href="https://dexignzone.com/" target="_blank" rel="noreferrer"> DexignZone</a></p>
							</div>
						</div>
					</div>
				</div>
			</footer>			
		</>
	)
}
export default Footer;


