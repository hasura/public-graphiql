import * as React from "react";
import GraphiQL, { GraphiQLProps } from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import CodeExporter from "graphiql-code-exporter";
import snippets from "./snippets";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { createClient } from "graphql-ws";
import { toggleCacheDirective } from "./utils";
import { IconInfoCircle, IconCheckCircle } from "./Icons";
import Spinner from "./Spinner";
import Collapsible from "./Collapsible";
import ErrorNotification from "./ErrorNotification";
import HeaderEditor from "./HeaderEditor";
import useIntrospection from "./useIntrospection";
import "graphiql/graphiql.css";
import "graphiql-code-exporter/CodeExporter.css";
import "./styles.css";

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
  children = null,
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
  children?: React.ReactNode;
}) {
  const [query, setQuery] = React.useState<string | undefined>(defaultQuery);
  const [headers, setHeaders] = React.useState(defaultHeaders);
  const [codeExporterVisible, setCodeExporterVisible] = React.useState(false);
  const [explorerVisible, setExplorerVisible] = React.useState(true);
  const [responseTime, setResponseTime] = React.useState<number | null>(null);
  const [responseSize, setResponseSize] = React.useState(0);
  const [isCached, setIsCached] = React.useState(false);
  const [explorerWidth, setExplorerWidth] = React.useState(300);
  const [resizing, setResizing] = React.useState(false);
  
  const { introspecting, schema, error } = useIntrospection(headers, url);

  const graphQLFetcher = createGraphiQLFetcher({
    url: url,
    headers: headers,
    wsClient: createClient({
      url: url.replace("http", "ws"),
      connectionParams: { headers: headers },
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
        <HeaderEditor
          initialHeaders={defaultHeaders}
          hiddenHeaders={hiddenHeaders}
          onUpdate={(updatedHeaders) => setHeaders(updatedHeaders)}
        />
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
          {introspecting ? (
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
            {children}
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

export const GraphiQLButton = GraphiQL.Button
export const GraphiQLToolbar = GraphiQL.Toolbar
