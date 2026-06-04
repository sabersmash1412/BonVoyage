export function getItineraryId() {
    return cy.readFile('cypress/results/itinerary-id.json').then(({ id }) => {
        return cy.log(`Loaded itinerary ID: ${id}`).then(() => id);
    });
}