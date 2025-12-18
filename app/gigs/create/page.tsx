'use client';

import React from 'react';
import { GigCreator } from '@/components/Gigs/wizard/GigCreator';
import { SectionHeader } from '@/components/Gigs/wizard/SectionHeader';
import { SectionContent } from '@/components/Gigs/wizard/SectionContent';
// Import other section components as they are migrated

// Temporary placeholders for missing components
const BasicSection = ({ data, onChange, errors }: any) => (
  <div>
    <h3 className="text-lg font-medium">Basic Info</h3>
    <input 
      type="text" 
      value={data.title} 
      onChange={(e) => onChange({...data, title: e.target.value})} 
      className="border p-2 rounded w-full mt-2"
      placeholder="Gig Title"
    />
    {/* Add more fields */}
  </div>
);

const ScheduleSection = () => <div>Schedule Section Placeholder</div>;
const CommissionSection = () => <div>Commission Section Placeholder</div>;
const SkillsSection = () => <div>Skills Section Placeholder</div>;
const TeamForm = () => <div>Team Form Placeholder</div>;

export default function GigCreationPage() {
  return (
    <GigCreator>
      {({
        data,
        onChange,
        errors,
        onPrevious,
        onNext,
        onSave,
        onAIAssist,
        onReview,
        currentSection,
        isLastSection
      }) => {
        const renderSection = () => {
          switch (currentSection) {
            case 'basic':
              return <BasicSection data={data} onChange={onChange} errors={errors} />;
            case 'schedule':
              return <ScheduleSection />;
            case 'commission':
              return <CommissionSection />;
            case 'skills':
              return <SkillsSection />;
            case 'team':
              return <TeamForm />;
            default:
              return null;
          }
        };

        return (
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create New Gig</h1>
                <button onClick={onAIAssist} className="bg-purple-600 text-white px-4 py-2 rounded">
                    AI Assist
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                {renderSection()}
             </div>

             <div className="flex justify-between mt-6 pt-4 border-t">
                <button onClick={onPrevious} disabled={currentSection === 'basic'} className="px-4 py-2 border rounded disabled:opacity-50">
                    Previous
                </button>
                <div className="space-x-2">
                    <button onClick={onSave} className="px-4 py-2 border rounded">
                        Save Draft
                    </button>
                    {isLastSection ? (
                        <button onClick={onReview} className="px-4 py-2 bg-green-600 text-white rounded">
                            Review
                        </button>
                    ) : (
                        <button onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded">
                            Next
                        </button>
                    )}
                </div>
             </div>
          </div>
        );
      }}
    </GigCreator>
  );
}

