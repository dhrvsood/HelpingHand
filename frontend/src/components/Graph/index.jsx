import React, { useRef, useState } from "react";
import Plot from 'react-plotly.js';
// import "./style.less";

const Graph = (props) => {
    return(
        <div className="grid-item">
            <Plot
        data={[{type: props.type, x: props.data}
        ]}
        layout={ {width: 300, height: 300, title: props.title} }
      />
        </div>
    );
};

export default Graph;