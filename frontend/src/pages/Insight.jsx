import React, { useRef, useState, useContext } from "react";
import "./style.less";

// components
import Header from "../components/Header";
import InsightContext from "../contexts/InsightContext";

const Insight = () => {
  const [insights] = useContext(InsightContext);
  return (
    <div>
        <Header/>
        <pre>
          {JSON.stringify(insights)}
        </pre>
        <img src={insights.image}/>
    </div>
  );
};

export default Insight;
