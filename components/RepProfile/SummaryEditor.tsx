import React, { useState } from 'react';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';

// Import sub-components (we'll implement them below or inline for now)
import ExperienceSection from './sections/ExperienceSection';
// import SkillsSection from './sections/SkillsSection';
// import PersonalInfoSection from './sections/PersonalInfoSection';
// import ProfessionalSummarySection from './sections/ProfessionalSummarySection';

interface SummaryEditorProps {
  profileData: any;
  generatedSummary: string;
  setGeneratedSummary: (summary: string) => void;
  onProfileUpdate: (data: any) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ profileData, generatedSummary, setGeneratedSummary, onProfileUpdate }) => {
  const { updateProfileData, updateExperience, loading } = useProfile();
  
  // State for form
  const [formData, setFormData] = useState(profileData);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await updateProfileData(profileData._id, formData);
        onProfileUpdate(formData); // Update parent state
    } catch (error) {
        console.error("Failed to save profile", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">Profile Editor</h2>
        <p className="text-blue-100 mt-1">Refine your professional profile</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Personal Info Section - simplified inline for now */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                        type="text" 
                        value={formData?.personalInfo?.name || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        value={formData?.personalInfo?.email || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input 
                        type="tel" 
                        value={formData?.personalInfo?.phone || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>
        </div>

        {/* Professional Summary */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Professional Summary</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                    rows={6}
                    value={formData?.professionalSummary?.profileDescription || generatedSummary}
                    onChange={(e) => {
                        setGeneratedSummary(e.target.value); // Also update generated summary prop if needed
                        handleInputChange('professionalSummary', 'profileDescription', e.target.value);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>
        </div>

        {/* Experience Section */}
        <ExperienceSection 
            experiences={formData?.experience || []} 
            onUpdate={(experiences) => setFormData((prev: any) => ({ ...prev, experience: experiences }))}
        />

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryEditor;
