import { render } from "react-dom";
import HasuraGraphiQL from "./lib/HasuraGraphiQL";

import "./index.css";

const container = document.getElementById("root");

let defaultUrl =
  new URLSearchParams(window.location.search).get("endpoint") || ""; //test: https://thankful-beetle-75.hasura.app/v1/graphql
let defaultSubscriptionUrl =
  new URLSearchParams(window.location.search).get("subscription-endpoint") ||
  "";
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
    defaultSubscriptionUrl={defaultSubscriptionUrl}
    defaultHeaders={defaultHeaders}
    isCloud
  />,
  container
);
