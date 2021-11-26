import * as React from "react";
import GraphiQL, { GraphiQLProps } from "graphiql";
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
import { IconChevronRight, IconChevronDown, IconCross, IconEye } from "./Icons";
import CustomGraphiQL from "./CustomGraphiQL";
import Spinner from "./Spinner";

import "graphiql/graphiql.css";
import "graphiql-code-exporter/CodeExporter.css";
import "./styles.css";

export default function HasuraGraphiQL({
  defaultUrl = "",
  defaultHeaders = {},
  defaultQuery = "",
  isCloud = false,
  defaultVariables = "",
  hiddenHeaders = ["x-hasura-admin-secret"],
  graphiQLOptions = {},
  explorerOptions = {},
  customToolbar = null,
}: {
  defaultUrl?: string;
  defaultHeaders?: Record<string, string>;
  defaultQuery?: string;
  isCloud?: boolean;
  defaultVariables?: string;
  hiddenHeaders?: string[];
  graphiQLOptions?: Omit<GraphiQLProps, "fetcher">;
  explorerOptions?: Record<string, any>;
  customToolbar?: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(true);
  const [schema, setSchema] = React.useState<GraphQLSchema | undefined>(
    undefined
  );
  const [url, setUrl] = React.useState(defaultUrl);
  const [urlInput, setUrlInput] = React.useState(defaultUrl);
  const [query, setQuery] = React.useState<string | undefined>(defaultQuery);
  const [headers, setHeaders] = React.useState(
    untransformHeaders(defaultHeaders, hiddenHeaders)
  );
  const [headersInput, setHeadersInput] = React.useState(
    untransformHeaders(defaultHeaders, hiddenHeaders)
  );
  const [urlCollapsed, setUrlCollapsed] = React.useState(false);
  const [headersCollapsed, setHeadersCollapsed] = React.useState(false);
  const [relay, setRelay] = React.useState(false);
  const [codeExporterVisible, setCodeExporterVisible] = React.useState(false);
  const [explorerVisible, setExplorerVisible] = React.useState(true);
  const [errorShown, setErrorShown] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [responseTime, setResponseTime] = React.useState<number | null>(null);
  const [responseSize, setResponseSize] = React.useState(0);
  const [explorerWidth, setExplorerWidth] = React.useState(300);
  const [resizing, setResizing] = React.useState(false);

  const updateHeaders = () => {
    if (headersInput !== headers) {
      setSchema(undefined);
      setLoading(true);
      setHeaders(headersInput);
    }
  };

  const graphQLFetcher = makeFetcher(
    url,
    url.replace("http", "ws"),
    transformHeaders(headers),
    async function customFetch(...args) {
      setResponseTime(null);
      let start = Date.now();
      let returnedPromise = fetch(...args);
      let res = await returnedPromise;
      setResponseTime(Date.now() - start);
      let cloned = res.clone();
      setResponseSize(JSON.stringify(await cloned.json()).length * 2);
      return returnedPromise;
    },
    () => {
      setResponseTime(null);
      return null;
    }
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
    if (isCloud)
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
  }, [headers, url, loading]);

  return (
    <div id="hasura-graphiql-wrapper">
      {errorShown && <ErrorNotification />}
      <div className="hasura-graphiql-title-holder">
        {urlCollapsed ? (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setUrlCollapsed(!urlCollapsed)}
          >
            <IconChevronRight />
          </span>
        ) : (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setUrlCollapsed(!urlCollapsed)}
          >
            <IconChevronDown />
          </span>
        )}
        <span
          className="hasura-graphiql-title"
          onClick={() => setUrlCollapsed(!urlCollapsed)}
        >
          GraphQL Endpoint
        </span>
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
              disabled
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
          {customToolbar}
          {isCloud && (
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
            onClick={() => setHeadersCollapsed(!headersCollapsed)}
          >
            <IconChevronRight />
          </span>
        ) : (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setHeadersCollapsed(!headersCollapsed)}
          >
            <IconChevronDown />
          </span>
        )}
        <span
          className="hasura-graphiql-title"
          onClick={() => setHeadersCollapsed(!headersCollapsed)}
        >
          Request Headers
        </span>
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
              <td
                className="hasura-graphiql-table-cell"
                style={{ borderRight: "thin solid rgb(229, 231, 235)" }}
              >
                <input
                  onBlur={updateHeaders}
                  onChange={(e) => {
                    let edited = edited2DArray(
                      headersInput,
                      i,
                      1,
                      e.target.value
                    );
                    edited = edited2DArray(
                      edited,
                      i,
                      3,
                      hiddenHeaders.includes(e.target.value)
                    );
                    setHeadersInput(edited);
                  }}
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
                  type={header[3] ? "password" : "text"}
                  value={header[2]}
                />
              </td>
              <td className="hasura-graphiql-table-cell-cross">
                {hiddenHeaders.includes(header[1]) && (
                  <span
                    style={{ marginRight: "1em" }}
                    onClick={() => {
                      let toggled = !header[3];
                      setHeadersInput(
                        edited2DArray(headersInput, i, 3, toggled)
                      );
                      setHeaders(edited2DArray(headersInput, i, 3, toggled));
                    }}
                  >
                    <IconEye />
                  </span>
                )}
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
                    headersInput.concat([[true, e.target.value, "", false]])
                  );
                  document
                    .querySelector<HTMLElement>(`[data-test=header-key-2]`)
                    ?.blur();
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
                    headersInput.concat([[true, "", e.target.value, false]])
                  );
                  document
                    .querySelector<HTMLElement>(`[data-test=header-value-2]`)
                    ?.blur();
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
        style={{
          height: "100vh",
          border: "thin solid lightgray",
          borderRadius: "3.5px",
        }}
        onMouseMove={(e) => {
          if (resizing) setExplorerWidth(e.clientX - 20);
        }}
      >
        <>
          {loading ? (
            <div data-testid="loader" className="hasura-graphiql-loader">
              <Spinner />
            </div>
          ) : (
            explorerVisible && (
              <>
                <GraphiQLExplorer
                  schema={schema}
                  query={query}
                  onEdit={(q: string) => setQuery(q)}
                  explorerIsOpen={explorerVisible}
                  onToggleExplorer={() => setExplorerVisible(!explorerVisible)}
                  getDefaultScalarArgValue={null}
                  makeDefaultArg={null}
                  width={`${explorerWidth}px`}
                  {...explorerOptions}
                />
                <div
                  className="hasura-graphiql-resizer"
                  onMouseDown={() => {
                    setResizing(true);
                    return false;
                  }}
                  onMouseUp={() => {
                    setResizing(false);
                    return false;
                  }}
                  onDragStart={() => false}
                >
                  <span className="hasura-graphiql-resize-indicator" />
                </div>
              </>
            )
          )}
          <CustomGraphiQL
            graphQLFetcher={graphQLFetcher}
            query={query}
            onEdit={(q: string) => setQuery(q)}
            schema={schema}
            toolbarOpts={{ additionalContent: extraButtons() }}
            variables={defaultVariables}
            graphiQLOptions={graphiQLOptions}
            footer={
              responseTime ? (
                <GraphiQL.Footer>
                  <div className="graphiql-footer">
                    <span className="graphiql-footer-label">Response Time</span>
                    <span className="graphiql-footer-value">
                      {`${responseTime} ms`}
                    </span>
                    <span className="graphiql-footer-label">Response Size</span>
                    <span className="graphiql-footer-value">
                      {`${responseSize} bytes`}
                    </span>
                  </div>
                </GraphiQL.Footer>
              ) : (
                <span />
              )
            }
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
      </div>
    </div>
  );
}
