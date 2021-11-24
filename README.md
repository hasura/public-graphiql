# Hasura GraphiQL Component

Published on NPM at https://www.npmjs.com/package/@hasura/public-graphiql

## Usage

Usage example -

```javascript
render(
  <HasuraGraphiQL
    defaultUrl="https://hasura.io/graphql"
    defaultSubscriptionUrl="wss://hasura.io/graphql"
    defaultHeaders={{ "Content-Type": "application/json" }}
    maskedHeaders={["Content-Type"]}
  />,
  container
);
```

Sample usage with component customisation -

```javascript
<HasuraGraphiQL
  defaultUrl={defaultUrl}
  defaultSubscriptionUrl={defaultSubscriptionUrl}
  defaultHeaders={defaultHeaders}
  isCloud
  graphiQLOptions={{ readOnly: true }}
  explorerOptions={{
    colors: {
      keyword: "red",
      // OperationName, FragmentName
      def: "blue",
      // FieldName
      property: "yellow",
    },
  }}
/>
```

NOTE FOR TAILWIND USERS: To make the component styles compatible with Tailwind, add this line - `import "@hasura/public-graphiql/dist/tailwind-override.css` 

### Props

defaultUrl:string - initial graphql endpoint to be loaded

defaultSubscriptionUrl:string - initial graphql subscription endpoint to be loaded

defaultHeaders:Record<string, string> - initial set of request headers to be loaded;

hiddenHeaders:string[] - headers whose values are masked

defaultQuery:string - intial query to be shown

defaultVariables:string - intial variables to be shown

graphiQLOptions:Omit<GraphiQLProps, fetcher> - props to pass through to GraphiQL component; fetcher cannot be customised

explorerOptions:ExplorerProps - props to pass through to GraphiQLExplorer component

customToolbar: React.ReactNode - elements to be shown next to the endpoint input

All props are optional.

## Development

To run a dev server with a sample UI, run
`npm i` and then `npm start`

The sample UI takes configuration info from the URL params. Visit http://localhost:3000/?subscription-endpoint=wss://thankful-beetle-75.hasura.app/v1/graphql&endpoint=https://thankful-beetle-75.hasura.app/v1/graphql&header=x-hasura-admin-secret:q3qsst5kj9xwYg7nvJw73uX0TgvSObwcNqjj0vcGaB89AX5pxvsFshvgxidV5l9j to get sample data populated.

To run tests, run
`yarn cypress open-ct`

To build a package for publishing to NPM, run
`npm run build`

This will create a 'dist' folder which can be published to NPM using `npm publish` flow.
