describe('/api/flights', () => {
  it('returns flights for valid data', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/flights',
      body: {
        originLocationCode: 'SIN',
        destinationLocationCode: 'BKK',
        departureDate: '2025-07-10',
        returnDate: '2025-07-15',
        adults: 1
      }
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.property('flights');
      expect(resp.body.flights).to.be.an('array');
    });
  });

  it('fails gracefully on missing data', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/flights',
      failOnStatusCode: false,
      body: {}
    }).then((resp) => {
      expect(resp.status).to.be.oneOf([400, 500]); 
    });
  });
});