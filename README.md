# Hasura GraphiQL Component

## Scripts

To run dev server with sample UI, run
`npm ci` and then `npm start`

The sample UI takes configuration info from the URL params. Visit http://localhost:3000/?subscription-endpoint=wss://thankful-beetle-75.hasura.app/v1/graphql&endpoint=https://thankful-beetle-75.hasura.app/v1/graphql&header=x-hasura-admin-secret:q3qsst5kj9xwYg7nvJw73uX0TgvSObwcNqjj0vcGaB89AX5pxvsFshvgxidV5l9j to get sample data populated.

To run tests, run
`yarn cypress open-ct`
