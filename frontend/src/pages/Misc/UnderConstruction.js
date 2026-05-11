import React from 'react';
import {Link} from 'react-router-dom';

import ucimage from '../../assets/images/background/uc.jpg';
import logo from '../../assets/images/logo.png';

const UnderConstruction = ()=>{
    return(
        <>
            <div className="under-construct">
                <div className="inner-box">
                    <div className="logo-header logo-dark">
                        <Link to={"/"}><img src={logo} alt="" /></Link>
                    </div>	
                    <div className="dz-content">
                        <h2 className="dz-title">Site Is Down <br/>For <span className="text-primary">Maintenance</span></h2>
                        <p>This is the Technical Problems Page.<br /> Or any other page.</p>
                    </div>
                </div>
                <img src={ucimage} className="uc-bg" alt="" />
            </div>
        </>
    )
}
export default UnderConstruction;

