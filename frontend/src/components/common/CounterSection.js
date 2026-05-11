import React from 'react';
import CountUp from 'react-countup';

const counterBlog = [
	{iconClass:'fa-users', number:'125663', title:'Happy Customers'},
	{iconClass:'fa-book', number:'50672', title:'Book Collections'},
	{iconClass:'fa-store', number:'1562', title:'Our Stores'},
	{iconClass:'fa-leaf', number:'457', title:'Famous Writers'},
];


const CounterSection = () =>{
    return(
        <>
            {counterBlog.map((data, i)=>(
                <div className="col-lg-3 col-md-6 col-sm-6 col-6" key={i} >
                    <div className="icon-bx-wraper style-2 m-b30 text-center">
                        <div className="icon-bx-lg">
                            <i className={`fa-solid icon-cell ${data.iconClass}`}></i>
                        </div>
                        <div className="icon-content">
                            <h2 className="dz-title counter m-b0"> <CountUp end={data.number} separator=","  duration={3}/></h2>
                            <p className="font-20">{data.title}</p>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
export default CounterSection;


