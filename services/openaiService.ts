import OpenAI from 'openai';
import { CompanyProfile } from '@/lib/company/api';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not configured');
}

class OpenAIService {
  async searchCompanyLogo(companyName: string, companyWebsite?: string) {
    if (!apiKey) throw new Error('OpenAI API key is not configured');

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Updated to a more recent and available model
      messages: [
        {
          role: "system",
          content: `You are a logo finder assistant. Based on the company name and website, provide the most likely URL for the company's logo. 
          Return only the direct URL to the logo image, or null if you cannot find a reliable logo URL.
          Common logo URL patterns:
          - https://company.com/logo.png
          - https://company.com/assets/logo.svg
          - https://company.com/images/logo.jpg
          - https://logo.clearbit.com/company.com (for Clearbit logo service)
          
          If no direct logo URL is available, use Clearbit's logo service: https://logo.clearbit.com/[domain]
          Return only the URL string, no explanations.`,
        },
        {
          role: "user",
          content: `Find the logo URL for company: ${companyName}${companyWebsite ? ` (Website: ${companyWebsite})` : ''}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    const logoUrl = content && !content.toLowerCase().includes('null') ? content.trim() : null;
    return { logoUrl };
  }

  async generateCompanyProfile(companyInfo: string, userId?: string) {
    if (!apiKey) {
      console.error('[OpenAI Service] API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    if (!companyInfo || typeof companyInfo !== 'string' || companyInfo.trim().length === 0) {
      console.error('[OpenAI Service] Invalid companyInfo provided:', {
        type: typeof companyInfo,
        length: companyInfo?.length
      });
      throw new Error('Company info must be a non-empty string');
    }

    const openai = new OpenAI({ 
      apiKey,
      timeout: 60000, // 60 seconds timeout
    });

    try {
      console.log('[OpenAI Service] Making OpenAI API call...', {
        model: 'gpt-4o-mini',
        companyInfoLength: companyInfo.length,
        userId
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Updated to a more recent and available model
        response_format: { type: "json_object" },
        messages: [
        {
          role: "system",
          content: `You are a professional company profiler. Create a detailed company profile in JSON format based on the provided information. 
          The JSON response must include ALL of the following fields:
          {
            "name": "string",
            "industry": "string",
            "founded": "string (year)",
            "headquarters": "string (location)",
            "overview": "string (detailed company description)",
            "mission": "string (company mission statement)",
            "culture": {
              "values": ["array of at least 3 company values"],
              "benefits": ["array of at least 3 company benefits"],
              "workEnvironment": "string (detailed description)"
            },
            "opportunities": {
              "roles": ["array of at least 3 available roles"],
              "growthPotential": "string (detailed growth opportunities)",
              "training": "string (training and development details)"
            },
            "technology": {
              "stack": ["array of at least 3 technologies used"],
              "innovation": "string (innovation approach)"
            },
            "contact": {
              "website": "string (company website)",
              "email": "string (contact email)",
              "phone": "string (contact phone - search thoroughly for main business phone, customer service number, or headquarters phone. Include country code if available. Format as international number when possible)",
              "address": "string (complete physical address with street, city, state/province, postal code, country)"
            },
            "socialMedia": {
              "linkedin": "string (LinkedIn company page URL)",
              "twitter": "string (Twitter/X company handle URL)",
              "facebook": "string (Facebook company page URL - optional)",
              "instagram": "string (Instagram company account URL - optional)"
            }
          }
          
          IMPORTANT: For phone numbers, search extensively through the provided information including:
          - Main business phone numbers
          - Customer service numbers
          - Headquarters contact numbers
          - Support hotlines
          - Regional office numbers
          Always format phone numbers in international format when possible (e.g., +1-555-123-4567).
          
          If any information is not explicitly provided, make reasonable assumptions based on the company's industry and description.`,
        },
        {
          role: "user",
          content: `Generate a JSON company profile for: ${companyInfo}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

      console.log('[OpenAI Service] OpenAI API response received:', {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length,
        finishReason: response.choices?.[0]?.finish_reason
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('[OpenAI Service] No content received from OpenAI', {
          response: JSON.stringify(response, null, 2)
        });
        throw new Error("No content received from OpenAI");
      }

      console.log('[OpenAI Service] Parsing JSON response...', {
        contentLength: content.length,
        contentPreview: content.substring(0, 200)
      });

      let parsedProfile;
      try {
        parsedProfile = JSON.parse(content);
        console.log('[OpenAI Service] JSON parsed successfully:', {
          hasName: !!parsedProfile.name,
          hasIndustry: !!parsedProfile.industry,
          keys: Object.keys(parsedProfile)
        });
      } catch (parseError: any) {
        console.error('[OpenAI Service] JSON parse error:', {
          error: parseError.message,
          contentPreview: content.substring(0, 500),
          contentLength: content.length
        });
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }

      // Validate and ensure all required fields are present with defaults
      const validatedProfile = {
        name: parsedProfile.name || 'Unknown Company',
        industry: parsedProfile.industry || 'General',
        founded: parsedProfile.founded || '',
        headquarters: parsedProfile.headquarters || '',
        overview: parsedProfile.overview || 'A forward-thinking company.',
        mission: parsedProfile.mission || '',
        culture: {
          values: Array.isArray(parsedProfile.culture?.values) ? parsedProfile.culture.values : ['Innovation', 'Excellence', 'Integrity'],
          benefits: Array.isArray(parsedProfile.culture?.benefits) ? parsedProfile.culture.benefits : ['Competitive salary', 'Health insurance', 'Flexible work'],
          workEnvironment: parsedProfile.culture?.workEnvironment || 'A collaborative and supportive work environment.'
        },
        opportunities: {
          roles: Array.isArray(parsedProfile.opportunities?.roles) ? parsedProfile.opportunities.roles : ['Various positions available'],
          growthPotential: parsedProfile.opportunities?.growthPotential || 'Strong growth opportunities for career development.',
          training: parsedProfile.opportunities?.training || 'Comprehensive training and development programs.'
        },
        technology: {
          stack: Array.isArray(parsedProfile.technology?.stack) ? parsedProfile.technology.stack : ['Modern technologies'],
          innovation: parsedProfile.technology?.innovation || 'Focus on innovation and cutting-edge solutions.'
        },
        contact: {
          website: parsedProfile.contact?.website || '',
          email: parsedProfile.contact?.email || '',
          phone: parsedProfile.contact?.phone || '',
          address: parsedProfile.contact?.address || ''
        },
        socialMedia: {
          linkedin: parsedProfile.socialMedia?.linkedin || '',
          twitter: parsedProfile.socialMedia?.twitter || '',
          facebook: parsedProfile.socialMedia?.facebook || '',
          instagram: parsedProfile.socialMedia?.instagram || ''
        }
      };

      console.log('[OpenAI Service] Profile validated:', {
        companyName: validatedProfile.name,
        hasAllRequiredFields: true
      });

      // Generate company intro
      let companyIntroResponse;
      try {
        console.log('[OpenAI Service] Generating company intro...');
        companyIntroResponse = await this.generateCompanyIntro({ ...validatedProfile, userId: userId || '' });
        console.log('[OpenAI Service] Company intro generated successfully');
      } catch (introError: any) {
        console.error('[OpenAI Service] Error generating company intro:', {
          error: introError.message,
          stack: introError.stack
        });
        // Continue without intro if it fails
        companyIntroResponse = "Welcome to our company!";
      }

      const result = {
        userId: userId || '681a91212c1ca099fe2b17df',
        companyIntro: companyIntroResponse,
        ...validatedProfile
      };

      console.log('[OpenAI Service] Profile generation completed successfully:', {
        companyName: result.name,
        userId: result.userId
      });

      return result;
    } catch (openaiError: any) {
      console.error('[OpenAI Service] OpenAI API error:', {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type,
        stack: openaiError.stack,
        name: openaiError.name
      });
      
      // Preserve the status code if available
      const errorWithStatus = openaiError as any;
      
      if (errorWithStatus.status === 401) {
        throw new Error('OpenAI API key is invalid or expired');
      } else if (errorWithStatus.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (errorWithStatus.status === 500) {
        throw new Error('OpenAI API service error. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${openaiError.message || 'Unknown error'}`);
      }
    }
  }

  async generateCompanyIntro(profile: any): Promise<string> {
    if (!apiKey) return "Error: OpenAI API key is not configured";

    const prompt = `\nWrite a compelling introduction for a \"Why Partner With Us?\" page for the company \"${profile.name}\".\nIndustry: ${profile.industry ?? 'N/A'}\nMission: ${profile.mission ?? 'N/A'}\nValues: ${(profile.culture?.values ?? []).join(', ') || 'N/A'}\nOpportunities: ${(profile.opportunities?.roles ?? []).join(', ') || 'N/A'}\n\nWrite exactly 3-4 lines (maximum 4 lines) highlighting innovation, growth, and unique opportunities. Use a modern and dynamic tone suitable for an international audience. Make the text concise and impactful.\n`;

    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Updated to a more recent and available model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "Error generating text";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return "Error generating text";
    }
  }

  async generateUniquenessCategories(profile: any) {
    if (!apiKey) throw new Error('OpenAI API key is not configured');

    const prompt = `Generate 4-6 uniqueness categories for a company profile page. Based on this company information:

Company: ${profile.name}
Industry: ${profile.industry ?? 'N/A'}
Mission: ${profile.mission ?? 'N/A'}
Overview: ${profile.overview ?? 'N/A'}
Values: ${(profile.culture?.values ?? []).join(', ') || 'N/A'}
Benefits: ${(profile.culture?.benefits ?? []).join(', ') || 'N/A'}
Opportunities: ${(profile.opportunities?.roles ?? []).join(', ') || 'N/A'}

Generate categories that highlight why someone should partner with this company. Each category should include:
- title: A compelling category name
- description: Brief description of the category
- score: A number from 1-5 representing the strength
- details: An array of 3-5 specific benefits or features

Available icons: Award, Globe2, DollarSign, TrendingUp, Rocket, Users, ShieldCheck, Zap

Return the response as a valid JSON object with this exact structure:
{
  "categories": [
    {
      "title": "string",
      "icon": "iconName",
      "description": "string", 
      "score": number,
      "details": ["string", "string", "string"]
    }
  ]
}

Make the categories relevant to the company's industry and strengths. Focus on what makes this company unique and attractive to potential partners.`;

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Updated to a more recent and available model
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from OpenAI");

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      throw new Error("Invalid JSON response from OpenAI");
    }

    let categoriesArray: any[];
    if (Array.isArray(parsedResponse)) {
      categoriesArray = parsedResponse;
    } else if (parsedResponse.categories && Array.isArray(parsedResponse.categories)) {
      categoriesArray = parsedResponse.categories;
    } else if (parsedResponse.data && Array.isArray(parsedResponse.data)) {
      categoriesArray = parsedResponse.data;
    } else {
      throw new Error("Invalid response format from OpenAI");
    }

    const formattedCategories = categoriesArray.map((category: any) => ({
      title: category.title,
      description: category.description,
      score: typeof category.score === 'number' ? category.score : 4,
      details: category.details,
      icon: category.icon || 'Award',
    }));

    return formattedCategories;
  }
}

export default new OpenAIService();



