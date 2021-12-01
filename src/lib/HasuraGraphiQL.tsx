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
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { createClient } from "graphql-ws";
import {
  transformHeaders,
  untransformHeaders,
  edited2DArray,
  toggleCacheDirective,
} from "./utils";
import { IconCross, IconEye, IconInfoCircle, IconCheckCircle } from "./Icons";
import Spinner from "./Spinner";

import "graphiql/graphiql.css";
import "graphiql-code-exporter/CodeExporter.css";
import "./styles.css";
import Collapsible from "./Collapsible";
import ErrorNotification from "./ErrorNotification";

export default function HasuraGraphiQL({
  url,
  defaultHeaders = {},
  defaultQuery = "",
  isCloud = false,
  defaultVariables = "",
  hiddenHeaders = ["x-hasura-admin-secret"],
  graphiQLOptions = {},
  explorerOptions = {},
  customToolbar = null,
}: {
  url: string;
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
  const [schema, setSchema] = React.useState<GraphQLSchema | null>(null);
  const [query, setQuery] = React.useState<string | undefined>(defaultQuery);
  const [headers, setHeaders] = React.useState(
    untransformHeaders(defaultHeaders, hiddenHeaders)
  );
  const [headersInput, setHeadersInput] = React.useState(
    untransformHeaders(defaultHeaders, hiddenHeaders)
  );
  const [codeExporterVisible, setCodeExporterVisible] = React.useState(false);
  const [explorerVisible, setExplorerVisible] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [responseTime, setResponseTime] = React.useState<number | null>(null);
  const [responseSize, setResponseSize] = React.useState(0);
  const [explorerWidth, setExplorerWidth] = React.useState(300);
  const [resizing, setResizing] = React.useState(false);
  const [isCached, setIsCached] = React.useState(false);

  const updateHeaders = () => {
    if (headersInput !== headers) {
      setSchema(null);
      setLoading(true);
      setHeaders(headersInput);
    }
  };

  const graphQLFetcher = createGraphiQLFetcher({
    url: url,
    headers: transformHeaders(headers),
    wsClient: createClient({
      url: url.replace("http", "ws"),
      connectionParams: { headers: transformHeaders(headers) },
      on: {
        connecting: () => {
          setResponseTime(null);
          return null;
        },
      },
    }),
    fetch: async function customFetch(...args) {
      setIsCached(false);
      setResponseTime(null);
      let start = Date.now();
      let returnedPromise = fetch(...args);
      let res = await returnedPromise;
      setResponseTime(Date.now() - start);
      let cloned = res.clone();
      setIsCached(res.headers.has("Cache-Control"));
      setResponseSize(JSON.stringify(await cloned.json()).length * 2);
      return returnedPromise;
    },
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
        else {
          setError(null);
          setSchema(buildClientSchema(data.data));
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading schema");
        setSchema(null);
        setLoading(false);
      });
  }, [headers, url]);

  return (
    <div id="hasura-graphiql-wrapper">
      {error && <ErrorNotification message={error} />}
      <Collapsible title="GraphQL Endpoint">
        <div className="hasura-graphiql-endpoint-holder">
          <button type="button" className="hasura-graphiql-post-button">
            POST
          </button>
          <input
            type="text"
            disabled
            data-testid="endpoint-input"
            className="hasura-graphiql-endpoint-input"
            value={url}
          />
        </div>
        {customToolbar}
      </Collapsible>
      <Collapsible title="Request Headers">
        <table className="hasura-graphiql-table">
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
              <td
                colSpan={2}
                className="hasura-graphiql-table-cell-value-entry"
              >
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
      </Collapsible>
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
          <GraphiQL
            fetcher={graphQLFetcher}
            query={query}
            onEditQuery={(q: string | undefined) => setQuery(q)}
            schema={schema}
            toolbar={{ additionalContent: extraButtons() }}
            variables={defaultVariables}
            {...graphiQLOptions}
            headerEditorEnabled={false}
            dangerouslyAssumeSchemaIsValid
          >
            {responseTime ? (
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
                  {isCached && (
                    <>
                      <span className="graphiql-footer-label">Cached</span>
                      <div className="hasura-graphiql-tooltip">
                        <IconInfoCircle />
                        <div className="hasura-graphiql-top">
                          <span>
                            This query reponse was cached using the @cached
                            directive
                          </span>
                          <i></i>
                        </div>
                      </div>
                      <span style={{ marginLeft: "4px" }}>
                        <IconCheckCircle />
                      </span>
                    </>
                  )}
                </div>
              </GraphiQL.Footer>
            ) : (
              <span />
            )}
          </GraphiQL>
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
