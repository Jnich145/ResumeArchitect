import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { ExperienceItem } from '../../types/resume';

interface ExperienceProps {
  data: ExperienceItem[];
  updateData: (data: ExperienceItem[]) => void;
}

const Experience: React.FC<ExperienceProps> = ({ data = [], updateData }) => {
  const addExperience = () => {
    updateData([...data, { company: '', position: '', startDate: '', endDate: '', isPresent: false, description: '' }]);
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string | boolean) => {
    const updatedExperience = [...data];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    updateData(updatedExperience);
  };

  const removeExperience = (index: number) => {
    const updatedExperience = data.filter((_, i) => i !== index);
    updateData(updatedExperience);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Experience</h3>
      {data.map((exp, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <input
            type="text"
            value={exp.company}
            onChange={(e) => updateExperience(index, 'company', e.target.value)}
            placeholder="Company"
            className="input-field"
          />
          <input
            type="text"
            value={exp.position}
            onChange={(e) => updateExperience(index, 'position', e.target.value)}
            placeholder="Position"
            className="input-field"
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={exp.startDate}
              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
              className="input-field w-1/2"
            />
            <input
              type="date"
              value={exp.endDate}
              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
              className="input-field w-1/2"
              disabled={exp.isPresent}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={exp.isPresent}
              onChange={(e) => updateExperience(index, 'isPresent', e.target.checked)}
              className="mr-2"
            />
            <label>I currently work here</label>
          </div>
          <textarea
            value={exp.description}
            onChange={(e) => updateExperience(index, 'description', e.target.value)}
            placeholder="Job Description"
            className="input-field h-32 resize-none"
          />
          <button onClick={() => removeExperience(index)} className="btn-danger flex items-center">
            <Trash size={20} className="mr-2" />
            Remove
          </button>
        </div>
      ))}
      <button onClick={addExperience} className="btn-primary flex items-center mx-auto">
        <Plus size={20} className="mr-2" />
        Add Experience
      </button>
    </div>
  );
};

export default Experience;
