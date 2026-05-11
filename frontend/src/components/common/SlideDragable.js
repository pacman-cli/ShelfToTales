import React,{useEffect} from 'react';
import noUiSlider from "nouislider";
//import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

let slider, slider2;

function destroyExistingSlider(){
  if(slider && slider.noUiSlider){
    slider.noUiSlider.destroy();
  }
}

const SlideDragable = () => {
   useEffect(()=>{
      destroyExistingSlider();
      slider = document.getElementById('W3NoUISlider');
      noUiSlider.create(slider, {
         
         tooltips:true,
          start: [40, 80],
          connect: true,
          behaviour : "tap",
          range: {
              'min': 0,
              'max': 100
          }
      });
   },)
      return (
         <div className="slider" id="SlideDragable">
            <div id="W3NoUISlider"></div>            
         </div>
      );
   
}

export default SlideDragable;



