describe('Visit shared itinerary link', () => {
  before(() => {
    cy.login();
  });

  it('visits shared itinerary and checks for content', () => {
    cy.visit('http://localhost:3000/itinerary/share/446');

    cy.contains('Trip to Bali', { timeout: 10000 }).should('be.visible'); 

  });

  after(() => {
    cy.logout();
  });
});