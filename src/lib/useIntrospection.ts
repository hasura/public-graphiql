import * as React from "react";
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from "graphql";

type IntrospectionResultType = {
  introspecting: boolean;
  schema: GraphQLSchema | null;
  error: string | null;
};

export default function useIntrospection(
  headers: Record<string, string>,
  url: string
) {
  const [introspectionResult, setIntrospectionResult] =
    React.useState<IntrospectionResultType>({
      introspecting: false,
      schema: null,
      error: null,
    });

  React.useEffect(
    function performIntrospection() {
      setIntrospectionResult({
        introspecting: true,
        schema: null,
        error: null,
      });
      fetch(url, {
        method: "post",
        headers: headers,
        body: JSON.stringify({
          query: getIntrospectionQuery(),
        }),
        credentials: "omit",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.errors)
            setIntrospectionResult({
              introspecting: false,
              schema: null,
              error: data.errors[0].message,
            });
          else {
            setIntrospectionResult({
              introspecting: false,
              schema: buildClientSchema(data.data),
              error: null,
            });
          }
        })
        .catch(() => {
          setIntrospectionResult({
            error: "Error introspecting schema",
            schema: null,
            introspecting: false,
          });
        });
    },
    [headers, url]
  );
  return introspectionResult;
}
