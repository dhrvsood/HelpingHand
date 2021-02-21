import React, { useContext, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import { config } from "../../config";
import InsightContext from "../../contexts/InsightContext";
import { useHistory } from "react-router-dom";
import { NONAME } from "dns";

// import "style.less";

const Input = (props) => {
  const canvas = useRef(null);
  const [insights, setInsights] = useState("");
  const [visible, setVisibility] = useState("none");
  // const fileUpload = useRef(null);

  const [insightsCtx, setInsightsCtx] = useContext(InsightContext);
  let imageData;
  const history = useHistory();

  const fileUpload = props.fileUpload;
  // const selectFile = () => {
  //   fileUpload.current.click();
  // };

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
    // file was drawn
    else {
      const can = canvas.current.ctx.drawing.canvas;


      const img = new Image();
      // img.backgroundImage = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.jrotherham.co.uk%2Fwp-content%2Fuploads%2F2019%2F08%2FAtlas-White_Slab.jpg&f=1&nofb=1";
      img.src = can.toDataURL('image/jpeg');
      // img.src = "data:image/jpg;" + can.toDataURL().substring(15);
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
    <div className = "input" id="input_comp" style={{ display: 'none' }}>
      <CanvasDraw
        ref={canvas}
        canvasWidth={'100%'}
        brushRadius={1}
        lazyRadius={1}
        style={{ }}
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
        <button onClick={getImageData}>Judge Me!</button>
      </div>

      <h1 style={{ display: visible }}>Backend Response</h1>
      <pre>{insights}</pre>
    </div>
  );
};

export default Input;
