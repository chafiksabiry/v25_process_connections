import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getProfile } = useProfile();

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token') || localStorage.getItem('token');
      const userId = Cookies.get('userId');

      if (!token || !userId) {
        // Redirect to login if no auth data
        // router.push('/auth/login'); 
        // For now, don't redirect strictly to allow viewing components, 
        // but set loading false
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile using the rep profile hook for consistency
        const profile = await getProfile(userId);
        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [getProfile, router]);

  return { user, loading };
};

