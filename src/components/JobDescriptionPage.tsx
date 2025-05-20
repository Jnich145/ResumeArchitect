import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';

interface JobDescriptionPageProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
  onNext: () => void;
}

const JobDescriptionPage: React.FC<JobDescriptionPageProps> = ({
  jobDescription,
  setJobDescription,
  onNext
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // Function to extract insights from job description
  const extractInsights = (text: string): string[] => {
    const extracted: string[] = [];
    const techKeywords = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', '.NET',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'REST API', 'GraphQL', 'Microservices', 'Serverless',
      'Machine Learning', 'AI', 'Data Science', 'Big Data',
      'Agile', 'Scrum', 'Kanban', 'JIRA', 'Git', 'GitHub'
    ];
    
    // Extract technical skills
    const foundTechSkills = techKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundTechSkills.length > 0) {
      extracted.push(`Identified key technical skills: ${foundTechSkills.slice(0, 5).join(', ')}${foundTechSkills.length > 5 ? '...' : ''}`);
    }
    
    // Check for experience requirements
    const experienceMatch = text.match(/(\d+)[+\s-]*(?:years|yrs).*experience/i);
    if (experienceMatch) {
      extracted.push(`Looking for ${experienceMatch[1]}+ years of experience`);
    }
    
    // Check for education requirements
    if (text.toLowerCase().includes('bachelor') || text.toLowerCase().includes('degree')) {
      extracted.push('Requires university degree or equivalent experience');
    }
    
    // Check for collaboration emphasis
    if (text.toLowerCase().includes('team') || text.toLowerCase().includes('collaborat')) {
      extracted.push('Emphasizes team collaboration and communication skills');
    }
    
    // Check for methodologies
    if (text.toLowerCase().includes('agile') || text.toLowerCase().includes('scrum')) {
      extracted.push('Expects familiarity with Agile/Scrum methodologies');
    }
    
    // Check for remote work
    if (text.toLowerCase().includes('remote') || text.toLowerCase().includes('work from home')) {
      extracted.push('Offers remote or flexible work arrangements');
    }
    
    // Add default insights if we couldn't extract enough
    if (extracted.length < 3) {
      extracted.push('Values problem-solving abilities and attention to detail');
      
      if (extracted.length < 4) {
        extracted.push('Seeks candidates with strong communication skills');
      }
    }
    
    return extracted;
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract insights from the job description
      const extractedInsights = extractInsights(jobDescription);
      setInsights(extractedInsights);
      
      setAnalyzed(true);
    } catch (error) {
      console.error("Error analyzing job description:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Start with Your Job Description</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Paste the job description you're applying for to get tailored AI suggestions throughout your resume
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
          <FileText className="inline-block mr-2" size={20} />
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to optimize your resume with AI..."
          className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={analyzeJobDescription}
          disabled={!jobDescription.trim() || analyzing}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            !jobDescription.trim() || analyzing
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {analyzing ? (
            <>
              <Sparkles size={20} className="animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={20} className="mr-2" />
              Analyze with AI
            </>
          )}
        </button>

        <button
          onClick={onNext}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue to Resume
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>

      {analyzed && insights.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <Sparkles size={18} className="mr-2 text-blue-500" />
            AI Insights from Job Description
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {insights.map((insight, index) => (
              <li key={index} className="text-blue-700 dark:text-blue-200">
                {insight}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-blue-600 dark:text-blue-300">
            These insights will be used to tailor AI suggestions throughout your resume creation
          </p>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionPage; 