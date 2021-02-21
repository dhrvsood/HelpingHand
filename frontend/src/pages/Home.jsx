import React, { useRef, useState } from "react";
import "./style.less";

// components
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";

const Home = () => {
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
