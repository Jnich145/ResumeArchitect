import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Download,
  Lock
} from 'lucide-react';
import { analyzeResume, analyzeResumeAdvanced, getAtsKeywords } from '../services/atsService';
import { ResumeData } from '../types/resume';

interface ATSScorerProps {
  resumeData: ResumeData;
  isPremium: boolean;
  jobDescription?: string;
}

interface ATSScore {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}

interface ATSAdvancedScore extends ATSScore {
  formatScore: number;
  contentScore: number;
  keywordScore: number;
  redundantPhrases: string[];
  formatIssues: string[];
  contentSuggestions: string[];
  improvedContent?: string;
}

const ATSScorer: React.FC<ATSScorerProps> = ({ 
  resumeData, 
  jobDescription,
  isPremium
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [atsAdvancedScore, setAtsAdvancedScore] = useState<ATSAdvancedScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relevantKeywords, setRelevantKeywords] = useState<string[]>([]);

  // Fetch relevant keywords on component mount or job title change
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        if (!resumeData.personalInfo.title) return;
        
        const keywords = await getAtsKeywords(undefined, resumeData.personalInfo.title);
        setRelevantKeywords(keywords);
      } catch (err) {
        console.error('Failed to fetch keywords:', err);
      }
    };

    fetchKeywords();
  }, [resumeData.personalInfo.title]);

  // Convert resume data to a single string for analysis
  const getResumeContentAsString = (): string => {
    const { personalInfo, summary, experience, education, skills } = resumeData;
    
    const experienceText = experience.map(exp => 
      `${exp.position} at ${exp.company}. ${exp.description}`
    ).join(' ');
    
    const educationText = education.map(edu => 
      `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}.`
    ).join(' ');
    
    return `
      ${personalInfo.fullName}
      ${personalInfo.title}
      ${personalInfo.email}
      ${personalInfo.phone}
      ${personalInfo.location}
      ${summary}
      ${experienceText}
      ${educationText}
      Skills: ${skills.join(', ')}
    `;
  };

  const runATSAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const resumeContent = getResumeContentAsString();
      
      // Run basic analysis for all users
      const basicScore = await analyzeResume(resumeContent, jobDescription);
      setAtsScore(basicScore);
      
      // Run advanced analysis for premium users
      if (isPremium && jobDescription) {
        try {
          const advancedScore = await analyzeResumeAdvanced(resumeContent, jobDescription);
          setAtsAdvancedScore(advancedScore);
          setShowAdvanced(true);
        } catch (err) {
          console.error('Advanced analysis failed:', err);
          // Don't set error here, we still have basic analysis
        }
      }
    } catch (err) {
      console.error('ATS analysis failed:', err);
      setError((err as Error).message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <BarChart3 className="mr-2" />
          ATS Compatibility
        </h3>
      </div>

      {!atsScore ? (
        <div className="space-y-4">
          {jobDescription ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Analyze your resume against the job description to see how well it matches.
            </p>
          ) : (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                Add a job description for more accurate analysis.
              </p>
            </div>
          )}

          {relevantKeywords.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relevant keywords for your role:
              </h4>
              <div className="flex flex-wrap gap-2">
                {relevantKeywords.slice(0, 10).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={runATSAnalysis}
            disabled={isAnalyzing}
            className={`btn-primary w-full ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Analyze Resume</>
            )}
          </button>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mt-4">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Score display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(atsScore.score)}`}>
                {atsScore.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${
                  atsScore.score >= 80 ? 'bg-green-500' : 
                  atsScore.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${atsScore.score}%` }}
              ></div>
            </div>
          </div>

          {/* Advanced score metrics (premium only) */}
          {showAdvanced && atsAdvancedScore && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-3 rounded-lg ${getScoreBackground(atsAdvancedScore.keywordScore)}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400">Keywords</div>
                <div className={`text-xl font-bold ${getScoreColor(atsAdvancedScore.keywordScore)}`}>
                  {atsAdvancedScore.keywordScore}%
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getScoreBackground(atsAdvancedScore.contentScore)}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400">Content</div>
                <div className={`text-xl font-bold ${getScoreColor(atsAdvancedScore.contentScore)}`}>
                  {atsAdvancedScore.contentScore}%
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getScoreBackground(atsAdvancedScore.formatScore)}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400">Format</div>
                <div className={`text-xl font-bold ${getScoreColor(atsAdvancedScore.formatScore)}`}>
                  {atsAdvancedScore.formatScore}%
                </div>
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {atsScore.missingKeywords.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Missing Keywords:
              </h4>
              <div className="flex flex-wrap gap-2">
                {atsScore.missingKeywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggestions:
            </h4>
            <ul className="space-y-2">
              {atsScore.suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  className="flex items-start text-sm"
                >
                  <CheckCircle size={16} className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced analysis (premium only) */}
          {isPremium ? (
            showAdvanced && atsAdvancedScore ? (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-bold text-gray-800 dark:text-white mb-4">Advanced Analysis</h4>
                
                {/* Format issues */}
                {atsAdvancedScore.formatIssues.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format Issues:
                    </h5>
                    <ul className="space-y-2">
                      {atsAdvancedScore.formatIssues.map((issue, index) => (
                        <li 
                          key={index}
                          className="flex items-start text-sm"
                        >
                          <XCircle size={16} className="mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Redundant phrases */}
                {atsAdvancedScore.redundantPhrases.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Consider Replacing:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {atsAdvancedScore.redundantPhrases.map((phrase, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full"
                        >
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content suggestions */}
                {atsAdvancedScore.contentSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Improvements:
                    </h5>
                    <ul className="space-y-2">
                      {atsAdvancedScore.contentSuggestions.map((suggestion, index) => (
                        <li 
                          key={index}
                          className="flex items-start text-sm"
                        >
                          <CheckCircle size={16} className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Download improved content */}
                {atsAdvancedScore.improvedContent && (
                  <button
                    onClick={() => {
                      // Create a blob and download
                      const blob = new Blob([atsAdvancedScore.improvedContent || ''], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'improved-resume-content.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="btn-secondary text-sm flex items-center mt-4"
                  >
                    <Download size={16} className="mr-2" />
                    Download Improved Content
                  </button>
                )}
              </div>
            ) : null
          ) : (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 dark:text-white flex items-center mb-2">
                  <Lock size={16} className="mr-2" />
                  Premium Feature
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upgrade to premium for advanced ATS analysis with detailed scoring, format checking, and AI-powered content suggestions.
                </p>
                <a 
                  href="/pricing" 
                  className="btn-primary text-sm flex items-center justify-center"
                >
                  <ExternalLink size={16} className="mr-2" />
                  View Premium Plans
                </a>
              </div>
            </div>
          )}

          {/* Run again button */}
          <button
            onClick={runATSAnalysis}
            disabled={isAnalyzing}
            className={`btn-secondary mt-6 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" />
                Run Analysis Again
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ATSScorer; 