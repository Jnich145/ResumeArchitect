import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, FileText, Info, MessageSquare, Layout } from 'lucide-react';
import ChatInterface from './chat/ChatInterface';
import TemplatePreview from './chat/TemplatePreview';
import { ResumeData } from '../types/resume';
import { improveSummary, generateBulletPoints } from '../services/aiService';

// Define message interface
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Define conversation state interface
interface ConversationState {
  currentTopic: string;
  pendingQuestions: string[];
  completedTopics: string[];
  extractedData: Partial<ResumeData>;
}

// Define view mode
type ViewMode = 'chat' | 'preview';

// Initial conversation flow
const initialConversation: ConversationState = {
  currentTopic: 'introduction',
  pendingQuestions: [
    'personalInfo',
    'jobTarget',
    'experience',
    'education',
    'skills',
    'challenges'
  ],
  completedTopics: [],
  extractedData: {}
};

// Define greetings and initial prompts
const INITIAL_MESSAGE = `Hi there! I'm your resume assistant. I'll help you build a professional resume through a friendly conversation.

Instead of filling out forms, we'll just chat. I'll ask you some questions about your background and experiences, and use your responses to create a tailored resume.

Let's start with your name and the type of job you're applying for. What should I call you, and what position are you interested in?`;

// Dialog flow questions by topic
const dialogFlowQuestions: Record<string, string> = {
  personalInfo: "Great! Now I need some contact information. Can you provide your email address and phone number?",
  jobTarget: "What kind of position are you looking for? If you have a specific job description, feel free to paste it here.",
  experience: "Tell me about your most recent work experience. Where did you work, what was your role, and what were your main responsibilities?",
  education: "What's your educational background? Include any degrees, certifications, or relevant training.",
  skills: "What skills and strengths would you like to highlight on your resume?",
  challenges: "Think about a challenging situation in your career. How did you handle it, and what was the outcome?",
  achievements: "What professional achievements are you most proud of? Try to include measurable results if possible."
};

// Suggested responses by topic
const suggestedResponses: Record<string, string[]> = {
  introduction: [
    "I'm applying for a software engineering role",
    "I'm looking for a marketing position",
    "I'm interested in project management"
  ],
  personalInfo: [
    "My email is example@email.com and phone is 555-123-4567",
    "I prefer not to share my contact info yet",
    "Can I add this information later?"
  ],
  experience: [
    "I have 5 years of experience in my field",
    "This will be my first professional role",
    "I've worked at multiple companies"
  ]
};

