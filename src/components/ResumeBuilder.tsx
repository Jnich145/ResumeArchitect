import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PersonalInfo from './resume-sections/PersonalInfo';
import Summary from './resume-sections/Summary';
import Experience from './resume-sections/Experience';
import Education from './resume-sections/Education';
import Skills from './resume-sections/Skills';
import Certifications from './resume-sections/Certifications';
import Memberships from './resume-sections/Memberships';
import AIAssistant from './AIAssistant';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import ErrorBoundary from './ErrorBoundary';
import { Save, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { ResumeData } from '../types/resume';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const initialResumeData: ResumeData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', profileImage: undefined, title: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  memberships: []
};

const sections = [
  { id: 'personal-info', name: 'Personal Info', component: PersonalInfo },
  { id: 'summary', name: 'Summary', component: Summary },
  { id: 'experience', name: 'Experience', component: Experience },
  { id: 'education', name: 'Education', component: Education },
  { id: 'skills', name: 'Skills', component: Skills },
  { id: 'certifications', name: 'Certifications', component: Certifications },
  { id: 'memberships', name: 'Memberships', component: Memberships },
];

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const navigate = useNavigate();
  const location = useLocation();
  const { section } = useParams();

  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setResumeData({ ...initialResumeData, ...parsedData });
      } catch (error) {
        console.error('Error parsing saved resume data:', error);
      }
    }
  }, []);

  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSave = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    alert('Resume data saved successfully!');
  };

  const handleExport = async () => {
    if (resumeRef.current) {
      const canvas = await html2canvas(resumeRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('resume.pdf');
    }
  };

  const currentSectionIndex = sections.findIndex(s => s.id === section);
  const CurrentSection = sections[currentSectionIndex]?.component;

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      navigate(`/build/${sections[currentSectionIndex + 1].id}`);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      navigate(`/build/${sections[currentSectionIndex - 1].id}`);
    } else {
      navigate('/build');
    }
  };

  const resumeRef = useRef<HTMLDivElement>(null);

  if (location.pathname === '/build') {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center text-gray-800 dark:text-white">Build Your Resume</h1>
          <div className="space-y-6">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => navigate(`/build/${section.id}`)}
                className="w-full py-5 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <span className="text-xl font-medium text-gray-800 dark:text-white">{section.name}</span>
                <ArrowRight className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">Build Your Resume</h1>
          <div className="flex justify-center">
            {sections.map((s, index) => (
              <div
                key={s.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-1 ${
                  index <= currentSectionIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3 card">
            <h2 className="section-title">{sections[currentSectionIndex]?.name}</h2>
            <ErrorBoundary>
              {CurrentSection && (
                <CurrentSection
                  data={resumeData[sections[currentSectionIndex].id.replace('-', '') as keyof ResumeData] as any}
                  updateData={(data: any) => updateResumeData(sections[currentSectionIndex].id.replace('-', '') as keyof ResumeData, data)}
                />
              )}
            </ErrorBoundary>
            <div className="mt-12 flex justify-between">
              <button onClick={goToPreviousSection} className="btn-secondary flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
              <button onClick={goToNextSection} className="btn-primary flex items-center">
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-8">
            <ErrorBoundary>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                resumeData={resumeData}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <AIAssistant resumeData={resumeData} updateResumeData={updateResumeData} />
            </ErrorBoundary>
            <div ref={resumeRef}>
              <ErrorBoundary>
                <ResumePreview resumeData={resumeData} selectedTemplate={selectedTemplate} />
              </ErrorBoundary>
            </div>
            <div className="flex space-x-4">
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Save
              </button>
              <button onClick={handleExport} className="btn-secondary flex-1 flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
