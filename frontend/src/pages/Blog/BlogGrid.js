import React from 'react';
import {Link} from 'react-router-dom';

import blog1 from '../../assets/images/blog/large/blog1.jpg';
import blog2 from '../../assets/images/blog/large/blog2.jpg';
import blog3 from '../../assets/images/blog/large/blog3.jpg';
import blog4 from '../../assets/images/blog/large/blog4.jpg';

const blogData = [
    {image: blog2, title:'The library is inhabited by spirits that come out of the pages.'},
    {image: blog1, title:'The 5 Secrets About Library Only A Handful Of People Know.'},
    {image: blog3, title:"Most Effective Ways To Overcome Library's Problem."},
    {image: blog4, title:'You Should Experience Library At Least Once In Lifetime'},
];

const BlogGrid = () =>{
    return(
        <>
            <div className="page-content">
                <section className="content-inner-1 bg-img-fix">
                    <div className="container">
                        <div className="row">
                            {blogData.map((item , ind)=>(
                                <div className="col-xl-6 col-lg-6" key={ind}>
                                    <div className="dz-blog style-1 bg-white m-b30">
                                        <div className="dz-media dz-img-effect zoom">
                                            <img src={item.image} alt="" />
                                        </div>
                                        <div className="dz-info">
                                            <h4 className="dz-title">
                                                <Link to={"/blog-details"}>{item.title}</Link>
                                            </h4>
                                            <p className="m-b0">Sed auctor magna lacus, in placerat nisl sollicitudin ut. Morbi feugiat ante velit, eget convallis arcu iaculis vel. Fusce in rhoncus quam. Integer dolor arcu, ullamcorper sed auctor.</p>
                                            <div className="dz-meta meta-bottom">
                                                <ul className="border-0 pt-0">
                                                    <li className="post-date"><i className="far fa-calendar fa-fw m-r10"></i>7 March, 2022</li>
                                                    <li className="post-author"><i className="far fa-user fa-fw m-r10"></i>By <Link to={"#"}> Johne Doe</Link></li>
                                                    <li className="post-comment"><Link to={"#"}><i className="far fa-comment-alt fa-fw"></i><span>15</span></Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                            ))}
                        </div>
                        <nav aria-label="Blog Pagination">
                            <ul className="pagination text-center style-1 p-t20">
                                <li className="page-item"><Link to={"#"} className="page-link prev">Prev</Link></li>
                                <li className="page-item"><Link to={"#"} className="page-link active">1</Link></li>
                                <li className="page-item"><Link to={"#"} className="page-link">2</Link></li>
                                <li className="page-item"><Link to={"#"} className="page-link">3</Link></li>
                                <li className="page-item"><Link to={"#"} className="page-link next">Next</Link></li>
                            </ul>
                        </nav>   
                    </div>    
                </section>    
            </div>
        </>
    )
}
export default BlogGrid;

