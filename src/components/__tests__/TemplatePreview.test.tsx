import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplatePreview from '../chat/TemplatePreview';

// Mock the resume templates
jest.mock('../resume-templates', () => ({
  ModernTemplate: () => <div data-testid="modern-template">Modern Template</div>,
  ProfessionalTemplate: () => <div data-testid="professional-template">Professional Template</div>,
  SimpleTemplate: () => <div data-testid="simple-template">Simple Template</div>,
  CreativeTemplate: () => <div data-testid="creative-template">Creative Template</div>,
  ExecutiveTemplate: () => <div data-testid="executive-template">Executive Template</div>
}));

describe('TemplatePreview', () => {
  const mockResumeData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'New York, NY',
      title: 'Software Engineer',
      website: 'johndoe.com',
      profileImage: ''
    },
    summary: 'Experienced software engineer',
    experience: [],
    education: [],
    skills: ['JavaScript', 'React', 'Node.js'],
    certifications: [],
    memberships: []
  };

  const mockOnTemplateSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the initial template', () => {
    render(
      <TemplatePreview 
        resumeData={mockResumeData} 
        onTemplateSelect={mockOnTemplateSelect}
        selectedTemplate="modern"
      />
    );

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
    expect(screen.getByText(/Template Preview: Modern/i)).toBeInTheDocument();
  });

  it('allows navigating between templates', () => {
    render(
      <TemplatePreview 
        resumeData={mockResumeData} 
        onTemplateSelect={mockOnTemplateSelect}
        selectedTemplate="modern"
      />
    );

    // Find and click the next button
    const nextButton = screen.getByLabelText('Next template');
    fireEvent.click(nextButton);

    // Should now show the professional template
    expect(screen.getByTestId('professional-template')).toBeInTheDocument();
    expect(screen.getByText(/Template Preview: Professional/i)).toBeInTheDocument();

    // Click next again
    fireEvent.click(nextButton);

    // Should now show the simple template
    expect(screen.getByTestId('simple-template')).toBeInTheDocument();
    expect(screen.getByText(/Template Preview: Simple/i)).toBeInTheDocument();

    // Find and click the previous button
    const prevButton = screen.getByLabelText('Previous template');
    fireEvent.click(prevButton);

    // Should go back to the professional template
    expect(screen.getByTestId('professional-template')).toBeInTheDocument();
    expect(screen.getByText(/Template Preview: Professional/i)).toBeInTheDocument();
  });

  it('calls onTemplateSelect when select button is clicked', () => {
    render(
      <TemplatePreview 
        resumeData={mockResumeData} 
        onTemplateSelect={mockOnTemplateSelect}
        selectedTemplate="modern"
      />
    );

    // Navigate to a different template
    const nextButton = screen.getByLabelText('Next template');
    fireEvent.click(nextButton);

    // Click the select button
    const selectButton = screen.getByText('Select Template');
    fireEvent.click(selectButton);

    // Should call onTemplateSelect with the new template
    expect(mockOnTemplateSelect).toHaveBeenCalledWith('professional');
  });

  it('shows "Selected" when the current template is selected', () => {
    render(
      <TemplatePreview 
        resumeData={mockResumeData} 
        onTemplateSelect={mockOnTemplateSelect}
        selectedTemplate="modern"
      />
    );

    // Initially should show "Selected" for the modern template
    expect(screen.getByText('Selected')).toBeInTheDocument();

    // Navigate to a different template
    const nextButton = screen.getByLabelText('Next template');
    fireEvent.click(nextButton);

    // Should now show "Select Template" for the professional template
    expect(screen.getByText('Select Template')).toBeInTheDocument();
  });

  it('toggles expanded view when maximize button is clicked', () => {
    render(
      <TemplatePreview 
        resumeData={mockResumeData} 
        onTemplateSelect={mockOnTemplateSelect}
        selectedTemplate="modern"
      />
    );

    // Find the container and check initial class
    const container = screen.getByText(/Template Preview: Modern/i).closest('div')?.parentElement;
    expect(container).not.toHaveClass('fixed inset-0 z-50 flex flex-col');

    // Find and click the maximize button
    const maximizeButton = screen.getByLabelText('Maximize');
    fireEvent.click(maximizeButton);

    // Should now have the expanded class
    expect(container).toHaveClass('fixed inset-0 z-50 flex flex-col');
  });
}); 