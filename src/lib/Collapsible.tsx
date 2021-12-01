import * as React from "react";
import { IconChevronRight, IconChevronDown } from "./Icons";
import "./styles.css";

export default function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="hasura-graphiql-title-holder">
      {collapsed ? (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <IconChevronRight />
        </span>
      ) : (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <IconChevronDown />
        </span>
      )}
      <span
        className="hasura-graphiql-title"
        onClick={() => setCollapsed(!collapsed)}
      >
        {title}
      </span>
      <div
        style={{
          display: collapsed ? "none" : "flex",
          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
