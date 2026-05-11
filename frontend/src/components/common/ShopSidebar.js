import React from 'react';
import {Link} from 'react-router-dom';
import {Accordion} from 'react-bootstrap';

import SlideDragable from './SlideDragable';

const selectYear = [
    { year: 2022, year2: 2011},
    { year: 2021, year2: 2010},
    { year: 2020, year2: 2009},
    { year: 2019, year2: 2008},
    { year: 2018, year2: 2007},
    { year: 2017, year2: 2006},
    { year: 2016, year2: 2005},
    { year: 2015, year2: 2004},
    { year: 2014, year2: 2003},
    { year: 2013, year2: 2002},
    { year: 2012, year2: 2001},
];

const categoryBlog1 = [
    {name:'Action'     , name2:'Fantasy' },
    {name:'Advanture'  , name2:'History' },
    {name:'Animation'  , name2:'Horror'  },
    {name:'Biography'  , name2:'Mystery' },
    {name:'Comedy'     , name2:'Romance' },
    {name:'Crime'      , name2:'Sci-fi'  },
    {name:'Documentary', name2:'Sport'   },
    {name:'Design'     , name2:'Science' },
];
const publishBlog = [
    {title:'Action'},
    {title:'Advanture'},
    {title:'Animation'},
    {title:'Biography'},
    {title:'Comedy'},
    {title:'Crime'},
    {title:'Documentary'},
];
const accordionBlog2 = [
    {title:'Best Sales (105)'},
    {title:'Most Commented (21)'},
    {title:'Newest Books (32)'},
    {title:'Featured (129)'},
    {title:'Watch History (23)'},
    {title:'Best Books (44)'},
];

const ShopSidebar = () =>{
    return(
        <>
            <div className="shop-filter">
                <div className="d-flex justify-content-between">
                    <h4 className="title">Filter Option</h4>
                    <Link to={"#"} className="panel-close-btn"><i className="flaticon-close"></i></Link>
                </div>
                <Accordion className="accordion-filter" defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            Price Range
                        </Accordion.Header>
                        <Accordion.Body >
                            <div className="range-slider style-1">
                                <div id="slider-tooltips">
								    <SlideDragable />
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item  eventKey="1">
                        <Accordion.Header >
                            Shop by Category
                        </Accordion.Header>
                        <Accordion.Body >
                            <div className="widget dz-widget_services d-flex justify-content-between">
                                <div className="">
                                    {categoryBlog1.map((item,ind)=>(
                                        <div className="form-check search-content" key={ind}>
                                            <input className="form-check-input" type="checkbox" value="" id={`shopcategoryCheckBox-${ind+11}`} />
                                            <label className="form-check-label" htmlFor={`shopcategoryCheckBox-${ind+11}`}>
                                                {item.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="">
                                    {categoryBlog1.map((item,ind)=>(
                                        <div className="form-check search-content" key={ind}>
                                            <input className="form-check-input" type="checkbox" value="" id={`shopcategoryCheckBox-${ind+28}`} />
                                            <label className="form-check-label" htmlFor={`shopcategoryCheckBox-${ind+28}`}>
                                                {item.name2}
                                            </label>
                                        </div>
                                    ))}                                    
                                </div>
                            </div>    
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Choose Publisher</Accordion.Header>
                        <Accordion.Body >
                            <div className="widget dz-widget_services">
                                {publishBlog.map((data,ind)=>(
                                    <div className="form-check search-content" key={ind}>
                                        <input className="form-check-input" type="checkbox" value="" id={`publisherCheckBox-${ind+38}`} />
                                        <label className="form-check-label" htmlFor={`publisherCheckBox-${ind+38}`}>
                                            {data.title}
                                        </label>
                                    </div>
                                ))} 
                                
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Select Year</Accordion.Header>
                        <Accordion.Body >
                            <div className="widget dz-widget_services col d-flex justify-content-between">
                                <div className="">
                                    {selectYear.map((item,ind)=>(
                                        <div className="form-check search-content" key={ind}>
                                            <input className="form-check-input" type="checkbox" value="" id={`productCheckBox${ind+22}`} />
                                            <label className="form-check-label" htmlFor={`productCheckBox${ind+22}`}>
                                                {item.year}
                                            </label>
                                        </div>
                                    ))} 
                                
                                </div>
                                <div className="">
                                    {selectYear.map((item,ind)=>(
                                        <div className="form-check search-content" key={ind}>
                                            <input className="form-check-input" type="checkbox" value="" id={`productCheckBox${ind+33}`} /> 
                                            <label className="form-check-label" htmlFor={`productCheckBox${ind+33}`}>
                                                {item.year2}
                                            </label>
                                        </div>
                                    ))}                                                        
                                </div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>                                     
                <Accordion className="accordion-filter accordion-inner" defaultActiveKey="0">
                    {accordionBlog2.map((data, index)=>(
                        <Accordion.Item eventKey={`${index}`}>
                            <Accordion.Header>{data.title}</Accordion.Header>
                            <Accordion.Body>
                                 <ul>
                                    <li><Link to={"#"}>Alone Here</Link></li>
                                    <li><Link to={"#"}>Alien Invassion</Link></li>
                                    <li><Link to={"#"}>Bullo The Cat</Link></li>
                                    <li><Link to={"#"}>Cut That Hair!</Link></li>
                                    <li><Link to={"#"}>Dragon Of The King</Link></li>
                                </ul>              
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>

                <div className="row filter-buttons">
                    <div>
                        <Link to={"#"} className="btn btn-secondary btnhover mt-4 d-block">Refine Search</Link>
                        <Link to={"#"} className="btn btn-outline-secondary btnhover mt-3 d-block">Reset Filter</Link>
                    </div>
                </div>
            </div>
            
        </>
    )
}
export default ShopSidebar;


