import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ConversationalBuilder from '../ConversationalBuilder';

// Mock the aiService
jest.mock('../../services/aiService', () => ({
  improveSummary: jest.fn().mockResolvedValue('Professional summary'),
  generateBulletPoints: jest.fn().mockResolvedValue({ bullets: ['Bullet 1', 'Bullet 2'] })
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

// Mock ChatInterface
jest.mock('../chat/ChatInterface', () => {
  return () => <div data-testid="chat-interface">Chat Interface Mock</div>;
});

// Mock TemplatePreview
jest.mock('../chat/TemplatePreview', () => {
  return () => <div data-testid="template-preview">Template Preview Mock</div>;
});

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock useState to make sure initial topic is visible
jest.spyOn(React, 'useState').mockImplementationOnce(() => [
  { 
    currentTopic: 'personalInfo', 
    pendingQuestions: ['jobTarget', 'experience', 'education', 'skills'], 
    completedTopics: ['introduction'],
    extractedData: {}
  }, 
  jest.fn()
]);

describe('ConversationalBuilder', () => {
  it('renders the main title and description', () => {
    render(
      <BrowserRouter>
        <ConversationalBuilder />
      </BrowserRouter>
    );

    expect(screen.getByText('Build Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Chat with our AI assistant to create your professional resume.')).toBeInTheDocument();
  });

  it('renders the chat interface', () => {
    render(
      <BrowserRouter>
        <ConversationalBuilder />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
  });
}); 