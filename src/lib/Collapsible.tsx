import * as React from "react";
import { IconChevronRight, IconChevronDown } from "./Icons";

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
          className="hasura-graphiql-cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <IconChevronRight />
        </span>
      ) : (
        <span
          className="hasura-graphiql-cursor-pointer"
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
        className={`hasura-graphiql-collapsible-content ${
          collapsed
            ? "hasura-graphiql-panel-collapsed"
            : "hasura-graphiql-panel"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
