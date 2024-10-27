import React from 'react';

interface SummaryProps {
  data: string;
  updateData: (data: string) => void;
}

const Summary: React.FC<SummaryProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Professional Summary</h3>
      <textarea
        value={data}
        onChange={(e) => updateData(e.target.value)}
        placeholder="Write a brief professional summary..."
        className="input-field h-40 resize-none"
        rows={6}
      />
    </div>
  );
};

export default Summary;
