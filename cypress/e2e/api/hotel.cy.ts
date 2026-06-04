describe('/api/hotels', () => {
  it('returns 400 on missing data', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/hotels',
      failOnStatusCode: false,
      body: {}
    }).then((resp) => {
      expect(resp.status).to.eq(400);
    });
  });

  it('returns hotel data with median prices', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/hotels',
      body: {
        location: 'Singapore',
        checkInDate: '2025-07-10',
        checkOutDate: '2025-07-12'
      }
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.be.an('array');

      if (resp.body.length) {
        expect(resp.body[0]).to.have.all.keys('star', 'medianPrice');
      }
    });
  });
});