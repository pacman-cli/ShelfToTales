import React from 'react';
import {Link} from 'react-router-dom';

import blog1 from './../../assets/images/blog/recent-blog/blog1.jpg';
import blog2 from './../../assets/images/blog/recent-blog/blog2.jpg';
import blog3 from './../../assets/images/blog/recent-blog/blog3.jpg';

const postBlog = [
    {image: blog1, title:'The Miracle Of Library In Mind.'},
    {image: blog2, title:'Fall In Love With The Library'},
    {image: blog3, title:'So many books, so little time.'},
    {image: blog1, title:'Omg! The Best Library Ever!'},
];

const BlogSidebar = () =>{
    return(
        <>
            <aside className="side-bar sticky-top mt-lg-0 mt-md-5">
                <div className="widget">
                    <div className="search-bx">
                        <form role="search" method="post">
                            <div className="input-group">
                                <input name="text" className="form-control" placeholder="Search" type="text" />
                                <span className="input-group-btn">
                                    <button type="submit" className="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
                                </span> 
                            </div>
                        </form>
                    </div>
                </div>
                <div className="widget widget_categories">
                    <h4 className="widget-title">Category</h4>
                    <ul>
                        <li className="cat-item cat-item-26"><Link to={"/blog-list-sidebar"}>Audio</Link>(3)</li>   
                        <li className="cat-item cat-item-36"><Link to={"/blog-list-sidebar"}>Beauty</Link>(4)</li>
                        <li className="cat-item cat-item-43"><Link to={"/blog-list-sidebar"}>Fashion</Link>(3)</li>
                        <li className="cat-item cat-item-27"><Link to={"/blog-list-sidebar"}>Images</Link>(1)</li>
                        <li className="cat-item cat-item-40"><Link to={"/blog-list-sidebar"}>Lifestyle</Link>(3)</li> 
                    </ul>
                </div>
                <div className="widget recent-posts-entry">
                    <h4 className="widget-title">Recent Posts</h4>
                    <div className="widget-post-bx">
                        {postBlog.map((data, index)=>(
                            <div className="widget-post clearfix">
                                <div className="dz-media"> 
                                    <Link to={"/blog-detail"}><img src={data.image} alt="" /></Link>
                                </div>
                                <div className="dz-info">
                                    <h6 className="title"><Link to={"/blog-detail"}>{data.title}</Link></h6>
                                    <div className="dz-meta">
                                        <ul>
                                            <li className="post-date"> 7 March, 2022 </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                    </div>
                </div>
                <div className="widget widget_tag_cloud">
                    <h4 className="widget-title">Tags</h4>
                    <div className="tagcloud"> 
                        <Link to="#">Business</Link>
                        <Link to="#">News</Link>
                        <Link to="#">Brand</Link>
                        <Link to="#">Website</Link>
                        <Link to="#">Internal</Link>
                        <Link to="#">Strategy</Link>
                        <Link to="#">Brand</Link>
                        <Link to="#">Mission</Link>
                    </div>
                </div>
            </aside>
        </>
    )
}
export default BlogSidebar;


