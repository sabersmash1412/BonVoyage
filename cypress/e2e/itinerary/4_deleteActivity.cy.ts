describe('Delete activity', () => {
    let itineraryId: string;

    before(function () {
        cy.loginAndGetItineraryId().then((id) => {
            itineraryId = id;
        });
    });

    it('Ensures activity is deleted and no longer on screen', () => {
        cy.visit(`localhost:3000/itinerary/${itineraryId}`);
        cy.wait(4000) // wait for itinerary to load

        cy.get('[data-cy="activity-card"]').then(($cards) => {
            const cardCount = $cards.length;
            const randomIndex = Math.floor(Math.random() * cardCount);
            const $randomCard = $cards.eq(randomIndex);

            cy.wrap($randomCard)
                .find('[data-cy="activity-title"]')
                .invoke('text')
                .then((titleText) => {
                    const title = titleText.trim();
                    cy.wrap(title).as('deletedTitle'); // get activity title

                    cy.wrap($randomCard).trigger('mouseover') // need to hover over card for button to show
                        .within(() => {
                            cy.get('[data-cy="activity-card-delete-button"]').click(); // update this selector as needed
                        });

                    cy.contains(`Deleting activity`).should('be.visible') // sonner promise
                    cy.contains(`Successfully deleted activity`).should('be.visible') // sonner success

                    // ensure card is removed
                    cy.contains('[data-cy="activity-card"]', title).should('not.exist');

                    // reload page and redo prev step
                    cy.reload();
                    cy.get('@deletedTitle').then((deletedTitle) => {
                        cy.contains('[data-cy="activity-card"]', deletedTitle as unknown as string).should('not.exist');
                    });
                });
        });
    });
});