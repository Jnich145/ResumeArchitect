import React from 'react';
import AISuggestionButton from '../AISuggestionButton';

interface SummaryProps {
  data: string;
  updateData: (data: string) => void;
  jobDescription?: string;
}

const Summary: React.FC<SummaryProps> = ({ data, updateData, jobDescription }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Professional Summary</h3>
      
      {jobDescription && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Using job description to optimize your professional summary. The AI will tailor suggestions based on the job requirements.
          </p>
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={data}
          onChange={(e) => updateData(e.target.value)}
          placeholder="Write a brief professional summary..."
          className="input-field h-40 resize-none pr-10"
          rows={6}
        />
        <AISuggestionButton
          fieldType="summary"
          currentContent={jobDescription ? `Job Description: ${jobDescription}\nSummary: ${data}` : data}
          onApplySuggestion={updateData}
        />
      </div>
    </div>
  );
};

export default Summary;
