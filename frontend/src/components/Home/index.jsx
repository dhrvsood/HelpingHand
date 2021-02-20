import React, { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";

import "./style.less";

const Home = () => {
  const canvas = useRef(null);
  const [imageSrc, setImage] = useState("https://via.placeholder.com/200");
  const [visible, setVisibility] = useState("none");
  
  const getImageData = () => {
    console.log(canvas.current)
    const can = canvas.current.ctx.drawing.canvas;
    const img = new Image();
    img.src = can.toDataURL();
    setImage(img.src)
    setVisibility("block")
  };

  return (
    <div className="container">
      <div className="centerContent">
        <p className="title">your handwriting sucks.com</p>
      </div>

      <div className="centerContent">
        <CanvasDraw ref={canvas} canvasWidth={window.innerWidth * 0.8} />
      </div>
      <div className="centerContent">
        <div className="toolbar">
          <button onClick={() => {
            if (canvas) {
              canvas.current.clear()
            }
          }}>Clear</button>
          <button onClick={() => {}}>Upload a sample instead</button>
          <button onClick={getImageData}>Judge Me</button>
        </div>
      </div>
      
      <h1 style={{display: visible}}>Your Drawing</h1> 
      <img style={{display: visible}} src={imageSrc}></img> 
    </div>
  );
};

export default Home;
