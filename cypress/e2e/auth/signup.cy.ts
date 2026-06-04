describe('Signup Flow', () => {
  it('successfully creates a new account', () => {
    cy.visit('http://localhost:3000/signup')
    cy.get('#first-name').type('Max')
    cy.get('#last-name').type('Robinson')
    cy.get('#email').type('fake.user123@testmail.com')
    cy.get('#password').type('Password123!')
    cy.get('button').contains('Create an account').click()

    cy.url().should('include', '/check-email')
    cy.contains('Check Your Email').should('exist')
  })

  it('shows error on invalid email format', () => {
    cy.visit('http://localhost:3000/signup')
    cy.get('#first-name').type('Jane')
    cy.get('#last-name').type('Doe')
    cy.get('#email').type('jnpj@gmail.com') 
    cy.get('#password').type('Password123!')
    cy.get('button').contains('Create an account').click()

    cy.get('.bg-red-100').contains(/Email address .* is invalid/).should('exist')
  })

  it('shows error on short password', () => {
    cy.visit('http://localhost:3000/signup')
    cy.get('#first-name').type('Jane')
    cy.get('#last-name').type('Doe')
    cy.get('#email').type('janedoe@example.com')
    cy.get('#password').type('123') 
    cy.get('button').contains('Create an account').click()

    cy.contains('Password should be at least 6 characters.').should('exist') 
  })
})