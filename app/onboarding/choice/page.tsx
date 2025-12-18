"use client";

import React, { useState, useEffect } from 'react';
import { WelcomeMessage } from '@/components/onboarding/WelcomeMessage';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function ChoicePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'company' | 'rep' | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and has a type
    const userType = Cookies.get('userType');
    if (userType) {
      if (userType === 'company') {
        router.push('/onboarding/company');
      } else if (userType === 'rep') {
        router.push('/onboarding/rep');
      }
    }
  }, [router]);

  const handleSelect = (type: 'company' | 'rep') => {
    setSelectedType(type);
    setShowWelcome(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          How do you want to use Harx?
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Choose the role that best describes your goals
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Card */}
          <div 
            onClick={() => handleSelect('company')}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Company</h2>
            <p className="text-gray-600 mb-6">
              I want to hire customer service representatives and manage my team.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Post Gigs & Jobs
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Manage Remote Teams
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Streamlined Payroll
              </li>
            </ul>
          </div>

          {/* Rep Card */}
          <div 
            onClick={() => handleSelect('rep')}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 group"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <svg className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Representative</h2>
            <p className="text-gray-600 mb-6">
              I want to find customer service opportunities and work remotely.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Find Flexible Work
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Build Career Profile
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weekly Payments
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showWelcome && selectedType && (
        <WelcomeMessage 
          type={selectedType} 
          onClose={() => setShowWelcome(false)} 
        />
      )}
    </div>
  );
}
