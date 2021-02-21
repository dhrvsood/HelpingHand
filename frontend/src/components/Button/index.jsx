import React, { useRef, useState } from "react";
import style from "./style.less"

const Button = (props) => {
  return (
    <div>
        <button onClick={props.onClick}>{props.value}</button>
    </div>
  );
};

export default Button;
