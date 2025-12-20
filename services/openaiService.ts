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
      model: "gpt-3.5-turbo-1106",
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
    if (!apiKey) throw new Error('OpenAI API key is not configured');

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
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

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from OpenAI");

    const parsedProfile = JSON.parse(content);

    // Generate company intro
    const companyIntroResponse = await this.generateCompanyIntro({ ...parsedProfile, userId: userId || '' });

    return {
      userId: userId || '681a91212c1ca099fe2b17df',
      companyIntro: companyIntroResponse,
      ...parsedProfile
    };
  }

  async generateCompanyIntro(profile: any): Promise<string> {
    if (!apiKey) return "Error: OpenAI API key is not configured";

    const prompt = `\nWrite a compelling introduction for a \"Why Partner With Us?\" page for the company \"${profile.name}\".\nIndustry: ${profile.industry ?? 'N/A'}\nMission: ${profile.mission ?? 'N/A'}\nValues: ${(profile.culture?.values ?? []).join(', ') || 'N/A'}\nOpportunities: ${(profile.opportunities?.roles ?? []).join(', ') || 'N/A'}\n\nWrite exactly 3-4 lines (maximum 4 lines) highlighting innovation, growth, and unique opportunities. Use a modern and dynamic tone suitable for an international audience. Make the text concise and impactful.\n`;

    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
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
      model: "gpt-3.5-turbo-1106",
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



