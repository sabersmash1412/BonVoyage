/// <reference types="cypress" />

import { getItineraryId } from "./itineraryUtils";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
Cypress.Commands.add('login', () => { // abstraction for performing login
    cy.visit('http://localhost:3000/login');
    cy.get('#email').type('buffalowee@gmail.com').should('have.value', 'buffalowee@gmail.com');
    cy.get('#password').type('Password123!').should('have.value', 'Password123!');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/plan', { timeout: 4000 });
});

Cypress.Commands.add('logout', () => { // abstraction for performing login
    //log out
    cy.contains('Log out').click({ timeout: 4000 })
    cy.url().should('include', 'http://localhost:3000/login')
});

Cypress.Commands.add('loginAndGetItineraryId', () => {
    return cy.login().then(() => getItineraryId())
});