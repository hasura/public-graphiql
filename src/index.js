import * as React from "react";
import { render } from "react-dom";
import HasuraGraphiQL from "./component/HasuraGraphiQL";

import "./styles.css";

const container = document.getElementById("root");

render(<HasuraGraphiQL />, container);
