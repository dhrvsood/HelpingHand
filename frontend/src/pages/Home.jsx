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
  return (
    <div className="container">
        <Header/>
        <Button value = "Draw"></Button>
        <Button value = "Upload a sample"></Button>
        <Input/>
    </div>
  );
};

export default Home;
