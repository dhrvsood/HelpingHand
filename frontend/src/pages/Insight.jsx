import React, { useRef, useState, useContext } from "react";
import Plot from 'react-plotly.js';
// import "./style.less";

// components
import InsightContext from "../contexts/InsightContext";
import Graph from "../components/Graph";

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
      <div className="grid-container">
        <Graph type="histogram" data={arr} title="Graph 1" className="grid-item"></Graph>
        <Graph type="histogram" data={arr} title="Graph 2" className="grid-item"></Graph>
        <Graph type="histogram" data={arr} title="Graph 3" className="grid-item"></Graph>
        <Graph type="histogram" data={arr} title="Graph 4" className="grid-item"></Graph>
        {/* <Graph type="" data="" title="" className="grid-item"></Graph>
        <Graph type="" data="" title="" className="grid-item"></Graph> */}
      </div>
    </div>
  );
};

export default Insight;
