import React, { useRef, useState, useContext } from "react";
import Plot from 'react-plotly.js';
import "./style.less";

// components
import InsightContext from "../contexts/InsightContext";

const Insight = () => {
  const [insights] = useContext(InsightContext);

  return (
               
    <div className="container">
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <p className="header">Insights</p>
        <pre>
          {JSON.stringify(insights)}
        </pre>
        <img src={insights.image}/>
        <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
        ]}
        layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
      />
    </div>
  );
};

export default Insight;
