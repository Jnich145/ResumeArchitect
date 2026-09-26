import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { CertificationItem } from '../../types/resume';

interface CertificationsProps {
  data: CertificationItem[];
  updateData: (data: CertificationItem[]) => void;
}

const Certifications: React.FC<CertificationsProps> = ({ data = [], updateData }) => {
  const addCertification = () => {
    updateData([...data, { name: '', issuer: '', date: '' }]);
  };

  const updateCertification = (index: number, field: keyof CertificationItem, value: string) => {
    const updatedCertifications = [...data];
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value };
    updateData(updatedCertifications);
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = data.filter((_, i) => i !== index);
    updateData(updatedCertifications);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Certifications</h3>
      {data.map((cert, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <input
            type="text"
            value={cert.name}
            onChange={(e) => updateCertification(index, 'name', e.target.value)}
            placeholder="Certification Name"
            className="input-field"
          />
          <input
            type="text"
            value={cert.issuer}
            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
            placeholder="Issuing Organization"
            className="input-field"
          />
          <input
            type="date"
            value={cert.date}
            onChange={(e) => updateCertification(index, 'date', e.target.value)}
            className="input-field"
          />
          <button onClick={() => removeCertification(index)} className="btn-danger flex items-center">
            <Trash size={20} className="mr-2" />
            Remove
          </button>
        </div>
      ))}
      <button onClick={addCertification} className="btn-primary flex items-center mx-auto">
        <Plus size={20} className="mr-2" />
        Add Certification
      </button>
    </div>
  );
};

export default Certifications;
