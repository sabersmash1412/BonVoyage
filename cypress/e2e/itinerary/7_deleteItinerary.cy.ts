describe('Delete itinerary', () => {
    let itineraryId: string;
    before(function () {
        cy.loginAndGetItineraryId().then((id) => {
            itineraryId = id;
        });
    });

    it('Ensures itinerary is deleted and no longer viewable', () => {
        // visit and delete itinerary
        cy.visit(`localhost:3000/itinerary/${itineraryId}`)
        cy.wait(4000) // wait for itinerary to load

        cy.get("[data-cy='delete-itinerary-button']").scrollIntoView().contains('Delete Itinerary').should('be.visible').click()
        cy.contains('This will permanently delete your itinerary').should('be.visible')
        cy.get("[data-cy='continue-button']").contains('Continue').click()

        cy.contains(`Deleting itinerary ${itineraryId}`) // sonner promise
        cy.contains(`Itinerary ${itineraryId} deleted successfully!`).should('be.visible') // sonner success

        // ensure redirected
        cy.url().should('include', 'localhost:3000/trips')

        cy.visit(`localhost:3000/itinerary/${itineraryId}`, {
            failOnStatusCode: false, // prevent cypress from failing on non-200
        });
        cy.contains('This page could not be found.').should('be.visible');
    })
})