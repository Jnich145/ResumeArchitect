import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumes, deleteResume, createResume } from '../services/resumeService';
import { FilePlus, Trash2, Edit, Copy, Share2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initialResumeData } from './ResumeBuilder';

interface Resume {
  id: string;
  name: string;
  lastModified: string;
  template: string;
  isPublic: boolean;
  slug?: string;
  createdAt: string;
}

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getResumes();
      setResumes(response.resumes || []);
    } catch (error) {
      setError('Failed to load resumes. Please try again later.');
      console.error('Error fetching resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newResumeName.trim()) {
      return;
    }

    try {
      setIsCreating(true);
      const response = await createResume({
        name: newResumeName,
        data: initialResumeData,
      });

      // Close modal and reset form
      setShowCreateModal(false);
      setNewResumeName('');
      
      // Navigate to the resume builder with the new resume ID
      navigate(`/build/personal-info?resumeId=${response.resume.id}`);
    } catch (error) {
      setError('Failed to create resume. Please try again.');
      console.error('Error creating resume:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteResume(id);
      // Refresh the list
      fetchResumes();
    } catch (error) {
      setError('Failed to delete resume. Please try again.');
      console.error('Error deleting resume:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && resumes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Resumes</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <FilePlus className="w-5 h-5 mr-2" />
          New Resume
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            You don't have any resumes yet
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
          >
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Last Modified</th>
                <th className="py-3 px-4 text-left">Template</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {resumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">{resume.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(resume.lastModified)}
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize">{resume.template}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/build/personal-info?resumeId=${resume.id}`)}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id, resume.name)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {resume.isPublic && resume.slug && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/r/${resume.slug}`);
                            alert('Share link copied to clipboard!');
                          }}
                          className="p-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Copy share link"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Resume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New Resume</h3>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Resume Name</label>
              <input
                type="text"
                value={newResumeName}
                onChange={(e) => setNewResumeName(e.target.value)}
                placeholder="My Professional Resume"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewResumeName('');
                }}
                className="btn-secondary"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary"
                disabled={isCreating || !newResumeName.trim()}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Resume'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeList; 