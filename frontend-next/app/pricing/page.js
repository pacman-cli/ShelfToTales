'use client';

// Force fully-dynamic rendering — page reads localStorage/window at render time.
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

import PageTitle from '../components/layout/PageTitle';
import NewsLetter from '../components/features/NewsLetter';
import { FadeIn } from '../components/common/AnimationUtils';

const pricingCard = [
    {
        title: 'Reader (Free)',
        price: '0',
        description: 'Start your reading journey, manage your bookshelves, and join the reader community.',
        features: [
            'Access to Public Catalog',
            'Up to 3 Custom Bookshelves',
            'Post Book Reviews & Ratings',
            'Join Public Reading Rooms',
            'Participate in Book Exchanges'
        ],
        link: '/shop-registration'
    },
    {
        title: 'Scholar',
        price: '4.99',
        description: 'Enhance your learning with advanced tracking, discounts, and semantic search features.',
        features: [
            'Everything in Reader',
            'Unlimited Custom Bookshelves',
            '5% Discount on Book Purchases',
            'AI Semantic Search Access',
            'Priority Book Exchange Matching',
            'Ad-Free Reading Experience'
        ],
        link: '/shop-registration'
    },
    {
        title: 'Librarian',
        price: '9.99',
        description: 'The ultimate tier for book lovers, offering full AI assistance and custom room tools.',
        features: [
            'Everything in Scholar',
            '15% Discount on Book Purchases',
            'Unlimited AI Chat Support',
            'Personalized AI Discover Feed',
            'Create Private Reading Rooms',
            'Sync Custom Lofi Room Playlists'
        ],
        link: '/shop-registration'
    }
];

function Pricing(){
    return(
        <>
            <div className="page-content">
                <PageTitle childPage="Pricing Table" parentPage="Pages"  /> 
                <FadeIn>
                <section className="content-inner-1 bg-light">
                    <div className="container">
                        <div className="row pricingtable-wraper">
                            {pricingCard.map((data, index)=>(
                                <div className="col-lg-4 col-md-6" key={index}>
                                    <div className="pricingtable-wrapper style-1 m-b30">
                                        <div className="pricingtable-inner">
                                            <div className="pricingtable-title">
                                                <h3 className="title">{data.title}</h3>
                                            </div>
                                            <div className="pricingtable-price"> 
                                                <h2 className="pricingtable-bx">${data.price}<small className="pricingtable-type">/Month</small></h2>
                                            </div>
                                            <p className="text">{data.description}</p>
                                            <ul className="pricingtable-features">
                                                {data.features.map((feature, idx) => (
                                                    <li key={idx}>{feature}</li>
                                                ))}
                                            </ul>
                                            <div className="pricingtable-footer"> 
                                                <Link href={data.link || "/shop-registration"} className="btn btn-primary btnhover3">Start Now <i className="fa fa-angle-right m-l10"></i></Link> 
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>          
                </FadeIn>
                <NewsLetter />


            </div>
        </>
    )
}
export default Pricing;

