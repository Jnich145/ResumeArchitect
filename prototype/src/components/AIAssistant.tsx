import React, { useState, useEffect } from 'react';
import { Sparkles, Check, AlertTriangle, Info, Activity, Lock } from 'lucide-react';
import { ResumeData } from '../types/resume';
import { 
  generateResumeSuggestions, 
  getAIUsageStats 
} from '../services/aiService';

interface AIAssistantProps {
  resumeData: ResumeData;
  updateResumeData: (section: keyof ResumeData, data: any) => void;
  jobDescription?: string;
}

interface AISuggestion {
  section: keyof ResumeData;
  content: any;
  explanation: string;
}

interface UsageStats {
  used: number;
  limit: number;
  resetDate: string;
  tier: 'free' | 'basic' | 'premium';
  remaining: number;
  percentUsed: number;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  resumeData, 
  updateResumeData,
  jobDescription
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);

  useEffect(() => {
    // Fetch AI usage stats on component mount
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const stats = await getAIUsageStats();
      setUsageStats(stats);
      
      // Check if usage limit is reached
      if (stats.used >= stats.limit) {
        setUsageLimitReached(true);
      } else {
        setUsageLimitReached(false);
      }
    } catch (err) {
      console.error('Failed to fetch AI usage stats:', err);
      // Don't show error to user since this is background data
    }
  };

  const generateSuggestions = async () => {
    // Prevent generating if at usage limit
    if (usageLimitReached) {
      setError('You have reached your monthly AI usage limit. Please upgrade your plan for more suggestions.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the API service
      const response = await generateResumeSuggestions(resumeData, jobDescription);
      setSuggestions(response.suggestions);
      
      // Refresh usage stats after generation
      fetchUsageStats();
    } catch (err: any) {
      console.error('Error generating suggestions:', err);
      
      // Check if the error is related to usage limits
      if (err.message && (
          err.message.includes('usage limit') || 
          err.message.includes('quota') ||
          err.message.includes('limit reached')
        )) {
        setUsageLimitReached(true);
        setError('You have reached your monthly AI usage limit. Please upgrade your plan for more suggestions.');
      } else {
        setError(err.message || 'Failed to generate suggestions. Please try again later.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    updateResumeData(suggestion.section, suggestion.content);
    
    // Remove the applied suggestion
    setSuggestions(suggestions.filter(s => s !== suggestion));
    
    // If no suggestions left, show a helpful message
    if (suggestions.length === 1) {
      setTimeout(() => {
        setError('All suggestions applied! Generate more or continue editing your resume.');
        setTimeout(() => setError(null), 5000);
      }, 500);
    }
  };

  const getUsagePercentage = () => {
    if (!usageStats) return 0;
    return usageStats.percentUsed;
  };

  const formatResetDate = () => {
    if (!usageStats) return '';
    
    const resetDate = new Date(usageStats.resetDate);
    return resetDate.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTierName = () => {
    if (!usageStats) return 'Free';
    
    switch (usageStats.tier) {
      case 'premium': return 'Premium';
      case 'basic': return 'Basic';
      default: return 'Free';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-float">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <Sparkles size={20} className="mr-2 text-blue-500" />
          AI Assistant
        </h3>
        {usageStats && (
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Activity size={16} className="mr-1" />
            <span className="font-medium">{usageStats.used}/{usageStats.limit}</span>
            <span className="ml-1 text-xs opacity-80">resets {formatResetDate()}</span>
          </div>
        )}
      </div>
      
      {/* Usage information */}
      {usageStats && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1 text-xs text-gray-600 dark:text-gray-400">
            <span>{getTierName()} tier</span>
            <span>{usageStats.remaining} remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${
                getUsagePercentage() > 90 ? 'bg-red-500' : 
                getUsagePercentage() > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={generateSuggestions}
        disabled={isGenerating || usageLimitReached}
        className={`btn-secondary w-full mb-4 group transition-all duration-300 ${
          isGenerating ? 'opacity-70 cursor-not-allowed' : 
          usageLimitReached ? 'opacity-50 cursor-not-allowed bg-gray-400 dark:bg-gray-600' : 
          'hover:bg-blue-600 hover:text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <Sparkles size={20} className="mr-2 animate-spin" />
            Generating suggestions...
          </>
        ) : usageLimitReached ? (
          <>
            <Lock size={20} className="mr-2" />
            Usage limit reached
          </>
        ) : (
          <>
            <Sparkles size={20} className="mr-2 group-hover:animate-pulse" />
            Generate AI suggestions
          </>
        )}
      </button>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {jobDescription ? (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg mb-4 flex items-start">
          <Info size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            Suggestions are optimized for your target job description.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-3 rounded-lg mb-4 flex items-start">
          <Info size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            Add a job description in the first step for better targeted suggestions.
          </p>
        </div>
      )}
      
      <div className="space-y-4 max-h-[calc(100vh-480px)] overflow-y-auto pr-2 scrollbar-thin">
        {suggestions.length === 0 && !isGenerating && !error ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">
            <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
            <p>No suggestions yet. Click the button above to generate suggestions.</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="mb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {suggestion.section.charAt(0).toUpperCase() + suggestion.section.slice(1)}:
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {suggestion.explanation}
                </p>
              </div>
              <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                {typeof suggestion.content === 'string' ? (
                  <p className="text-gray-800 dark:text-gray-200">{suggestion.content}</p>
                ) : Array.isArray(suggestion.content) ? (
                  <ul className="list-disc pl-5 text-gray-800 dark:text-gray-200">
                    {suggestion.content.map((item, i) => (
                      <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <pre className="text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                    {JSON.stringify(suggestion.content, null, 2)}
                  </pre>
                )}
              </div>
              <button
                onClick={() => applySuggestion(suggestion)}
                className="btn-primary text-sm flex items-center hover:bg-green-600 transition-colors"
              >
                <Check size={16} className="mr-2" />
                Apply Suggestion
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
