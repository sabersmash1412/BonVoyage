it('should allow a user to create a community post', () => {
  cy.login(); 
  cy.visit('localhost:3000/community');  

  cy.get('form').within(() => {
    cy.get('textarea').type('This is a test post content.');
    cy.get('button[type=submit]').click();
  });
  cy.url().should('include', '/community'); 

  cy.contains('This is a test post content.'); 

  cy.logout(); 
}); 