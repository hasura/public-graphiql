import React from "react";
import { mount } from "@cypress/react";
import HasuraGraphiQL from "./lib/HasuraGraphiQL";

function mockServerInit() {
  cy.intercept("POST", "https://hasura.io/graphql", (req) => {
    if (JSON.stringify(req.body).includes("IntrospectionQuery"))
      req.reply({
        fixture: "schema.json",
      });
    else
      req.reply({
        body: { it: "works" },
      });
  }).as("gqlfetch");
}

beforeEach(() => {
  mockServerInit();
});

it("introspection and query", () => {
  let defaultQuery = `query MyQuery {
    builds {
      commit
    }
  }
  `;

  mount(
    <HasuraGraphiQL
      url="https://hasura.io/graphql"
      defaultQuery={defaultQuery}
    />
  );
  cy.get("button").contains("POST");
  cy.get(".graphiql-explorer-field-view").contains("builds");
  cy.get(".execute-button").click();
  cy.get(".cm-string").contains("works");
});

it("introspect on header change", () => {
  mount(<HasuraGraphiQL url="https://hasura.io/graphql" />);
  cy.get("[data-testid=row-key-0]").type("p");
  cy.get("[data-testid=row-key-1]").type("r");
  cy.get("[data-testid=row-key-1]").blur();
  cy.get(".graphiql-explorer-field-view").contains("builds");
});

it("header addition", () => {
  mount(<HasuraGraphiQL url="https://hasura.io/graphql" />);
  cy.get("[data-testid=row-key-0]").type("p");
  cy.get("[data-testid=row-key-0]").should("have.value", "p");
  cy.get("[data-testid=row-key-1]").should("have.value", "");
});

it("schema error display", () => {
  mount(<HasuraGraphiQL url="https://hasura.io/graphq" />);
  cy.get(".hasura-graphiql-notification-title").contains(
    "Schema Introspection Error"
  );
});
