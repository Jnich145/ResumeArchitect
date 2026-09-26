import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface PersonalInfoData {
  profileImage?: string;
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface PersonalInfoProps {
  data: PersonalInfoData;
  updateData: (data: PersonalInfoData) => void;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate function for different field types
  const validate = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return !value.trim() ? 'Full name is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return !phoneRegex.test(value) ? 'Please enter a valid phone number' : '';
      case 'website':
        if (!value.trim()) return ''; // Website is optional
        const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        return !urlRegex.test(value) ? 'Please enter a valid URL' : '';
      default:
        return '';
    }
  };

  // Handle input changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update touched state for this field
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // Validate the field
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Update the data
    updateData({ ...data, [name]: value });
  };

  // Check for validation errors when data changes externally
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    if (data.fullName) newErrors.fullName = validate('fullName', data.fullName);
    if (data.email) newErrors.email = validate('email', data.email);
    if (data.phone) newErrors.phone = validate('phone', data.phone);
    if (data.website) newErrors.website = validate('website', data.website);
    setErrors(newErrors);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // 5MB max size
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ ...data, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle blur event to mark field as touched
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
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

      <div className="mb-4">
        <input
          type="text"
          name="fullName"
          value={data?.fullName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Full Name *"
          className={`input-field ${touched.fullName && errors.fullName ? 'border-red-500' : ''}`}
          required
        />
        {touched.fullName && errors.fullName && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.fullName}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          name="title"
          value={data?.title || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Professional Title"
          className="input-field"
        />
      </div>
      
      <div className="mb-4">
        <input
          type="email"
          name="email"
          value={data?.email || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email *"
          className={`input-field ${touched.email && errors.email ? 'border-red-500' : ''}`}
          required
        />
        {touched.email && errors.email && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.email}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="tel"
          name="phone"
          value={data?.phone || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Phone *"
          className={`input-field ${touched.phone && errors.phone ? 'border-red-500' : ''}`}
          required
        />
        {touched.phone && errors.phone && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.phone}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          name="location"
          value={data?.location || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Location"
          className="input-field"
        />
      </div>
      
      <div className="mb-4">
        <input
          type="url"
          name="website"
          value={data?.website || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Website (Optional)"
          className={`input-field ${touched.website && errors.website ? 'border-red-500' : ''}`}
        />
        {touched.website && errors.website && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.website}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Fields marked with * are required
      </div>
    </div>
  );
};

export default PersonalInfo;
