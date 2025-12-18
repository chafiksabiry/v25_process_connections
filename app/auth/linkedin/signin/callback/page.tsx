"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleLinkedInSignInCallback } from '@/utils/Linkedin';

const LinkedInSignInCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      (async () => {
        try {
          await handleLinkedInSignInCallback(code, state);
          router.push("/app2");
        } catch (err) {
          console.error("LinkedIn sign-in failed:", err);
          router.push("/auth?error=linkedin_auth_failed");
        }
      })();
    }
  }, [router, searchParams]);

  return <p>Signing in with LinkedIn...</p>;
};

export default LinkedInSignInCallback;


