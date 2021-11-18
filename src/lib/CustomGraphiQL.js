// JS is used here instead of TS because of a type issue in GraphiQL.
// The 'schema' prop is documented to accept GraphQLSchema | null | undefined
// but is typed as GraphQLSchema | undefined. This makes the null option unusable.
// Since schema introspection is prevented only on providing a 'null' param, we
// are unable to do so because of type errors. Thus, as a workaround, this particular
// component has been extracted into a JS file.
// References:
// Doc: https://github.com/graphql/graphiql/blob/main/packages/graphiql/README.md
// Type definition: https://github.com/graphql/graphiql/blob/25fb5c50f655b838873dcb348b3295e962a05f12/packages/graphiql/src/components/GraphiQL.tsx#L113

import React from "react";
import GraphiQL from "graphiql";

export default function CustomGraphiQL({
  graphQLFetcher,
  query,
  onEdit,
  schema,
  toolbarOpts,
  variables,
}) {
  return (
    <GraphiQL
      fetcher={graphQLFetcher}
      query={query}
      onEditQuery={onEdit}
      schema={schema === undefined ? null : schema}
      toolbar={toolbarOpts}
      response=""
      variables={variables}
    />
  );
}
