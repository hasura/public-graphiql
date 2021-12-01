import * as React from "react";
import {
  headersObjectToArray,
  headersArrayToObject,
  edited2DArray,
} from "./utils";
import { IconCross, IconEye } from "./Icons";

export default function HeaderEditor({
  initialHeaders,
  hiddenHeaders = [],
  onUpdate,
}: {
  initialHeaders: Record<string, string>;
  hiddenHeaders?: string[];
  onUpdate: (headers: Record<string, string>) => void;
}) {
  const [headersInput, setHeadersInput] = React.useState(
    headersObjectToArray(initialHeaders, hiddenHeaders)
  );
  const [updateRequired, setUpdateRequired] = React.useState(false);

  React.useEffect(
    function syncUpdateRequired() {
      setUpdateRequired(true);
    },
    [headersInput]
  );

  function updateIfRequired() {
    if (updateRequired) onUpdate(headersArrayToObject(headersInput));
    setUpdateRequired(false);
  }

  return (
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
                  updateIfRequired();
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
                onBlur={updateIfRequired}
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
                onBlur={updateIfRequired}
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
                    setHeadersInput(edited2DArray(headersInput, i, 3, toggled));
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
  );
}
