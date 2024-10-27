import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { EducationItem } from '../../types/resume';

interface EducationProps {
  data: EducationItem[];
  updateData: (data: EducationItem[]) => void;
}

const Education: React.FC<EducationProps> = ({ data = [], updateData }) => {
  const addEducation = () => {
    updateData([...data, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isPresent: false }]);
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string | boolean) => {
    const updatedEducation = [...data];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    updateData(updatedEducation);
  };

  const removeEducation = (index: number) => {
    const updatedEducation = data.filter((_, i) => i !== index);
    updateData(updatedEducation);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Education</h3>
      {data.map((edu, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <input
            type="text"
            value={edu.institution}
            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
            placeholder="Institution"
            className="input-field"
          />
          <input
            type="text"
            value={edu.degree}
            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
            placeholder="Degree"
            className="input-field"
          />
          <input
            type="text"
            value={edu.fieldOfStudy}
            onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
            placeholder="Field of Study"
            className="input-field"
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={edu.startDate}
              onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
              className="input-field w-1/2"
            />
            <input
              type="date"
              value={edu.endDate}
              onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
              className="input-field w-1/2"
              disabled={edu.isPresent}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={edu.isPresent}
              onChange={(e) => updateEducation(index, 'isPresent', e.target.checked)}
              className="mr-2"
            />
            <label>Currently studying here</label>
          </div>
          <button onClick={() => removeEducation(index)} className="btn-danger flex items-center">
            <Trash size={20} className="mr-2" />
            Remove
          </button>
        </div>
      ))}
      <button onClick={addEducation} className="btn-primary flex items-center mx-auto">
        <Plus size={20} className="mr-2" />
        Add Education
      </button>
    </div>
  );
};

export default Education;
