# Hasura GraphiQL Component

## Known Issues

1. Loader style doesn't match console UI loader style.
2. Errors are shown in graphiql response pane too.
3. Explorer pane is not resizable.
4. Subscriptions fail.
5. Needs better readme.

## Usage

Usage example -

```javascript
render(
  <HasuraGraphiQL
    defaultUrl="https://hasura.io/graphql"
    defaultSubscriptionUrl="wss://hasura.io/graphql"
    defaultHeaders={{'Content-Type':'application/json'}}
  />,
  container
);
```


### Props

defaultUrl - initial graphql endpoint to be loaded

defaultSubscriptionUrl - initial graphql subscription endpoint to be loaded

defaultHeaders - initial set of request headers to be loaded; key/value object

defaultQuery - intial query to be shown


All props are optional.

## Scripts

To run dev server with sample UI, run
`npm ci` and then `npm start`

The sample UI takes configuration info from the URL params. Visit http://localhost:3000/?subscription-endpoint=wss://thankful-beetle-75.hasura.app/v1/graphql&endpoint=https://thankful-beetle-75.hasura.app/v1/graphql&header=x-hasura-admin-secret:q3qsst5kj9xwYg7nvJw73uX0TgvSObwcNqjj0vcGaB89AX5pxvsFshvgxidV5l9j to get sample data populated.

To run tests, run
`yarn cypress open-ct`
