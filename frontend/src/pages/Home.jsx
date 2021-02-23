import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { config } from "../config";
import { useHistory } from "react-router-dom";
import "./style.less";

// components
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import InsightContext from "../contexts/InsightContext";

const Home = () => {
  const [insights, setInsights] = useContext(InsightContext);
  const canvas = useRef(null);
  // const [insights, setInsights] = useState("");
  const [visible, setVisibility] = useState("none");
  // const fileUpload = useRef(null);

  const [insightsCtx, setInsightsCtx] = useContext(InsightContext);
  let imageData;
  const history = useHistory();
  console.log(insights);
  var fileUpload = useRef(null);


    // HELPER METHOD: convert the drawing
    const toBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };
  
    const getImageData = async () => {
      // if a file was uploaded 
      if (fileUpload.current.files.length > 0) {
        const file = fileUpload.current.files[0];
        imageData = await toBase64(file);
      } 
  
      axios
        .post(`${config.apiUrl}/insight`, {
          data: imageData,
        })
        .then((response) => {
          // pass data to global insights context
          setInsightsCtx({
            responseData: response.data,
            image: imageData
          });
  
          // now navigate to insight page
          history.push('/insight');
        });
      };

  const selectFile = () => {
    fileUpload.current.click();
    getImageData();
  };

  const showCanvas = () => {
    document.getElementById('input_comp').style.display = 'block';
  }

  return (
    <div className="container">
        {/* <Header/> */}
        <p className="header">✍Welcome to  <b>Helping Hand!</b>✍</p>
        <p>We Artifical Intelligence algorithms to analyze your writing and provide qualitative and quantitative feedback on how to improve your handwriting.</p>
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
          <img id="drawing"></img>
        </div>
        <Input fileUpload={fileUpload}/>
        <hr></hr>
        <p>Built in 36 hours at SD Hacks 2021 by Cam, Chris, Ronak, and Dhruv.</p>
    </div>
  );
};

export default Home;
