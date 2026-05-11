import React from 'react';
import {Link} from 'react-router-dom';

import bg3 from './../../assets/images/background/bg3.jpg';

const PageTitle = ({parentPage, childPage})=>{
    return(
        <>
            <div className="dz-bnr-inr overlay-secondary-dark dz-bnr-inr-sm" style={{backgroundImage: 'url('+ bg3 +')'}}>
                <div className="container">
                    <div className="dz-bnr-inr-entry">
                        <h1>{childPage}</h1>
                        <nav aria-label="breadcrumb" className="breadcrumb-row">
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={"/"}>{parentPage}</Link></li>
                                <li className="breadcrumb-item">{childPage}</li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
}
export default PageTitle;


