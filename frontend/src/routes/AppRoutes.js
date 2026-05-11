import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import ScrollToTop2 from "react-scroll-to-top";

//layouts
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';

//Pages
import Home from '../pages/Home/Home';
import Home2 from '../pages/Home/Home2';
import AboutUs from '../pages/Company/AboutUs';
import MyProfile from '../pages/Auth/MyProfile';
import Services from '../pages/Company/Services';
import Faq from '../pages/Company/Faq';
import HelpDesk from '../pages/Company/HelpDesk';
import Pricing from '../pages/Company/Pricing';
import PrivacyPolicy from '../pages/Company/PrivacyPolicy';
import BooksGridView from '../pages/Books/BooksGridView';
import ShopList from '../pages/Shop/ShopList';
import BooksGridViewSidebar from '../pages/Books/BooksGridViewSidebar';
import BooksListViewSidebar from '../pages/Books/BooksListViewSidebar';
import ShopCart from '../pages/Shop/ShopCart';
import Wishlist from '../pages/Shop/Wishlist';
import Login from '../pages/Auth/Login';
import Registration from '../pages/Auth/Registration';
import ShopCheckout from '../pages/Shop/ShopCheckout';
import ShopDetail from '../pages/Shop/ShopDetail';
import BlogGrid from '../pages/Blog/BlogGrid';
import BlogLargeSidebar from '../pages/Blog/BlogLargeSidebar';
import BlogListSidebar from '../pages/Blog/BlogListSidebar';
import BlogDetail from '../pages/Blog/BlogDetail';
import ContactUs from '../pages/Company/ContactUs';
import ProductComparison from '../pages/Shop/ProductComparison';
import OrderDetail from '../pages/Order/OrderDetail';
import BlogManagement from '../pages/Blog/BlogManagement';

import ErrorPage from '../pages/Misc/ErrorPage';
import UnderConstruction from '../pages/Misc/UnderConstruction';
import ComingSoon from '../pages/Misc/ComingSoon';
import Dashboard from '../pages/Dashboard/Dashboard';
import PurchaseHistory from '../pages/Order/PurchaseHistory';
import VirtualBookshelf from '../pages/Bookshelf/VirtualBookshelf';
import FlipbookReader from '../pages/Bookshelf/FlipbookReader';


//images
import logo from '../assets/images/logo.png';

function AppRoutes(props){	
	return(
		<BrowserRouter basename="/">			
			<Routes>
				<Route path='/error-404' element={<ErrorPage/>} />
				<Route path='/under-construction' element={<UnderConstruction/>} />
				<Route path='/coming-soon' element={<ComingSoon/>} />
				<Route path='/index-2' element={<Home2/>} />
				<Route  element={<MainLayout />} > 
					<Route path='/' exact element={<Home />} />									
					<Route path='/about-us' exact element={<AboutUs/>} />
					<Route path='/my-profile' exact element={<MyProfile/>} />
					<Route path='/services' exact element={<Services/>} />
					<Route path='/faq' exact element={<Faq/>} />
					<Route path='/help-desk' exact element={<HelpDesk/>} />
					<Route path='/pricing' exact element={<Pricing/>} />
					<Route path='/privacy-policy' exact element={<PrivacyPolicy/>} />
					<Route path='/books-grid-view' exact element={<BooksGridView/>} />
					<Route path='/books-list' exact element={<ShopList/>} />
					<Route path='/shop-list' exact element={<ShopList/>} />
					<Route path='/books-grid-view-sidebar' exact element={<BooksGridViewSidebar/>} />
					<Route path='/books-list-view-sidebar' exact element={<BooksListViewSidebar/>} />
					<Route path='/shop-cart' exact element={<ShopCart/>} />
					<Route path='/wishlist' exact element={<Wishlist/>} />
					<Route path='/shop-login' exact element={<Login/>} />
					<Route path='/shop-registration' exact element={<Registration/>} />
					<Route path='/shop-checkout' exact element={<ShopCheckout/>} />
					<Route path='/shop-detail/:id' exact element={<ShopDetail/>} />
					<Route path='/books-detail/:id' exact element={<ShopDetail/>} />
					<Route path='/blog-grid' exact element={<BlogGrid/>} />
					<Route path='/blog-large-sidebar' exact element={<BlogLargeSidebar/>} />
					<Route path='/blog-list-sidebar' exact element={<BlogListSidebar/>} />
					<Route path='/blog-detail' exact element={<BlogDetail/>} />
					<Route path='/dashboard' exact element={<Dashboard/>} />
					<Route path='/purchase-history' exact element={<PurchaseHistory/>} />
					<Route path='/virtual-bookshelf' exact element={<VirtualBookshelf/>} />
					<Route path='/read-book/:bookId' exact element={<FlipbookReader/>} />
					<Route path='/product-comparison' exact element={<ProductComparison/>} />
					<Route path='/order-detail/:id' exact element={<OrderDetail/>} />
					<Route path='/blog-management' exact element={<BlogManagement/>} />
					<Route path='/contact-us' exact element={<ContactUs/>} />
				</Route> 
			</Routes>									
			<ScrollToTop />
			<ScrollToTop2 className="styles_scroll-to-top__2A70v  fas fa-arrow-up scroltop" smooth />						
		</BrowserRouter>			
	)
} 

function MainLayout(){
	
	return (
		<div className="page-wraper">			
			<Header />
			<Outlet />                
			<Footer  footerChange="style-1" logoImage={logo}/>
	  </div>
	)
  
  };
export default AppRoutes;

