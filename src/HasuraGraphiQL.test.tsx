import React from "react";
import { mount } from "@cypress/react";
import HasuraGraphiQL from "./HasuraGraphiQL";

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
  }).as('gqlfetch');
}

it("introspection and query", () => {
  mockServerInit();
  let defaultQuery = `query MyQuery {
    builds {
      commit
    }
  }
  `;

  mount(
    <HasuraGraphiQL
      defaultUrl="https://hasura.io/graphql"
      defaultQuery={defaultQuery}
    />
  );
  cy.get("button").contains("POST");
  cy.get(".graphiql-explorer-field-view").contains("builds");
  cy.get(".execute-button").click();
  cy.get(".cm-string").contains("works");
});

it("introspect on url change", ()=>{
  mockServerInit();
  mount(
    <HasuraGraphiQL
      defaultUrl="https://hasura.io/graphq"
    />
  );
  cy.get('[data-testid=endpoint-input]').type('l')
  cy.get('[data-testid=endpoint-input]').blur()
  // cy.get('@gqlfetch').should('have.property', 'status', 200)
});

it("introspect on header change", ()=>{
  mockServerInit();
  mount(
    <HasuraGraphiQL
      defaultUrl="https://hasura.io/graphq"
    />
  );
  cy.get('[data-element-name=key]').type('p')
  cy.get('[data-testid=row-key-0]').type('r')
  cy.get('[data-testid=row-key-0]').blur()
  // cy.get('@gqlfetch').should('have.property', 'status', 200)
});

it("header addition", ()=>{
  mockServerInit();
  mount(
    <HasuraGraphiQL
      defaultUrl="https://hasura.io/graphq"
    />
  );
  cy.get('[data-element-name=key]').type('p')
  cy.get('[data-testid=row-key-0]').should('have.value','p')
});
