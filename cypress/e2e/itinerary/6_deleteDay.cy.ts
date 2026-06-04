describe('Delete day', () => {
    let itineraryId: string;

    before(function () {
        cy.loginAndGetItineraryId().then((id) => {
            itineraryId = id;
        });
    });

    it('Ensures day container properly handled during deletion', () => {
        cy.visit(`localhost:3000/itinerary/${itineraryId}`);
        cy.wait(4000) // wait for itinerary to load

        // Ensures deleting middle day causes day to remain but all activities in day are gone
        cy.get('[data-cy="day-card"]').then(($cards) => {
            const index = 1 // take middle card
            const $middleCard = $cards.eq(index);

            cy.wrap($middleCard)
                .invoke('text')
                .then((text) => {
                    const allText = text;

                    // open dropdown menu
                    cy.wrap($middleCard).find('[data-cy="open-dropdown-menu"]').click()
                    // click delete date dialog trigger
                    cy.get('[data-cy="delete-day-dialog-trigger"]').click();

                    // ensure dialog title and description apprears
                    cy.contains('This action cannot be undone. This will permanently delete the day and all associated activities.').should('be.visible')
                    cy.contains('Are you absolutely sure you want to delete this day?').should('be.visible')

                    cy.get('[data-cy="continue-button"]').contains('Continue').should('be.visible').click();

                    cy.contains(`Deleting day`).should('be.visible') // sonner promise
                    cy.contains(`Successfully deleted day`).should('be.visible') // sonner success

                    // ensure all activities in day is removed
                    cy.contains(allText).should('not.exist');

                    // ensure day whicch has 0 activities contains below text
                    cy.contains('No activities for this day. Add some!').should('be.visible')
                });
        });

        cy.wait(4000) // wait for sonner to disappear
        cy.get('[data-cy="day-card"]').then(($cards) => {
            const index = 0 // take first card
            const $firstCard = $cards.eq(index);

            cy.wrap($firstCard).then(($card) => {
                const allText = $card.text();
                const date = $card.find('[data-cy="day-container-date"]').text();

                // open dropdown menu
                cy.wrap($firstCard).find('[data-cy="open-dropdown-menu"]').click()
                // click delete date dialog trigger
                cy.get('[data-cy="delete-day-dialog-trigger"]').click();

                // ensure dialog title and description apprears
                cy.contains('This action cannot be undone. This will permanently delete the day and all associated activities.').should('be.visible')
                cy.contains('Are you absolutely sure you want to delete this day?').should('be.visible')

                cy.get('[data-cy="continue-button"]').contains('Continue').should('be.visible').click();

                // cy.contains(`Deleting day`).should('be.visible') // sonner promise
                cy.contains(`Successfully deleted day`).should('be.visible') // sonner success

                cy.reload() // reload for now as plane logo icon showing dates of itinerary does not change dynamically like activity list

                // ensure all activities in day is removed
                cy.contains(allText).should('not.exist');

                // ensure day container is removed
                cy.contains(date).should('not.exist');
            })
        });
    });
});