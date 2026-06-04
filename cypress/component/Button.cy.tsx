import { Button } from "@/components/ui/button"

describe('Button.cy.tsx', () => {
  it('is visible and contains text', () => {
    cy.mount(<Button variant="default">Test</Button>)
    cy.get('button').should('be.visible').and('contain.text', "Test")
  })


  it('correctly applies css styles with class name', () => {
    cy.mount(<Button variant="ghost">Test</Button>)
    const ghostStyles: string[] = "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50".split(" ")
    const button = cy.get('button')
    ghostStyles.forEach(style => {
      button.should('have.class', style)
    })
  })
})