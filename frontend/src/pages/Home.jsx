import React, { useContext, useRef, useState } from "react";
import "./style.less";

// components
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import InsightContext from "../contexts/InsightContext";

const Home = () => {
  const [insights, setInsights] = useContext(InsightContext);
  console.log(insights);
  const fileUpload = useRef(null);


  const selectFile = () => {
    fileUpload.current.click();
  };

  const showCanvas = () => {
    document.getElementById('input_comp').style.display = 'block';
  }

  return (
    <div className="container">
        {/* <Header/> */}
        <p className="header">Welcome to  <b>Helping Hand!</b> <span role="img">🖊</span></p>
        <p>We use metrics and Artifical Intelligence to provide quantitative feedback on how to improve your handwriting.</p>
        <h2 className="centerContent">Try it!</h2>
        <div className = "buttonGroup"> 
          <Button onClick={showCanvas} value = "Draw"></Button>
          <Button onClick={selectFile} value = "Upload a sample" src="#input_comp"></Button>
          <input
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            onChange={() => {}}
            ref={fileUpload}
          />
        </div>
        <Input fileUpload={fileUpload}/>
        <hr></hr>
        <p>Built in 36 hours at SD Hacks 2021.</p>
    </div>
  );
};

export default Home;
