import React, { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import { config } from "../../config";
import "./style.less";

const Home = () => {
  const canvas = useRef(null);
  const [insights, setInsights] = useState("");
  const [visible, setVisibility] = useState("none");
  const fileUpload = useRef(null);

  const selectFile = () => {
    fileUpload.current.click();
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const getImageData = async () => {
    let imageData;

    if (fileUpload.current.files.length > 0) {
      const file = fileUpload.current.files[0];
      imageData = await toBase64(file);
    } else {
      const can = canvas.current.ctx.drawing.canvas;
      const img = new Image();
      img.src = can.toDataURL();
      imageData = img.src;
    }

    axios
      .post(`${config.apiUrl}/insight`, {
        data: imageData,
      })
      .then((response) => {
        console.log(response.data);
        setInsights(JSON.stringify(response.data, null, 4));
        setVisibility("block");
      });
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
          <button
            onClick={() => {
              if (canvas) {
                canvas.current.clear();
              }
            }}
          >
            Clear
          </button>
          <button onClick={selectFile}>Upload a sample instead</button>
          <input
            style={{ display: "none" }}
            type="file"
            onChange={() => {}}
            ref={fileUpload}
          />
          <button onClick={getImageData}>Judge Me</button>
        </div>
      </div>

      <h1 style={{ display: visible }}>Backend Response</h1>
      <pre>{insights}</pre>
    </div>
  );
};

export default Home;
