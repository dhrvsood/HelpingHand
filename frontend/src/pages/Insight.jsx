import React, { useRef, useState, useContext } from "react";
import "./style.less";

// components
import InsightContext from "../contexts/InsightContext";

const Insight = () => {
  const [insights] = useContext(InsightContext);
  return (
    <div className="container">
        <p className="header">Insights</p>
        <pre>
          {JSON.stringify(insights, null, 4)}
        </pre>
        <img src={insights.image}/>
    </div>
  );
};

export default Insight;
