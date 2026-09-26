describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the main heading', () => {
    cy.findByText(/Create Your Perfect Resume/i).should('be.visible');
  });

  it('has a navigation menu', () => {
    cy.get('nav').should('exist');
    cy.findByText(/Templates/i).should('be.visible');
    cy.findByText(/Features/i).should('be.visible');
    cy.findByText(/Pricing/i).should('be.visible');
  });

  it('has a call-to-action button', () => {
    cy.findByText(/Build Your Resume/i).should('be.visible');
  });

  it('navigates to templates page', () => {
    cy.findByText(/Templates/i).click();
    cy.url().should('include', '/templates');
    cy.findByText(/Choose Your Perfect Template/i).should('be.visible');
  });
}); 