describe('Password Reset', () => {
  it('sends reset email', () => {
    cy.visit('http://localhost:3000/forgot-password')
    cy.get('input[name=email]').type('buffalowee@gmail.com')
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/check-email')
    cy.contains('Check Your Email').should('exist')
  })
})