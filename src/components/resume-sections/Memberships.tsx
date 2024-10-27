import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { MembershipItem } from '../../types/resume';

interface MembershipsProps {
  data: MembershipItem[];
  updateData: (data: MembershipItem[]) => void;
}

const Memberships: React.FC<MembershipsProps> = ({ data = [], updateData }) => {
  const addMembership = () => {
    updateData([...data, { organization: '', role: '', startDate: '', endDate: '' }]);
  };

  const updateMembership = (index: number, field: keyof MembershipItem, value: string) => {
    const updatedMemberships = [...data];
    updatedMemberships[index] = { ...updatedMemberships[index], [field]: value };
    updateData(updatedMemberships);
  };

  const removeMembership = (index: number) => {
    const updatedMemberships = data.filter((_, i) => i !== index);
    updateData(updatedMemberships);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Memberships</h3>
      {data.map((membership, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-lg">
          <input
            type="text"
            value={membership.organization}
            onChange={(e) => updateMembership(index, 'organization', e.target.value)}
            placeholder="Organization Name"
            className="input-field"
          />
          <input
            type="text"
            value={membership.role}
            onChange={(e) => updateMembership(index, 'role', e.target.value)}
            placeholder="Your Role"
            className="input-field"
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={membership.startDate}
              onChange={(e) => updateMembership(index, 'startDate', e.target.value)}
              className="input-field w-1/2"
            />
            <input
              type="date"
              value={membership.endDate}
              onChange={(e) => updateMembership(index, 'endDate', e.target.value)}
              className="input-field w-1/2"
            />
          </div>
          <button onClick={() => removeMembership(index)} className="btn-danger flex items-center">
            <Trash size={20} className="mr-2" />
            Remove
          </button>
        </div>
      ))}
      <button onClick={addMembership} className="btn-primary flex items-center mx-auto">
        <Plus size={20} className="mr-2" />
        Add Membership
      </button>
    </div>
  );
};

export default Memberships;
