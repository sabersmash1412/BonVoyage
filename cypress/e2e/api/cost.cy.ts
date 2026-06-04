describe('/api/cost', () => {
  it('returns 400 if no country given', () => {
    cy.request({
      url: 'http://localhost:3000/api/cost',
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400);
    });
  });

  it('returns 404 for unknown country', () => {
    cy.request({
      url: 'http://localhost:3000/api/cost?country=NowhereLand',
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(404);
    });
  });

  it('returns cost data for known country', () => {
    cy.request('http://localhost:3000/api/cost?country=singapore').then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.property('food');
      expect(resp.body).to.have.property('transport');
    });
  });
});