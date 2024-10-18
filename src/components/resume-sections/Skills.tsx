import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const Skills = ({ data, updateData }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      updateData([...data, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = data.filter(skill => skill !== skillToRemove);
    updateData(updatedSkills);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Skills</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {data.map((skill, index) => (
          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center transition-all duration-200 hover:bg-blue-200">
            {skill}
            <button onClick={() => removeSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          className="input-field rounded-r-none"
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
        />
        <button onClick={addSkill} className="btn-primary rounded-l-none">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default Skills;