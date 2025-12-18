"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleLinkedInCallback } from '../../../../utils/Linkedin';

const LinkedInCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    console.log(code, state);

    if (code && state) {
      handleLinkedInCallback(code, state)
        .then(() => router.push('/app2')) // Redirect to dashboard on success
        .catch((err) => {
          console.error('LinkedIn authentication failed:', err);
          router.push('/auth?error=linkedin_auth_failed'); // Redirect to login on error
        });
    }
  }, [searchParams, router]);

  return <div>Authenticating with LinkedIn...</div>;
};

export default LinkedInCallback;