const ConversationalBuilder: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationState>(initialConversation);
  const [resumeData, setResumeData] = useState<Partial<ResumeData>>({});
  const [suggested, setSuggested] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const navigate = useNavigate();

  // Initialize chat with greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: uuidv4(),
      content: INITIAL_MESSAGE,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setSuggested(suggestedResponses.introduction || []);
  }, []);

  // Determine if we have enough information to show a preview
  const canShowPreview = 
    conversation.completedTopics.includes('skills') || 
    conversation.currentTopic === 'complete' ||
    conversation.currentTopic === 'achievements';

  // Simulate AI typing for a more natural interaction
  const simulateTyping = async (delay = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
  };

  // Process user message and determine next steps in conversation
  const processUserMessage = async (message: string) => {
    try {
      // Add user message to chat
      const userMessage: Message = {
        id: uuidv4(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsTyping(true);

      // Extract information based on current topic
      const updatedData = { ...resumeData };
      let response = '';
      
      // Process response based on current conversation topic
      switch (conversation.currentTopic) {
        case 'introduction':
          // Extract name and potential job interest
          if (message.includes(' for ') || message.includes(' in ')) {
            const nameMatch = message.match(/I'm ([A-Za-z]+)/i);
            if (nameMatch) {
              updatedData.personalInfo = {
                ...updatedData.personalInfo,
                fullName: nameMatch[1]
              };
            }
            
            // Move to next topic
            advanceTopic();
            response = dialogFlowQuestions.personalInfo;
          } else {
            response = "That's great! Could you also mention what type of position you're looking for?";
          }
          break;
          
        case 'personalInfo':
          // Extract contact info
          const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
          const phoneMatch = message.match(/(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{10})/g);
          
          if (emailMatch) {
            updatedData.personalInfo = {
              ...updatedData.personalInfo,
              email: emailMatch[0]
            };
          }
          
          if (phoneMatch) {
            updatedData.personalInfo = {
              ...updatedData.personalInfo,
              phone: phoneMatch[0]
            };
          }
          
          // Move to next topic
          advanceTopic();
          response = dialogFlowQuestions.jobTarget;
          break;
          
        case 'jobTarget':
          // Store job description for later use
          updatedData.jobDescription = message;
          
          // Move to next topic
          advanceTopic();
          response = dialogFlowQuestions.experience;
          break;
          
        case 'experience':
          // Store experience information
          if (!updatedData.experience) {
            updatedData.experience = [];
          }
          
          let bullets: string[] = [];
          try {
            // Use AI to convert the narrative to bullet points
            const response = await generateBulletPoints(
              "Extract professional achievements from this text", 
              message
            );
            bullets = response.bullets;
          } catch (error) {
            console.error("Failed to generate bullet points:", error);
            bullets = [message]; // Fallback to original message
          }
          
          // Create a new experience entry
          updatedData.experience.push({
            company: extractCompany(message) || 'Company Name',
            position: extractPosition(message) || 'Position',
            startDate: '',
            endDate: '',
            isPresent: false,
            description: bullets.join('\n')
          });
          
          // Move to next topic
          advanceTopic();
          response = dialogFlowQuestions.education;
          break;
          
        case 'education':
          // Store education information
          if (!updatedData.education) {
            updatedData.education = [];
          }
          
          // Parse education info
          updatedData.education.push({
            institution: extractInstitution(message) || 'Institution',
            degree: extractDegree(message) || 'Degree',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            isPresent: false,
            description: ''
          });
          
          // Move to next topic
          advanceTopic();
          response = dialogFlowQuestions.skills;
          break;
          
        case 'skills':
          // Store skills information
          const skills = message
            .split(/[,.\n]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
            
          updatedData.skills = skills;
          
          // Move to next topic
          advanceTopic();
          response = dialogFlowQuestions.challenges + "\n\nAfter this question, I'll have enough information to show you a preview of your resume.";
          break;
          
        case 'challenges':
          // Process challenge information to extract insights
          try {
            // Improve the summary based on all collected information
            const summaryResponse = await improveSummary(
              `Create a professional summary based on these details:
              Experience: ${updatedData.experience?.[0]?.description || ''}
              Skills: ${updatedData.skills?.join(', ') || ''}
              Challenge: ${message}
              Job Target: ${updatedData.jobDescription || ''}`
            );
            
            updatedData.summary = summaryResponse;
          } catch (error) {
            console.error("Failed to generate summary:", error);
            updatedData.summary = "Experienced professional with a proven track record of success.";
          }
          
          // Move to completion
          setConversation(prev => ({
            ...prev,
            currentTopic: 'complete',
            completedTopics: [...prev.completedTopics, prev.currentTopic],
            pendingQuestions: []
          }));

          // Show the preview tab automatically
          setViewMode('preview');
          
          // Final response
          response = `Thank you for sharing all this information! I've drafted a resume based on our conversation. You can now preview it with different templates.

You can:
1. Switch between templates to find one you like
2. Continue our conversation to add more details
3. Proceed to the full editor for final touches`;
          
          setSuggested([
            "Add more details",
            "Go to full editor",
            "Which template looks best?"
          ]);
          break;
          
        case 'complete':
          if (message.toLowerCase().includes('editor') || message.includes('full editor')) {
            // Save data and navigate to resume builder
            saveAndNavigate(updatedData);
            return;
          } else if (message.toLowerCase().includes('add more') || message.includes('details')) {
            response = "Great! What else would you like to add to your resume?";
            // Reset to achievements topic for additional information
            setConversation(prev => ({
              ...prev,
              currentTopic: 'achievements'
            }));
            // Switch back to chat view
            setViewMode('chat');
          } else if (message.toLowerCase().includes('template') || message.toLowerCase().includes('looks best')) {
            response = "You can browse through different templates using the preview tab. Each template has a different style and layout. Choose one that best represents your professional identity and the role you're applying for.";
            // Switch to preview mode
            setViewMode('preview');
          } else {
            response = "I'm not sure I understood. Would you like to add more details, go to the full editor, or discuss which template would work best for you?";
            setSuggested([
              "Add more details",
              "Go to full editor",
              "Which template looks best?"
            ]);
          }
          break;
          
        case 'achievements':
          // Add achievement as a bullet point to the most recent experience
          if (updatedData.experience && updatedData.experience.length > 0) {
            const lastIndex = updatedData.experience.length - 1;
            const lastExp = updatedData.experience[lastIndex];
            
            try {
              // Process achievement with AI
              const bullets = await generateBulletPoints(
                "Convert this achievement to a professional bullet point", 
                message
              );
              
              // Add to experience description
              updatedData.experience[lastIndex] = {
                ...lastExp,
                description: lastExp.description + '\n' + bullets.bullets[0]
              };
            } catch (error) {
              console.error("Failed to generate bullet point:", error);
              // Fallback - add as is
              updatedData.experience[lastIndex] = {
                ...lastExp,
                description: lastExp.description + '\n• ' + message
              };
            }
          }
          
          response = "I've added that achievement. Would you like to add another achievement, view your resume with different templates, or go to the full editor?";
          setSuggested([
            "Add another achievement",
            "View templates",
            "Go to full editor"
          ]);
          break;
          
        default:
          response = "I'm not sure what to ask next. Let's move on to your skills. What are your top professional skills?";
          advanceTopic();
      }
      
      // Set updated resume data
      setResumeData(updatedData);
      
      // Simulate typing delay for more natural interaction
      await simulateTyping(1500);
      
      // Add AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Update suggested responses if available for the next topic
      if (conversation.currentTopic !== 'complete' && conversation.currentTopic !== 'achievements') {
        const nextTopic = conversation.pendingQuestions[0] || conversation.currentTopic;
        setSuggested(suggestedResponses[nextTopic] || []);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error processing your information. Let's continue with the next question.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Advance to the next topic in the conversation flow
  const advanceTopic = () => {
    setConversation(prev => {
      const updatedPending = [...prev.pendingQuestions];
      const nextTopic = updatedPending.shift() || 'complete';
      
      return {
        ...prev,
        currentTopic: nextTopic,
        pendingQuestions: updatedPending,
        completedTopics: [...prev.completedTopics, prev.currentTopic]
      };
    });
  };
  
  // Save resume data and navigate to the builder
  const saveAndNavigate = (data: Partial<ResumeData>) => {
    // Store data in localStorage for now, including the template
    const dataWithTemplate = {
      ...data,
      template: selectedTemplate
    };
    localStorage.setItem('resumeData', JSON.stringify(dataWithTemplate));
    
    // Navigate to resume builder
    navigate('/build/personal-info');
  };
  
  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    
    // If we're in complete state, add a message about the template selection
    if (conversation.currentTopic === 'complete' || conversation.currentTopic === 'achievements') {
      const templateMessage: Message = {
        id: uuidv4(),
        content: `You've selected the ${template.charAt(0).toUpperCase() + template.slice(1)} template. It's a great choice! You can always change it later in the full editor.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, templateMessage]);
    }
  };
  
  // Simple entity extraction functions
  const extractCompany = (text: string): string | null => {
    const companyPatterns = [
      /(?:at|for|with)\s+([\w\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co))/i,
      /(?:at|for|with)\s+([\w\s&]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  const extractPosition = (text: string): string | null => {
    const positionPatterns = [
      /(?:as|was|am)\s+(?:a|an)\s+([\w\s]+?(?:Developer|Engineer|Manager|Director|Analyst|Designer|Consultant|Specialist|Associate|Assistant))/i,
      /(?:as|was|am)\s+(?:a|an)\s+([\w\s]+?)(?:\s+at|\s+for|\.)/i
    ];
    
    for (const pattern of positionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  const extractInstitution = (text: string): string | null => {
    const institutionPatterns = [
      /(University of [\w\s]+|[\w\s]+ University|[\w\s]+ College|[\w\s]+ Institute of Technology)/i
    ];
    
    for (const pattern of institutionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  const extractDegree = (text: string): string | null => {
    const degreePatterns = [
      /(Bachelor(?:'s)? of [A-Za-z]+|Master(?:'s)? of [A-Za-z]+|PhD|Doctor of [A-Za-z]+|Associate(?:'s)? of [A-Za-z]+|B\.S\.|B\.A\.|M\.S\.|M\.A\.|M\.B\.A\.|Ph\.D\.)/i
    ];
    
    for (const pattern of degreePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  // Handle user sending a message
  const handleSendMessage = async (message: string) => {
    await processUserMessage(message);
  };
  
  // Handle suggested response click
  const handleSuggestedResponseClick = (response: string) => {
    handleSendMessage(response);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">Build Your Resume</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Chat with our AI assistant to create your professional resume.
        </p>
      </div>
      
      {conversation.currentTopic !== 'introduction' && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start">
            <Info size={18} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-300">Currently discussing: {conversation.currentTopic}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {conversation.pendingQuestions.length} topics remaining. Completed {conversation.completedTopics.length} topics.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab navigation for chat and preview (only show when we have enough info) */}
      {canShowPreview && (
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button 
                onClick={() => setViewMode('chat')}
                className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                  viewMode === 'chat' 
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <MessageSquare className="mr-2" size={18} />
                Chat
              </button>
            </li>
            <li className="mr-2">
              <button 
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                  viewMode === 'preview' 
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Layout className="mr-2" size={18} />
                Template Preview
              </button>
            </li>
          </ul>
        </div>
      )}
      
      {/* Content area - show either chat or preview */}
      <div className="relative">
        {viewMode === 'chat' && (
          <ChatInterface 
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            suggestedResponses={suggested}
            onSuggestedResponseClick={handleSuggestedResponseClick}
          />
        )}
        
        {viewMode === 'preview' && canShowPreview && (
          <TemplatePreview 
            resumeData={resumeData}
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
          />
        )}
      </div>
      
      {conversation.currentTopic === 'complete' && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => saveAndNavigate(resumeData)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <FileText className="mr-2" size={20} />
            View and Edit Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationalBuilder; 