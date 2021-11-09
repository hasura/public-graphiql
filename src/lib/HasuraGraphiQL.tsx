import * as React from "react";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from "graphql";
import CodeExporter from "graphiql-code-exporter";
import snippets from "./snippets";
import { createGraphiQLFetcher } from "@graphiql/toolkit";

import {
  transformHeaders,
  untransformHeaders,
  edited2DArray,
  toggleCacheDirective,
} from "./utils";
import { IconChevronRight, IconChevronDown, IconCross } from "./Icons";

import "graphiql/graphiql.css";
import "graphiql-code-exporter/CodeExporter.css";
import "./styles.css"

export default function HasuraGraphiQL({
  defaultUrl = "",
  defaultSubscriptionUrl = "",
  defaultHeaders = {},
  defaultQuery = "",
}: {
  defaultUrl?: string;
  defaultSubscriptionUrl?: string;
  defaultHeaders?: Record<string, string>;
  defaultQuery?: string;
}) {
  const [loading, setLoading] = React.useState(true);
  const [schema, setSchema] = React.useState<GraphQLSchema | undefined>(
    undefined
  );
  const [url, setUrl] = React.useState(defaultUrl);
  const [urlInput, setUrlInput] = React.useState(defaultUrl);
  const [query, setQuery] = React.useState<string | undefined>(defaultQuery);
  const [headers, setHeaders] = React.useState(
    untransformHeaders(defaultHeaders)
  );
  const [headersInput, setHeadersInput] = React.useState(
    untransformHeaders(defaultHeaders)
  );
  const [urlCollapsed, setUrlCollapsed] = React.useState(false);
  const [headersCollapsed, setHeadersCollapsed] = React.useState(false);
  const [relay, setRelay] = React.useState(false);
  const [codeExporterVisible, setCodeExporterVisible] = React.useState(false);
  const [explorerVisible, setExplorerVisible] = React.useState(true);

  const updateHeaders = () => {
    if (headersInput !== headers) {
      setSchema(undefined);
      setLoading(true);
      setHeaders(headersInput);
    }
  };

  // function graphQLFetcher(graphQLParams: Record<string, any>) {
  //   return fetch(url, {
  //     method: "post",
  //     headers: transformHeaders(headers),
  //     body: JSON.stringify(graphQLParams),
  //     credentials: "omit",
  //   }).then((response) => response.json());
  // }

  const graphQLFetcher = createGraphiQLFetcher({
    url: url,
    subscriptionUrl: defaultSubscriptionUrl,
    headers: transformHeaders(headers),
  });

  const extraButtons = () => {
    const buttons = [
      {
        label: "Explorer",
        title: "Toggle Explorer",
        onClick: () => setExplorerVisible(!explorerVisible),
      },
      {
        label: "Code Exporter",
        title: "Toggle Code Exporter",
        onClick: () => setCodeExporterVisible(!codeExporterVisible),
      },
    ];
    if (url.includes("hasura.app"))
      buttons.push({
        label: "Cache",
        title: "Cache the response of this query",
        onClick: () => setQuery(toggleCacheDirective(query)),
      });
    return buttons.map((b) => {
      return <GraphiQL.Button key={b.label} {...b} />;
    });
  };

  React.useEffect(() => {
    if (loading)
      fetch(url, {
        method: "post",
        headers: transformHeaders(headers),
        body: JSON.stringify({
          query: getIntrospectionQuery(),
        }),
        credentials: "omit",
      })
        .then((res) => res.json())
        .then((data) => {
          setSchema(buildClientSchema(data.data));
          setLoading(false);
        })
        .catch(() => {
          setSchema(undefined);
          setLoading(false);
        });
  }, [schema, headers, url, loading]);

  return (
    <div id="wrapper" className="h-56 m-5">
      <div>
        {urlCollapsed ? (
          <span
            className=" cursor-pointer"
            onClick={() => setUrlCollapsed(false)}
          >
            <IconChevronRight />
          </span>
        ) : (
          <span
            className=" cursor-pointer"
            onClick={() => setUrlCollapsed(true)}
          >
            <IconChevronDown />
          </span>
        )}
        <span className="font-semibold">GraphQL Endpoint</span>
        <div
          className="flex mb-md"
          style={{ display: urlCollapsed ? "none" : "" }}
        >
          <div className="flex items-center" style={{ width: "90%" }}>
            <button
              type="button"
              className="inline-flex cursor-default h-input font-semibold items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50"
            >
              POST
            </button>
            <input
              type="text"
              data-testid="endpoint-input"
              className="flex-1 min-w-0 block w-full px-3 py-2 h-input rounded-r border-gray-300"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={() => {
                if (urlInput !== url) {
                  setUrl(urlInput);
                  setSchema(undefined);
                  setLoading(true);
                }
              }}
            />
          </div>
          {url.includes("hasura.app") && (
            <div
              data-testid="pg-relay-input"
              className="flex items-center ml-md cursor-pointer switch"
            >
              <input
                id="relay-checkbox"
                type="checkbox"
                checked={relay}
                onChange={() => {
                  if (url.includes("relay")) {
                    setUrl(url.replace("v1beta1/relay", "v1/graphql"));
                    setUrlInput(
                      urlInput.replace("v1beta1/relay", "v1/graphql")
                    );
                  } else {
                    setUrl(url.replace("v1/graphql", "v1beta1/relay"));
                    setUrlInput(
                      urlInput.replace("v1/graphql", "v1beta1/relay")
                    );
                  }
                  setRelay(!relay);
                  setLoading(true);
                }}
              />
              <label htmlFor="relay-checkbox" className="whitespace-nowrap">
                Relay API
              </label>
              <i
                className="fa fa-info-circle _3akQktkNbOKJYjOXUGpLjV "
                aria-hidden="true"
              ></i>
            </div>
          )}
        </div>
      </div>
      {headersCollapsed ? (
        <span
          className=" cursor-pointer"
          onClick={() => setHeadersCollapsed(false)}
        >
          <IconChevronRight />
        </span>
      ) : (
        <span
          className=" cursor-pointer"
          onClick={() => setHeadersCollapsed(true)}
        >
          <IconChevronDown />
        </span>
      )}
      <span className="font-semibold">Request Headers</span>
      <table
        className="min-w-full divide-y divide-gray-200 border-gray-200"
        style={{
          border: "thin solid lightgray",
          marginBottom: "32px",
          display: headersCollapsed ? "none" : "",
        }}
      >
        <thead>
          <tr className="bg-gray-50">
            <th className="w-16 px-md py-sm max-w-xs text-left text-sm font-semibold bg-gray-50 text-gray-600 uppercase tracking-wider _1NXnbTadkGQC-q_XzwmBGI">
              Enable
            </th>
            <th className="px-md py-sm max-w-xs text-left text-sm font-semibold bg-gray-50 text-gray-600 uppercase tracking-wider">
              Key
            </th>
            <th className="px-md py-sm max-w-xs text-left text-sm font-semibold bg-gray-50 text-gray-600 uppercase tracking-wider">
              Value
            </th>
            <th className="w-16 px-md py-sm max-w-xs text-left text-sm font-semibold bg-gray-50 text-gray-600 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {headersInput.map((header, i) => (
            <tr key={"row" + i}>
              <td className="text-center">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setHeadersInput(
                      edited2DArray(headersInput, i, 0, e.target.checked)
                    );
                    setHeaders(
                      edited2DArray(headersInput, i, 0, e.target.checked)
                    );
                    setLoading(true);
                  }}
                  className="mr-1 border-gray-400 rounded outline-none focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-yellow-400"
                  checked={header[0]}
                />
              </td>
              <td className="border-r border-gray-200">
                <input
                  onBlur={updateHeaders}
                  onChange={(e) =>
                    setHeadersInput(
                      edited2DArray(headersInput, i, 1, e.target.value)
                    )
                  }
                  className="w-full border-0 outline-none focus:ring-0 focus:outline-none"
                  placeholder="Enter Key"
                  type="text"
                  data-testid={`row-key-${i}`}
                  value={header[1]}
                />
              </td>
              <td colSpan={1} className="">
                <input
                  onBlur={updateHeaders}
                  onChange={(e) =>
                    setHeadersInput(
                      edited2DArray(headersInput, i, 2, e.target.value)
                    )
                  }
                  className="w-full border-0 focus:ring-0 focus:outline-none"
                  placeholder="Enter Value"
                  data-testid={`row-value-${i}`}
                  type="text"
                  value={header[2]}
                />
              </td>
              <td className="text-right">
                <i
                  className="cursor-pointer mr-md fa fa-times"
                  onClick={() => {
                    let result = headersInput.slice();
                    result.splice(i, 1);
                    setHeadersInput(result);
                    setHeaders(result);
                    setLoading(true);
                  }}
                >
                  <IconCross />
                </i>
              </td>
            </tr>
          ))}
          <tr>
            <td className="border-t border-gray-200"></td>
            <td className="border-r border-t border-gray-200">
              <input
                className="w-full border-0 outline-none focus:ring-0 focus:outline-none"
                data-header-id="2"
                placeholder="Enter Key"
                data-element-name="key"
                type="text"
                data-test="header-key-2"
                value=""
                onChange={(e) => {
                  setHeadersInput(
                    headersInput.concat([[true, e.target.value, ""]])
                  );
                  setTimeout(() =>
                    document
                      .querySelector<HTMLElement>(
                        `[data-test-id=row-key-${headersInput.length}]`
                      )
                      ?.focus()
                  );
                }}
              />
            </td>
            <td colSpan={2} className="border-t border-gray-200">
              <input
                className="w-full border-0 focus:ring-0 focus:outline-none"
                data-header-id="2"
                placeholder="Enter Value"
                data-element-name="value"
                data-test="header-value-2"
                type="text"
                value=""
                onChange={(e) => {
                  setHeadersInput(
                    headersInput.concat([[true, "", e.target.value]])
                  );
                  setTimeout(() =>
                    document
                      .querySelector<HTMLElement>(
                        `[data-test-id=row-value-${headersInput.length}]`
                      )
                      ?.focus()
                  );
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div
        className="w-full flex items-stretch graphiql-container"
        style={{ height: "430px", border: "thin solid lightgray" }}
      >
        {loading ? (
          <div data-testid="loader" className="skeleton-box h-72 min-h-full bg-gray-50 w-72 min-w-full flex items-stretch justify-items-stretch" />
        ) : (
          <>
            {explorerVisible && (
              <GraphiQLExplorer
                schema={schema}
                query={query}
                onEdit={(q: string) => setQuery(q)}
                explorerIsOpen={explorerVisible}
                onToggleExplorer={() => setExplorerVisible(!explorerVisible)}
                getDefaultScalarArgValue={null}
                makeDefaultArg={null}
                width="300px"
              />
            )}
            <GraphiQL
              fetcher={graphQLFetcher}
              query={query}
              onEditQuery={(q) => setQuery(q)}
              schema={schema}
              toolbar={{ additionalContent: extraButtons() }}
            />
            {codeExporterVisible && (
              <CodeExporter
                hideCodeExporter={() => setCodeExporterVisible(false)}
                snippets={snippets}
                serverUrl={url}
                headers={{}}
                query={query}
                codeMirrorTheme="default"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
