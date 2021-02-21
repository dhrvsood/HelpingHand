import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

import "./styles/style.less";

import Home from "./pages/Home";
import Insight from "./pages/Insight";
import InsightContext, { defaultValue } from "./contexts/InsightContext";

const App = () => {
  const data = useState(defaultValue);

  return (
    <InsightContext.Provider value={data}>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/insight" component={Insight} />
        </Switch>
      </Router>
    </InsightContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
