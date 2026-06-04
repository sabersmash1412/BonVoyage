import { incrementDateStringByOne } from "@/utils/dateFunctions";

describe('Add day', () => {
    let itineraryId: string;

    before(function () {
        cy.loginAndGetItineraryId().then((id) => {
            itineraryId = id;
        });
    });

    it('Ensures new day container added to end of itinerary', () => {
        cy.visit(`localhost:3000/itinerary/${itineraryId}`);
        cy.wait(4000) // wait for itinerary to load

        cy.get('[data-cy="day-card"]').then(($cards) => {
            const $lastCard = $cards.last();

            cy.wrap($lastCard)
                .find('[data-cy="day-container-date"]')
                .invoke('text')
                .then((dateString) => {
                    const oldDate = dateString;
                    const newDate = incrementDateStringByOne(oldDate)

                    cy.get('[data-cy="add-day-button"]').scrollIntoView().contains('add day').should('be.visible').click();

                    // check that newDate in new container on page
                    cy.get('[data-cy="day-card"]')
                        .last()
                        .contains(newDate)
                        .should('be.visible')

                    cy.get('[data-cy="day-card"]')
                        .last()
                        .contains("No activities for this day. Add some!")
                        .should('be.visible')
                });
        });
    });
});