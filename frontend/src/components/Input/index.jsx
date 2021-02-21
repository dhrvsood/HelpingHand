import React, { useContext, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import { config } from "../../config";
import InsightContext from "../../contexts/InsightContext";
import { useHistory } from "react-router-dom";

// import "style.less";

const Input = () => {
  const canvas = useRef(null);
  const [insights, setInsights] = useState("");
  const [visible, setVisibility] = useState("none");
  const fileUpload = useRef(null);
  const [insightsCtx, setInsightsCtx] = useContext(InsightContext);
  let imageData;
  const history = useHistory();


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
        // pass data to global insights context
        setInsightsCtx({
          responseData: response.data,
          image: imageData
        });

        // now navigate to insight page
        history.push("/insight");
      });
  };

  return (
    <div>
      <CanvasDraw
        ref={canvas}
        canvasWidth={window.innerWidth * 0.8}
        brushRadius={1}
        lazyRadius={1}
      />
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

      <h1 style={{ display: visible }}>Backend Response</h1>
      <pre>{insights}</pre>
    </div>
  );
};

export default Input;
