// we use JS here instead of TS because of an ongoing issue in @graphiql/toolkit where
// graphql-ws needs to be updated. Types don't match currently and will be addressed when
// https://github.com/graphql/graphiql/pull/2017 is released. For now, we use JS to
// workaround this issue.

import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { createClient } from "graphql-ws";

export default function makeFetcher(
  url,
  subscriptionUrl,
  headers,
  fetch = window.fetch
) {
  return createGraphiQLFetcher({
    url: url,
    headers: headers,
    wsClient: createClient({
      url: subscriptionUrl,
      connectionParams: { headers: headers },
    }),
    fetch: fetch,
  });
}
