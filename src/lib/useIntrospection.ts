import * as React from "react";
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from "graphql";

type IntrospectionInfoType = {
  introspecting: boolean;
  schema: GraphQLSchema | null;
  error: string | null;
};

export default function useIntrospection(
  headers: Record<string, string>,
  url: string
) {
  const [IntrospectionInfo, setIntrospectionInfo] =
    React.useState<IntrospectionInfoType>({
      introspecting: false,
      schema: null,
      error: null,
    });

  React.useEffect(
    function performIntrospection() {
      setIntrospectionInfo({
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
            setIntrospectionInfo({
              introspecting: false,
              schema: null,
              error: data.errors[0].message,
            });
          else {
            setIntrospectionInfo({
              introspecting: false,
              schema: buildClientSchema(data.data),
              error: null,
            });
          }
        })
        .catch(() => {
          setIntrospectionInfo({
            error: "Error introspecting schema",
            schema: null,
            introspecting: false,
          });
        });
    },
    [headers, url]
  );
  return IntrospectionInfo;
}
