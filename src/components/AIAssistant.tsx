import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

const AIAssistant = ({ resumeData, updateResumeData }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = () => {
    setIsGenerating(true);
    // Simulating AI-generated suggestions with a delay
    setTimeout(() => {
      const aiSuggestions = [
        {
          section: 'summary',
          content: 'Experienced software developer with a passion for creating efficient and scalable web applications. Proficient in React, Node.js, and cloud technologies.',
        },
        {
          section: 'skills',
          content: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
        },
        {
          section: 'experience',
          content: {
            company: 'Tech Innovators Inc.',
            position: 'Senior Software Engineer',
            description: 'Led a team of developers in creating a high-performance e-commerce platform using React and Node.js, resulting in a 40% increase in user engagement.',
          },
        },
      ];
      setSuggestions(aiSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.section === 'summary') {
      updateResumeData('summary', suggestion.content);
    } else if (suggestion.section === 'skills') {
      updateResumeData('skills', [...new Set([...resumeData.skills, ...suggestion.content])]);
    } else if (suggestion.section === 'experience') {
      updateResumeData('experience', [...resumeData.experience, suggestion.content]);
    }
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-float">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">AI Assistant</h3>
      <button
        onClick={generateSuggestions}
        disabled={isGenerating}
        className={`btn-secondary w-full mb-4 group ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Sparkles size={20} className={`mr-2 ${isGenerating ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
        {isGenerating ? 'Generating...' : 'Generate Suggestions'}
      </button>
      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105">
            <p className="mb-2 text-gray-700 dark:text-gray-300">{suggestion.content.toString()}</p>
            <button
              onClick={() => applySuggestion(suggestion)}
              className="btn-primary text-sm flex items-center"
            >
              <Check size={16} className="mr-2" />
              Apply Suggestion
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAssistant;