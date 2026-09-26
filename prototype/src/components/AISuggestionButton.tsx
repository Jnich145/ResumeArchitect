import React, { useState } from 'react';
import { Sparkles, Check, X, Loader2, MessageCircle, AlertTriangle } from 'lucide-react';
import { improveContent } from '../services/aiService';

interface AISuggestionButtonProps {
  fieldType: string;
  currentContent: string;
  onApplySuggestion: (suggestion: string) => void;
  jobDescription?: string;
}

const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({ 
  fieldType, 
  currentContent, 
  onApplySuggestion,
  jobDescription
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageExceeded, setUsageExceeded] = useState(false);

  const generateSuggestion = async () => {
    if (!currentContent.trim()) {
      setError("Please enter some content first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setUsageExceeded(false);
    
    try {
      // Add a delay to show loading state (improves UX perception)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await improveContent(fieldType, currentContent);
      
      if (!response.improvedContent) {
        setError('No suggestion generated. Please try again.');
        setTimeout(() => setError(null), 3000);
        setIsGenerating(false);
        return;
      }
      
      setSuggestion(response.improvedContent);
    } catch (err: any) {
      console.error('Error generating suggestion:', err);
      
      // Check if the error is related to usage limits
      if (err.message && (
          err.message.includes('usage limit') || 
          err.message.includes('quota') ||
          err.message.includes('rate limit') ||
          err.message.includes('API key')
        )) {
        setUsageExceeded(true);
        setError('AI usage limit exceeded. Please try again later or upgrade your plan.');
      } else {
        setError('Failed to generate suggestion. Please try again.');
      }
      
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      onApplySuggestion(suggestion);
      setSuggestion(null);
    }
  };

  const closeSuggestion = () => {
    setSuggestion(null);
  };

  return (
    <div className="relative inline-block">
      {/* AI Suggestion Button */}
      <button
        type="button"
        onClick={generateSuggestion}
        disabled={isGenerating}
        className={`
          absolute right-3 top-3 p-2 rounded-md transition-all duration-200 ease-in-out
          ${isGenerating 
            ? 'bg-gray-300 cursor-wait' 
            : 'bg-blue-100 hover:bg-blue-200 text-blue-700 hover:scale-105 shadow-sm hover:shadow'}
        `}
        title="Get AI suggestions"
      >
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <div className="flex items-center">
            <Sparkles size={16} className="mr-1" />
            <span className="text-xs font-medium">Suggest</span>
          </div>
        )}
      </button>

      {/* Loading Message */}
      {isGenerating && (
        <div className="absolute z-10 right-0 mt-2 bg-blue-50 text-blue-700 p-3 rounded-md text-sm shadow-lg border border-blue-100 w-64">
          <div className="flex items-center mb-2">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span className="font-medium">Generating suggestion...</span>
          </div>
          <p className="text-xs text-blue-600">
            Analyzing content and creating tailored AI suggestions for you.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute z-10 right-0 mt-2 bg-red-50 text-red-700 p-3 rounded-md text-sm shadow-lg border border-red-100 w-64">
          <div className="flex items-start">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">{error}</p>
              {usageExceeded ? (
                <p className="text-xs text-red-600">
                  Your AI usage for this month has reached its limit. Consider upgrading your plan for unlimited AI suggestions.
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  Try adding more specific details to get better suggestions.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Popup */}
      {suggestion && (
        <div className="absolute z-10 right-0 mt-2 w-full md:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Sparkles size={16} className="text-blue-500 mr-2" />
              AI Suggestion
            </h3>
            <button 
              onClick={closeSuggestion} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-sm">
            {suggestion}
          </div>
          <div className="p-3 flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <MessageCircle size={12} className="mr-1" />
              <span>Not what you wanted? Try adding more details.</span>
            </div>
            <button
              onClick={applySuggestion}
              className="flex items-center text-white bg-blue-600 py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <Check size={14} className="mr-1" />
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestionButton; 