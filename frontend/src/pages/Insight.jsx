import React, { useRef, useState, useContext } from "react";
import Plot from 'react-plotly.js';
import "./style.less";

// components
import InsightContext from "../contexts/InsightContext";

const Insight = () => {
  const [insights] = useContext(InsightContext);
  var arr = [];
  for (var i = 0; i < 500; i ++) {
    arr[i] = Math.random();
  }

  return (
    
    <div className="container">
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <p className="header">Insights</p>
        <pre>
          {/* {JSON.stringify(insights, null, 4)} */}
        </pre>
        {/* <img src={insights.image}/> */}
        
        <Plot
        data={[
          {type: 'histogram', x: arr}
        ]}
        layout={ {width: 500, height: 500, title: 'A Fancy Plot'} }
      />
    </div>
  );
};

export default Insight;
