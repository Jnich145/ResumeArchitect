import React from 'react';
import { render, screen } from '@testing-library/react';
import ResumePreview from '../ResumePreview';
import { ResumeData } from '../../types/resume';

// Mock the resume templates
jest.mock('../resume-templates', () => ({
  ModernTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="modern-template">{data.personalInfo.fullName}</div>
  ),
  CreativeTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="creative-template">{data.personalInfo.fullName}</div>
  ),
  ProfessionalTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="professional-template">{data.personalInfo.fullName}</div>
  ),
  SimpleTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="simple-template">{data.personalInfo.fullName}</div>
  ),
  ExecutiveTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="executive-template">{data.personalInfo.fullName}</div>
  ),
  AcademicTemplate: ({ data }: { data: ResumeData }) => (
    <div data-testid="academic-template">{data.personalInfo.fullName}</div>
  ),
}));

// Mock ErrorBoundary component
jest.mock('../ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockResumeData: ResumeData = {
  personalInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    profileImage: undefined,
    title: 'Software Engineer',
    website: 'johndoe.com',
  },
  summary: 'Experienced software engineer',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  memberships: []
};

describe('ResumePreview Component', () => {
  test('renders without crashing', () => {
    render(<ResumePreview selectedTemplate="modern" resumeData={mockResumeData} />);
    expect(screen.getByText('Resume Preview')).toBeInTheDocument();
  });

  test('renders modern template when selected', () => {
    render(<ResumePreview selectedTemplate="modern" resumeData={mockResumeData} />);
    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });

  test('renders creative template when selected', () => {
    render(<ResumePreview selectedTemplate="creative" resumeData={mockResumeData} />);
    expect(screen.getByTestId('creative-template')).toBeInTheDocument();
  });

  test('renders professional template when selected', () => {
    render(<ResumePreview selectedTemplate="professional" resumeData={mockResumeData} />);
    expect(screen.getByTestId('professional-template')).toBeInTheDocument();
  });

  test('renders simple template when selected', () => {
    render(<ResumePreview selectedTemplate="simple" resumeData={mockResumeData} />);
    expect(screen.getByTestId('simple-template')).toBeInTheDocument();
  });

  test('renders executive template when selected', () => {
    render(<ResumePreview selectedTemplate="executive" resumeData={mockResumeData} />);
    expect(screen.getByTestId('executive-template')).toBeInTheDocument();
  });

  test('renders academic template when selected', () => {
    render(<ResumePreview selectedTemplate="academic" resumeData={mockResumeData} />);
    expect(screen.getByTestId('academic-template')).toBeInTheDocument();
  });
}); 