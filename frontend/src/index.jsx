import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

import "./styles/style.less";

import Home from "./pages/Home";
import Insight from "./pages/Insight";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/insight" component={Insight} />
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
