import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

import "./styles/style.less";

import Home from "./components/Home";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
