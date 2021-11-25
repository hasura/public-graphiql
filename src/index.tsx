import { render } from "react-dom";
import HasuraGraphiQL from "./lib/HasuraGraphiQL";

import "./index.css";

const container = document.getElementById("root");

let defaultUrl =
  new URLSearchParams(window.location.search).get("endpoint") || "";
let headersFromParams = Object.fromEntries(
  new URLSearchParams(window.location.search)
    .getAll("header")
    .map((e) => e.split(":"))
);

let defaultHeaders = Object.keys(headersFromParams).length
  ? headersFromParams
  : {};

render(
  <HasuraGraphiQL
    defaultUrl={defaultUrl}
    defaultHeaders={defaultHeaders}
    isCloud
  />,
  container
);
