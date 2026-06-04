describe('tests auth flow', () => {
    it('logs user in and logs user out', () => {
        cy.login()
        cy.logout()
    })
})