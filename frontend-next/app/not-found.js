'use client';

// Force fully-dynamic rendering — page reads localStorage/window at render time.
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
const bg3 = '/assets/images/background/bg3.jpg';
const ErrorPage = ()=>{
    return(
        <>
            <div className="error-page overlay-secondary-dark" style={{backgroundImage: 'url('+ bg3 +')'}}>
                <div className="error-inner text-center">
                    <div className="dz_error" data-text="404">404</div>
                    <h2 className="error-head">We are sorry. But the page you are looking for cannot be found.</h2>
                    <Link href={"/"} className="btn btn-primary btn-border btnhover white-border">BACK TO HOMEPAGE</Link>
                </div>
            </div>
        </>
    )
}
export default ErrorPage;

