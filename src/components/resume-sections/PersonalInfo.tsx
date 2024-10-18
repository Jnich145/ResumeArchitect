import React from 'react';
import { Camera } from 'lucide-react';

const PersonalInfo = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ ...data, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Personal Information</h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {data?.profileImage ? (
            <img src={data.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Camera size={32} />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload profile picture</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">(Optional)</p>
        </div>
      </div>
      <input
        type="text"
        name="fullName"
        value={data?.fullName || ''}
        onChange={handleChange}
        placeholder="Full Name"
        className="input-field"
      />
      <input
        type="text"
        name="title"
        value={data?.title || ''}
        onChange={handleChange}
        placeholder="Professional Title"
        className="input-field"
      />
      <input
        type="email"
        name="email"
        value={data?.email || ''}
        onChange={handleChange}
        placeholder="Email"
        className="input-field"
      />
      <input
        type="tel"
        name="phone"
        value={data?.phone || ''}
        onChange={handleChange}
        placeholder="Phone"
        className="input-field"
      />
      <input
        type="text"
        name="location"
        value={data?.location || ''}
        onChange={handleChange}
        placeholder="Location"
        className="input-field"
      />
      <input
        type="url"
        name="website"
        value={data?.website || ''}
        onChange={handleChange}
        placeholder="Website (Optional)"
        className="input-field"
      />
    </div>
  );
};

export default PersonalInfo;
