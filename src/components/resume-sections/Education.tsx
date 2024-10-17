import React from 'react';
import { Plus, Trash } from 'lucide-react';

const Education = ({ data, updateData }) => {
  const addEducation = () => {
    updateData([...data, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isPresent: false }]);
  };

  const updateEducation = (index, field, value) => {
    const updatedEducation = [...data];
    updatedEducation[index][field] = value;
    updateData(updatedEducation);
  };

  const removeEducation = (index) => {
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
            value={edu.institution || ''}
            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
            placeholder="Institution"
            className="input-field"
          />
          <input
            type="text"
            value={edu.degree || ''}
            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
            placeholder="Degree"
            className="input-field"
          />
          <input
            type="text"
            value={edu.fieldOfStudy || ''}
            onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
            placeholder="Field of Study"
            className="input-field"
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={edu.startDate || ''}
              onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
              className="input-field w-1/2"
            />
            <div className="w-1/2 flex space-x-2">
              <input
                type="date"
                value={edu.endDate || ''}
                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                className={`input-field flex-grow ${edu.isPresent ? 'opacity-50' : ''}`}
                disabled={edu.isPresent}
              />
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={edu.isPresent || false}
                  onChange={(e) => {
                    updateEducation(index, 'isPresent', e.target.checked);
                    if (e.target.checked) {
                      updateEducation(index, 'endDate', '');
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span>Present</span>
              </label>
            </div>
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