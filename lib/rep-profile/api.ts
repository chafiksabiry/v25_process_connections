import api from './client';

export const getProfile = async (userId?: string) => {
  try {
    // If userId is provided, use it to fetch a specific profile
    // In our backend implementation, GET /profiles uses req.user.userId anyway
    // But let's keep the signature
    const endpoint = userId ? `/profiles/${userId}` : '/profiles';
    const { data } = await api.get(endpoint);
    return data;
  } catch (error: any) {
    console.error(`Error fetching profile${userId ? ` for user ${userId}` : ''}:`, error);
    throw error.response?.data || error;
  }
};

export const createProfile = async (profileData: any) => {
  try {
    const { data } = await api.post('/profiles', profileData);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateBasicInfo = async (id: string, basicInfo: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/basic-info`, basicInfo);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateExperience = async (id: string, experience: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/experience`, { experience });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateSkills = async (id: string, skills: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/skills`, { skills });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (id: string, profileData: any) => {
  try {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Extract basic information from CV
export const extractBasicInfo = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/extract-basic-info', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error extracting basic info from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze work experience from CV
export const analyzeExperience = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-experience', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing work experience from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze skills and languages from CV
export const analyzeSkills = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-skills', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing skills from CV:', error);
    throw error.response?.data || error;
  }
};

// Extract achievements from CV
export const analyzeAchievements = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-achievements', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing achievements from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze availability from CV
export const analyzeAvailability = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-availability', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing availability from CV:', error);
    throw error.response?.data || error;
  }
};

// Generate CV summary
export const generateSummary = async (profileData: any) => {
  try {
    const { data } = await api.post('/cv/generate-summary', { profileData });
    return data;
  } catch (error: any) {
    console.error('Error generating CV summary:', error);
    throw error.response?.data || error;
  }
};

export const getLanguageByCode = async (code: string) => {
    try {
        const { data } = await api.get('/languages');
        const languages = data.data || data;
        return languages.find((l: any) => l.code.toLowerCase() === code.toLowerCase() || l.iso2 === code.toLowerCase());
    } catch (error) {
        console.error('Error fetching language:', error);
        return null;
    }
}

export const updateLanguageAssessment = async (id: string, language: string, proficiency: string, results: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments/language`, {
      language,
      proficiency,
      results
    });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const addContactCenterAssessment = async (id: string, result: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments/contact-center`, result);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const addAssessment = async (id: string, assessment: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments`, assessment);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteProfile = async (id: string) => {
  try {
    await api.delete(`/profiles/${id}`);
    return { success: true };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const analyzeCV = async (text: string) => {
  try {
    const { data } = await api.post('/ai/cv-analysis', { text });
    return data;
  } catch (error: any) {
    console.error('Error analyzing CV:', error);
    throw error.response?.data || error;
  }
};

export const generateSummaryFromProfile = async (profileData: any) => {
  try {
    const { data } = await api.post('/ai/profile-summary', { profileData });
    return data.summary;
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw error.response?.data || error;
  }
};
