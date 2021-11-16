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
import makeFetcher from "./fetcher";
import {
  transformHeaders,
  untransformHeaders,
  edited2DArray,
  toggleCacheDirective,
} from "./utils";
import { IconChevronRight, IconChevronDown, IconCross } from "./Icons";
import getGraphiQL from "./getGraphiQL";

import "graphiql/graphiql.css";
import "graphiql-code-exporter/CodeExporter.css";
import "./styles.css";

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
  const [errorShown, setErrorShown] = React.useState(false);
  const [error, setError] = React.useState(null);

  const updateHeaders = () => {
    if (headersInput !== headers) {
      setSchema(undefined);
      setLoading(true);
      setHeaders(headersInput);
    }
  };

  const graphQLFetcher = makeFetcher(
    url,
    defaultSubscriptionUrl,
    transformHeaders(headers)
  );

  function ErrorNotification() {
    return (
      <div className="hasura-graphiql-notifications-wrapper">
        <div className="hasura-graphiql-notification-tr">
          <div className="hasura-graphiql-notification-inner">
            <h4 className="hasura-graphiql-notification-title">
              Schema Introspection Error
            </h4>
            <div className="hasura-graphiql-notification-message">
              {error ? error : "Error loading schema"}
            </div>
            <span
              className="hasura-graphiql-notification-dismiss"
              onClick={() => setErrorShown(false)}
            >
              ×
            </span>
          </div>
        </div>
      </div>
    );
  }

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
          if (data.errors) setError(data.errors[0].message);
          else setError(null);
          setSchema(buildClientSchema(data.data));
          setLoading(false);
          setErrorShown(false);
        })
        .catch(() => {
          setErrorShown(true);
          setSchema(undefined);
          setLoading(false);
        });
  }, [schema, headers, url, loading]);

  return (
    <div id="hasura-graphiql-wrapper">
      {errorShown && <ErrorNotification />}
      <div className="hasura-graphiql-title-holder">
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
        <span className="hasura-graphiql-title">GraphQL Endpoint</span>
        <div
          style={{
            display: urlCollapsed ? "none" : "flex",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          <div className="hasura-graphiql-endpoint-holder">
            <button type="button" className="hasura-graphiql-post-button">
              POST
            </button>
            <input
              type="text"
              data-testid="endpoint-input"
              className="hasura-graphiql-endpoint-input"
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
              className="hasura-graphiql-relay-holder"
              style={{ display: "none" }}
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
      <div className="hasura-graphiql-title-holder">
        {headersCollapsed ? (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setHeadersCollapsed(false)}
          >
            <IconChevronRight />
          </span>
        ) : (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setHeadersCollapsed(true)}
          >
            <IconChevronDown />
          </span>
        )}
        <span className="hasura-graphiql-title">Request Headers</span>
      </div>
      <table
        className="hasura-graphiql-table"
        style={{
          display: headersCollapsed ? "none" : "",
        }}
      >
        <thead>
          <tr className="hasura-graphiql-table-header-row">
            <th className="hasura-graphiql-table-header-col-1">Enable</th>
            <th className="hasura-graphiql-table-header-col-2">Key</th>
            <th className="hasura-graphiql-table-header-col-2">Value</th>
            <th className="hasura-graphiql-table-header-col-1"></th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "#fff" }}>
          {headersInput.map((header, i) => (
            <tr key={"row" + i}>
              <td style={{ textAlign: "center", backgroundColor: "#fff" }}>
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
                  className="hasura-graphiql-table-checkbox"
                  checked={header[0]}
                />
              </td>
              <td className="hasura-graphiql-table-cell">
                <input
                  onBlur={updateHeaders}
                  onChange={(e) =>
                    setHeadersInput(
                      edited2DArray(headersInput, i, 1, e.target.value)
                    )
                  }
                  className="hasura-graphiql-table-input"
                  placeholder="Enter Key"
                  type="text"
                  data-testid={`row-key-${i}`}
                  value={header[1]}
                />
              </td>
              <td colSpan={1} className="hasura-graphiql-table-cell">
                <input
                  onBlur={updateHeaders}
                  onChange={(e) =>
                    setHeadersInput(
                      edited2DArray(headersInput, i, 2, e.target.value)
                    )
                  }
                  className="hasura-graphiql-table-input"
                  placeholder="Enter Value"
                  data-testid={`row-value-${i}`}
                  type="text"
                  value={header[2]}
                />
              </td>
              <td className="hasura-graphiql-table-cell-cross">
                <i
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
            <td className="hasura-graphiql-table-cell-empty"></td>
            <td className="hasura-graphiql-table-cell-key-entry">
              <input
                className="hasura-graphiql-table-cell-key-entry-input"
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
                        `[data-testid=row-key-${headersInput.length}]`
                      )
                      ?.focus()
                  );
                }}
              />
            </td>
            <td colSpan={2} className="hasura-graphiql-table-cell-value-entry">
              <input
                className="hasura-graphiql-table-cell-value-entry-input"
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
                        `[data-testid=row-value-${headersInput.length}]`
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
        className="graphiql-container"
        style={{ height: "70vh", border: "thin solid lightgray" }}
      >
        <>
          {loading ? (
            <div data-testid="loader" className="hasura-graphiql-loader">
              <div className="hasura-graphiql-spinner" />{" "}
            </div>
          ) : (
            explorerVisible && (
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
            )
          )}
          {getGraphiQL(
            graphQLFetcher,
            query,
            (q: string) => setQuery(q),
            schema,
            { additionalContent: extraButtons() }
          )}
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
      </div>
    </div>
  );
}
