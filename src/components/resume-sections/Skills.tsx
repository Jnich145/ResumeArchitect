import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Loader2, MessageCircle, AlertTriangle } from 'lucide-react';
import { generateBulletPoints, improveContent } from '../../services/aiService';

interface SkillsProps {
  data: string[];
  updateData: (data: string[]) => void;
  jobDescription?: string;
}

const Skills: React.FC<SkillsProps> = ({ data, updateData, jobDescription }) => {
  const [newSkill, setNewSkill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  // Preload suggestions when component mounts if we have a job description
  useEffect(() => {
    if (jobDescription && jobDescription.trim().length > 0 && !suggestionsLoaded && data.length < 5) {
      // Only show suggestion modal automatically if user has few skills
      if (data.length < 3) {
        generateSkillSuggestions(false);
      } else {
        // Just preload suggestions but don't show modal
        generateSkillSuggestions(false, false);
      }
    }
  }, [jobDescription, suggestionsLoaded]);

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      // Check if skill already exists (case-insensitive)
      if (!data.some(skill => skill.toLowerCase() === newSkill.trim().toLowerCase())) {
        updateData([...data, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = data.filter(skill => skill !== skillToRemove);
    updateData(updatedSkills);
  };

  const addSuggestedSkill = (skill: string) => {
    // Check if skill already exists (case-insensitive)
    if (!data.some(existingSkill => existingSkill.toLowerCase() === skill.toLowerCase())) {
      updateData([...data, skill]);
      
      // Remove from suggestions to avoid duplicates
      setSuggestedSkills(suggestedSkills.filter(s => s.toLowerCase() !== skill.toLowerCase()));
    }
  };

  const generateSkillSuggestions = async (showModal: boolean = true, showLoadingState: boolean = true) => {
    if (showLoadingState) {
      setIsGenerating(true);
    }
    
    if (showModal) {
      setShowSkillsModal(true);
    }
    
    setError(null);
    
    try {
      // First approach: Use existing skills and job description as context
      const existingSkills = data.join(", ");
      let skillSuggestions: string[] = [];
      
      if (jobDescription && jobDescription.trim()) {
        // Job description + existing skills context
        const context = `Job Description: ${jobDescription}\nExisting Skills: ${existingSkills || "None provided"}`;
        
        try {
          // Try using generateBulletPoints first for a list of skills
          const result = await generateBulletPoints(
            "Extract key skills from this job description that would be relevant for a resume", 
            context
          );
          
          // Extract skills from bullet points
          const extractedSkills = result.bullets
            .flatMap(bullet => bullet.split(/[,.]/).map(s => s.trim()))
            .filter(skill => skill.length > 0);
          
          skillSuggestions = extractedSkills;
        } catch (error) {
          console.error("Error using bullet points approach:", error);
          
          // Fallback to improveContent for a skill list
          try {
            const result = await improveContent('skill', context);
            const skills = result.improvedContent
              .split(/[,.]/)
              .map(s => s.trim())
              .filter(s => s.length > 0);
              
            skillSuggestions = skills;
          } catch (innerError) {
            console.error("Fallback approach also failed:", innerError);
            throw innerError; // Re-throw to be caught by outer catch
          }
        }
      } else {
        // No job description, use generic approach based on existing skills
        const result = await improveContent('skill', 
          `Suggest complementary professional skills to these existing skills: ${existingSkills || "None provided"}`);
        
        const skills = result.improvedContent
          .split(/[,.]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
          
        skillSuggestions = skills;
      }
      
      // Filter out skills that are already in the data list (case-insensitive)
      const filteredSuggestions = skillSuggestions.filter(
        suggestion => !data.some(skill => skill.toLowerCase() === suggestion.toLowerCase())
      );
      
      // Ensure no duplicates in the suggestions themselves
      const uniqueSuggestions = [...new Set(filteredSuggestions)];
      
      setSuggestedSkills(uniqueSuggestions);
      setSuggestionsLoaded(true);
    } catch (error) {
      console.error("Failed to generate skill suggestions:", error);
      setError("Failed to generate skill suggestions. Please try again later.");
    } finally {
      if (showLoadingState) {
        setIsGenerating(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Skills</h3>
      
      {jobDescription && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
            <Sparkles size={14} className="mr-2 text-blue-500" />
            Skills are being tailored based on your target job description.
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {data.map((skill, index) => (
          <div key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 rounded-full flex items-center transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800/60 group">
            {skill}
            <button 
              onClick={() => removeSkill(skill)} 
              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none opacity-70 group-hover:opacity-100"
              aria-label={`Remove ${skill}`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic p-2">
            No skills added yet. Add skills manually or generate suggestions.
          </div>
        )}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill"
          className="input-field rounded-r-none w-full"
        />
        <button 
          onClick={addSkill} 
          className="btn-primary rounded-l-none"
          disabled={!newSkill.trim()}
          aria-label="Add skill"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => generateSkillSuggestions(true, true)}
          disabled={isGenerating}
          className={`text-sm flex items-center gap-2 px-4 py-2 rounded-md ${
            isGenerating
              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-wait"
              : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing job description...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Suggest Relevant Skills
            </>
          )}
        </button>
      </div>
      
      {/* Skills Suggestion Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scaleIn">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <Sparkles size={20} className="text-blue-500 mr-2" />
                AI-Suggested Skills
              </h3>
              <button 
                onClick={() => setShowSkillsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Analyzing job description and your background...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <AlertTriangle size={40} className="text-amber-500 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
                    {error}
                  </p>
                  <button
                    onClick={() => generateSkillSuggestions(true, true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-4"
                  >
                    Try Again
                  </button>
                </div>
              ) : suggestedSkills.length > 0 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {jobDescription ? 
                      "Here are skills relevant to your target job description:" :
                      "Here are complementary professional skills you might want to add:"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {suggestedSkills.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => addSuggestedSkill(skill)}
                        className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                    No additional skill suggestions available at this time. Try adding more details to your job description.
                  </p>
                  <button
                    onClick={() => generateSkillSuggestions(true, true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-2"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {!error && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                  <div className="flex items-start">
                    <MessageCircle size={20} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Click on any skill to add it to your resume. The more detailed your job description, the more relevant the suggested skills will be.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowSkillsModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
