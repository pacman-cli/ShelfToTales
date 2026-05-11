import React from 'react';
import {Link} from 'react-router-dom';

import bg3 from '../../assets/images/background/bg3.jpg';

const ErrorPage = ()=>{
    return(
        <>
            <div className="error-page overlay-secondary-dark" style={{backgroundImage: 'url('+ bg3 +')'}}>
                <div className="error-inner text-center">
                    <div className="dz_error" data-text="404">404</div>
                    <h2 className="error-head">We are sorry. But the page you are looking for cannot be found.</h2>
                    <Link to={"/"} className="btn btn-primary btn-border btnhover white-border">BACK TO HOMEPAGE</Link>
                </div>
            </div>
        </>
    )
}
export default ErrorPage;

