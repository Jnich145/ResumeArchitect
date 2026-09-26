import React, { useState, useEffect } from 'react';
import { Plus, Trash, AlertCircle, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { ExperienceItem } from '../../types/resume';
import { improveContent } from '../../services/aiService';

interface ExperienceProps {
  data: ExperienceItem[];
  updateData: (data: ExperienceItem[]) => void;
  jobDescription?: string; // Add job description prop
}

interface ValidationErrors {
  [key: number]: {
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    isPresent?: string;
  };
}

interface BulletSuggestion {
  text: string;
  selected: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ data = [], updateData, jobDescription }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: number]: { [field: string]: boolean } }>({});
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const [bulletSuggestions, setBulletSuggestions] = useState<{ [key: number]: BulletSuggestion[] }>({});

  // Validate a specific field in an experience item
  const validateField = (index: number, field: keyof ExperienceItem, value: string): string => {
    switch (field) {
      case 'company':
        return !value.trim() ? 'Company name is required' : '';
      case 'position':
        return !value.trim() ? 'Position is required' : '';
      case 'startDate':
        return !value ? 'Start date is required' : '';
      case 'endDate':
        if (data[index].isPresent) return '';
        if (!value) return 'End date is required';
        
        // Check if end date is after start date
        const startDate = new Date(data[index].startDate);
        const endDate = new Date(value);
        return startDate > endDate ? 'End date must be after start date' : '';
      case 'description':
        return !value.trim() ? 'Description is required' : '';
      default:
        return '';
    }
  };

  // Validate an entire experience item
  const validateExperience = (exp: ExperienceItem, index: number) => {
    const itemErrors: ValidationErrors[number] = {};
    
    if (!exp.company.trim()) itemErrors.company = 'Company name is required';
    if (!exp.position.trim()) itemErrors.position = 'Position is required';
    if (!exp.startDate) itemErrors.startDate = 'Start date is required';
    
    if (!exp.isPresent && !exp.endDate) {
      itemErrors.endDate = 'End date is required';
    } else if (!exp.isPresent && exp.startDate && exp.endDate) {
      const startDate = new Date(exp.startDate);
      const endDate = new Date(exp.endDate);
      if (startDate > endDate) {
        itemErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!exp.description.trim()) itemErrors.description = 'Description is required';
    
    return itemErrors;
  };

  // Validate all experience items
  const validateAllExperiences = () => {
    const newErrors: ValidationErrors = {};
    data.forEach((exp, index) => {
      const itemErrors = validateExperience(exp, index);
      if (Object.keys(itemErrors).length > 0) {
        newErrors[index] = itemErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initial validation of all items
  useEffect(() => {
    validateAllExperiences();
  }, []);

  const addExperience = () => {
    const newIndex = data.length;
    updateData([...data, { company: '', position: '', startDate: '', endDate: '', isPresent: false, description: '' }]);
    
    // Initialize touched and errors for the new item
    setTouched(prev => ({
      ...prev,
      [newIndex]: {}
    }));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string | boolean) => {
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [field]: true
      }
    }));

    // Update the data
    const updatedExperience = [...data];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    // Special case: If isPresent is true, clear end date error
    if (field === 'isPresent' && value === true) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index].endDate;
        }
        return newErrors;
      });
    } else if (typeof value === 'string') {
      // Validate the field if it's a string value
      const error = validateField(index, field, value);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (!newErrors[index]) newErrors[index] = {};
        
        if (error) {
          newErrors[index][field] = error;
        } else {
          delete newErrors[index][field];
          // If all errors for this index are cleared, remove the index
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        
        return newErrors;
      });
    }
    
    updateData(updatedExperience);
  };

  const removeExperience = (index: number) => {
    // Create a new array without the removed item
    const updatedExperience = data.filter((_, i) => i !== index);
    updateData(updatedExperience);
    
    // Update errors and touched state by removing the index and shifting higher indices
    setErrors(prev => {
      const newErrors: ValidationErrors = {};
      
      for (const key in prev) {
        const idx = parseInt(key);
        if (idx < index) {
          newErrors[idx] = prev[idx];
        } else if (idx > index) {
          newErrors[idx - 1] = prev[idx];
        }
      }
      
      return newErrors;
    });
    
    setTouched(prev => {
      const newTouched: typeof touched = {};
      
      for (const key in prev) {
        const idx = parseInt(key);
        if (idx < index) {
          newTouched[idx] = prev[idx];
        } else if (idx > index) {
          newTouched[idx - 1] = prev[idx];
        }
      }
      
      return newTouched;
    });
    
    // Also remove bullet suggestions for this index
    setBulletSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      
      // Shift higher indices
      Object.keys(newSuggestions).forEach(key => {
        const idx = parseInt(key);
        if (idx > index) {
          newSuggestions[idx - 1] = newSuggestions[idx];
          delete newSuggestions[idx];
        }
      });
      
      return newSuggestions;
    });
  };

  const handleBlur = (index: number, field: string) => {
    // Mark the field as touched
    setTouched(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [field]: true
      }
    }));
  };
  
  // Generate bullet points for job description
  const generateBullets = async (index: number, currentDescription: string) => {
    if (!currentDescription.trim()) {
      return;
    }
    
    setIsGenerating(index);
    
    try {
      // Prepare context from job description, position, company
      const context = `
        ${jobDescription ? `Job Description: ${jobDescription}\n` : ''}
        Position: ${data[index].position}
        Company: ${data[index].company}
        Current Description: ${currentDescription}
      `;
      
      // Generate bullet point options - use Promise.all to generate multiple suggestions at once
      const promises = [];
      for (let i = 0; i < 4; i++) {
        // Add a random seed and index to ensure different results from each request
        const randomSeed = Math.random().toString(36).substring(2, 8);
        promises.push(improveContent('bullet_point', `${context} [RequestIndex:${i}][Seed:${randomSeed}][Timestamp:${Date.now()}]`));
      }
      
      const results = await Promise.all(promises);
      
      // Map results to text for easier processing
      const resultTexts = results.map(result => result.improvedContent);
      
      // Filter out any duplicates and empty results
      const uniqueResults = [...new Set(resultTexts)].filter(text => text && text.trim() !== '');
      
      // If we ended up with fewer than 3 unique results, generate more
      if (uniqueResults.length < 3) {
        console.log("Not enough unique results, generating extras");
        const additionalPromises = [];
        for (let i = 0; i < Math.max(1, 4 - uniqueResults.length); i++) {
          const randomSeed = Math.random().toString(36).substring(2, 8);
          additionalPromises.push(improveContent('bullet_point', 
            `${context} [AdditionalRequest:true][RequestIndex:${i+4}][Seed:${randomSeed}][Timestamp:${Date.now()}]`));
        }
        
        const additionalResults = await Promise.all(additionalPromises);
        
        // Add new unique results
        for (const result of additionalResults) {
          if (result.improvedContent && !uniqueResults.includes(result.improvedContent)) {
            uniqueResults.push(result.improvedContent);
          }
        }
      }
      
      // Convert to suggestion objects and limit to 4 suggestions
      const suggestions = uniqueResults.slice(0, 4).map(text => ({
        text,
        selected: false
      }));
      
      // Only update if we actually have suggestions
      if (suggestions.length > 0) {
        setBulletSuggestions(prev => ({
          ...prev,
          [index]: suggestions
        }));
      } else {
        // Error handling if no suggestions were generated
        setErrors(prev => {
          const newErrors = { ...prev };
          if (!newErrors[index]) newErrors[index] = {};
          newErrors[index].description = 'Failed to generate bullet points. Try adding more details.';
          setTimeout(() => {
            setErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors[index]) {
                delete newErrors[index].description;
                if (Object.keys(newErrors[index]).length === 0) {
                  delete newErrors[index];
                }
              }
              return newErrors;
            });
          }, 3000);
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error generating bullet suggestions:', error);
      
      // Show error message
      setErrors(prev => {
        const newErrors = { ...prev };
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index].description = 'Failed to generate suggestions. Try again later.';
        setTimeout(() => {
          setErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors[index]) {
              delete newErrors[index].description;
              if (Object.keys(newErrors[index]).length === 0) {
                delete newErrors[index];
              }
            }
            return newErrors;
          });
        }, 3000);
        return newErrors;
      });
    } finally {
      setIsGenerating(null);
    }
  };
  
  // Add selected bullet to description
  const addBulletToDescription = (index: number, bulletIndex: number) => {
    const bullet = bulletSuggestions[index][bulletIndex];
    
    // Toggle selection
    setBulletSuggestions(prev => {
      const updatedSuggestions = [...prev[index]];
      updatedSuggestions[bulletIndex] = {
        ...updatedSuggestions[bulletIndex],
        selected: !updatedSuggestions[bulletIndex].selected
      };
      
      return {
        ...prev,
        [index]: updatedSuggestions
      };
    });
    
    // If it was not selected before, add it to the description
    if (!bullet.selected) {
      // Get current description
      const currentDescription = data[index].description;
      // Add bullet point, ensuring proper formatting
      const updatedDescription = currentDescription
        ? `${currentDescription.trim()}\n• ${bullet.text}`
        : `• ${bullet.text}`;
      
      // Update the experience
      updateExperience(index, 'description', updatedDescription);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Experience</h3>
      {data.map((exp, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <div>
            <input
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(index, 'company', e.target.value)}
              onBlur={() => handleBlur(index, 'company')}
              placeholder="Company *"
              className={`input-field ${touched[index]?.company && errors[index]?.company ? 'border-red-500' : ''}`}
            />
            {touched[index]?.company && errors[index]?.company && (
              <div className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors[index].company}
              </div>
            )}
          </div>
          
          <div>
            <input
              type="text"
              value={exp.position}
              onChange={(e) => updateExperience(index, 'position', e.target.value)}
              onBlur={() => handleBlur(index, 'position')}
              placeholder="Position *"
              className={`input-field ${touched[index]?.position && errors[index]?.position ? 'border-red-500' : ''}`}
            />
            {touched[index]?.position && errors[index]?.position && (
              <div className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors[index].position}
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <input
                type="date"
                value={exp.startDate}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                onBlur={() => handleBlur(index, 'startDate')}
                className={`input-field w-full ${touched[index]?.startDate && errors[index]?.startDate ? 'border-red-500' : ''}`}
              />
              {touched[index]?.startDate && errors[index]?.startDate && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors[index].startDate}
                </div>
              )}
            </div>
            
            <div className="w-1/2">
              <input
                type="date"
                value={exp.endDate}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                onBlur={() => handleBlur(index, 'endDate')}
                className={`input-field w-full ${touched[index]?.endDate && errors[index]?.endDate ? 'border-red-500' : ''}`}
                disabled={exp.isPresent}
              />
              {touched[index]?.endDate && errors[index]?.endDate && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors[index].endDate}
                </div>
              )}
            </div>
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
          
          <div>
            <div className="relative">
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                onBlur={() => handleBlur(index, 'description')}
                placeholder="Job Description * (Enter details about your role and responsibilities)"
                className={`input-field h-32 resize-none ${touched[index]?.description && errors[index]?.description ? 'border-red-500' : ''}`}
              />
            </div>
            
            {/* Bullet Point Generator Button */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => generateBullets(index, exp.description)}
                disabled={isGenerating !== null}
                className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-md ${
                  isGenerating !== null
                    ? "bg-gray-200 text-gray-500 cursor-wait"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {isGenerating === index ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating bullets...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Bullet Points
                  </>
                )}
              </button>
            </div>
            
            {/* Bullet Point Suggestions */}
            {bulletSuggestions[index] && bulletSuggestions[index].length > 0 && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <Sparkles size={14} className="text-blue-500 mr-1" />
                  AI Generated Bullet Points (click to add)
                </h4>
                <div className="space-y-2">
                  {bulletSuggestions[index].map((bullet, bulletIndex) => (
                    <button
                      key={bulletIndex}
                      onClick={() => addBulletToDescription(index, bulletIndex)}
                      className={`text-left w-full p-2 rounded text-sm transition-colors ${
                        bullet.selected 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" 
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {bullet.text}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <MessageCircle size={12} className="mr-1" />
                  Don't like these options? Add more details to your job description for better suggestions.
                </div>
              </div>
            )}
            
            {touched[index]?.description && errors[index]?.description && (
              <div className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors[index].description}
              </div>
            )}
          </div>
          
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
      
      <div className="mt-2 text-xs text-gray-500">
        Fields marked with * are required
      </div>
    </div>
  );
};

export default Experience;
