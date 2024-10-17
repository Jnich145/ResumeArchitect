import React from 'react';
import { Plus, Trash } from 'lucide-react';

const Experience = ({ data, updateData }) => {
  const addExperience = () => {
    updateData([...data, { company: '', position: '', startDate: '', endDate: '', isPresent: false, description: '' }]);
  };

  const updateExperience = (index, field, value) => {
    const updatedExperience = [...data];
    updatedExperience[index][field] = value;
    updateData(updatedExperience);
  };

  const removeExperience = (index) => {
    const updatedExperience = data.filter((_, i) => i !== index);
    updateData(updatedExperience);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Work Experience</h3>
      {data.map((exp, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <input
            type="text"
            value={exp.company || ''}
            onChange={(e) => updateExperience(index, 'company', e.target.value)}
            placeholder="Company"
            className="input-field"
          />
          <input
            type="text"
            value={exp.position || ''}
            onChange={(e) => updateExperience(index, 'position', e.target.value)}
            placeholder="Position"
            className="input-field"
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={exp.startDate || ''}
              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
              className="input-field w-1/2"
            />
            <div className="w-1/2 flex space-x-2">
              <input
                type="date"
                value={exp.endDate || ''}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                className={`input-field flex-grow ${exp.isPresent ? 'opacity-50' : ''}`}
                disabled={exp.isPresent}
              />
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={exp.isPresent || false}
                  onChange={(e) => {
                    updateExperience(index, 'isPresent', e.target.checked);
                    if (e.target.checked) {
                      updateExperience(index, 'endDate', '');
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span>Present</span>
              </label>
            </div>
          </div>
          <textarea
            value={exp.description || ''}
            onChange={(e) => updateExperience(index, 'description', e.target.value)}
            placeholder="Job description"
            className="input-field h-32 resize-none"
            rows={4}
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