import * as React from "react";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery } from "graphql";

import "graphiql/graphiql.css";

const defaultHeaders = [[true, "Content-Type", "application/json"]];

function transformHeaders(headers) {
  let res = {};
  for (let header of headers) if (header[0]) res[header[1]] = header[2];
  return res;
}

function edited2DArray(arr, row, col, val) {
  let res = arr.slice().map((e) => e.slice());
  res[row][col] = val;
  return res;
}

export default function HasuraGraphiQL() {
  const [loading, setLoading] = React.useState(true);
  const [schema, setSchema] = React.useState(null);
  const [url, setUrl] = React.useState("");
  const [urlInput, setUrlInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [headers, setHeaders] = React.useState(defaultHeaders);
  const [headersInput, setHeadersInput] = React.useState(defaultHeaders);

  const updateHeaders = () => {
    if (headersInput !== headers) {
      setSchema(null);
      setLoading(true);
      setHeaders(headersInput);
    }
  };

  function graphQLFetcher(graphQLParams) {
    return fetch(url, {
      method: "post",
      headers: transformHeaders(headers),
      body: JSON.stringify(graphQLParams),
      credentials: "omit",
    }).then((response) => response.json());
  }

  React.useEffect(() => {
    console.log("effect...");
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
          setSchema(null);
          setLoading(false);
        });
  }, [schema, headers, url, loading]);

  return (
    <div id="wrapper" style={{ height: "50vh", margin: "1rem" }}>
      <div>
        <svg width="12" height="9">
          <path fill="#666" d="M 0 0 L 0 9 L 5.5 4.5 z"></path>
        </svg>
        <div className="font-semibold">GraphQl Endpoint</div>
        <div className="flex mb-md">
          <div className="flex items-center w-full">
            <button
              type="button"
              className="inline-flex cursor-default h-input font-semibold items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50"
            >
              POST
            </button>
            <input
              type="text"
              className="flex-1 min-w-0 block w-full px-3 py-2 h-input rounded-r border-gray-300"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={() => {
                if (urlInput !== url) {
                  setUrl(urlInput);
                  setSchema(null);
                  setLoading(true);
                }
              }}
            />
          </div>
          <div className="flex items-center ml-md cursor-pointer">
            <div className="react-toggle VXfg7r6cesy1kWWR_ptzG _1TCPn04RKhOR-AewE2hZJn">
              <input
                type="checkbox"
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
                  setLoading(true);
                }}
              />
            </div>
            <span className="whitespace-nowrap">Relay API</span>
            <i
              className="fa fa-info-circle _3akQktkNbOKJYjOXUGpLjV "
              aria-hidden="true"
            ></i>
          </div>
        </div>
      </div>
      <div className="font-semibold">Request Headers</div>
      <table
        className="min-w-full divide-y divide-gray-200 border-gray-200"
        style={{ border: "thin solid lightgray", marginBottom: "32px" }}
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
                  data-test-id={`row-key-${i}`}
                  value={header[1]}
                />
              </td>
              <td colSpan="1" className="">
                <input
                  onBlur={updateHeaders}
                  onChange={(e) =>
                    setHeadersInput(
                      edited2DArray(headersInput, i, 2, e.target.value)
                    )
                  }
                  className="w-full border-0 focus:ring-0 focus:outline-none"
                  placeholder="Enter Value"
                  data-test-id={`row-value-${i}`}
                  type="text"
                  value={header[2]}
                />
              </td>
              <td className="text-right">
                <i
                  className="cursor-pointer mr-md fa fa-times"
                  onClick={() => {
                    let result = headersInput.slice().map((r) => r.slice());
                    result.splice(i, 1);
                    setHeadersInput(result);
                    setHeaders(result);
                    setLoading(true);
                  }}
                >
                  X
                </i>
              </td>
            </tr>
          ))}
          <tr>
            <td className="text-right">
              <i
                className="cursor-pointer mr-md fa fa-eye"
                data-header-id="1"
                aria-hidden="true"
              ></i>
              <i
                className="cursor-pointer mr-md fa fa-times"
                data-header-id="1"
                aria-hidden="true"
              ></i>
            </td>
          </tr>
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
                      .querySelector(
                        `[data-test-id=row-key-${headersInput.length}]`
                      )
                      .focus()
                  );
                }}
              />
            </td>
            <td colSpan="2" className="border-t border-gray-200">
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
                      .querySelector(
                        `[data-test-id=row-value-${headersInput.length}]`
                      )
                      .focus()
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
          <div className="h-72 min-h-full bg-gray-50 w-72 min-w-full flex items-stretch justify-items-stretch">
            <div className="skeleton-box min-w-full w-1/4 border-gray-200 min-h-full"></div>
            <div className="skeleton-box min-w-full w-1/2 border-gray-200 min-h-full"></div>
            <div className="skeleton-box min-w-full w-1/4 border-gray-200 min-h-full"></div>
          </div>
        ) : (
          <>
            <GraphiQLExplorer
              schema={schema}
              query={query}
              onEdit={(q) => setQuery(q)}
              explorerIsOpen={true}
              onToggleExplorer={() => null}
              getDefaultScalarArgValue={null}
              makeDefaultArg={null}
              width="300px"
            />
            <GraphiQL
              fetcher={graphQLFetcher}
              query={query}
              onEditQuery={(q) => setQuery(q)}
              variables={null}
            />
          </>
        )}
      </div>
    </div>
  );
}
