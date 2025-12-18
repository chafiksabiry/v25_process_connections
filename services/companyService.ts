import Company from '../models/Company';
import dbConnect from '../lib/db/mongodb';

export interface ICompany {
  userId?: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  companyIntro?: string;
  mission?: string;
  subscription: 'free' | 'standard' | 'premium';
  culture?: {
    values: string[];
    benefits: string[];
    workEnvironment: string;
  };
  opportunities?: {
    roles: string[];
    growthPotential: string;
    training: string;
  };
  technology?: {
    stack: string[];
    innovation: string;
  };
  contact?: {
    email: string;
    phone: string;
    address: string;
    website: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

class CompanyService {
  async createCompany(companyData: ICompany) {
    await dbConnect();
    return Company.create(companyData);
  }

  async getAllCompanies() {
    await dbConnect();
    return Company.find();
  }

  async getCompanyById(id: string) {
    await dbConnect();
    return Company.findById(id);
  }

  async getCompanyByUserId(userId: string) {
    await dbConnect();
    return Company.findOne({ userId });
  }

  async updateCompany(id: string, updateData: Partial<ICompany>) {
    await dbConnect();
    return Company.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteCompany(id: string) {
    await dbConnect();
    return Company.findByIdAndDelete(id);
  }

  async updateSubscription(id: string, subscription: string) {
    await dbConnect();
    return Company.findByIdAndUpdate(id, { subscription }, { new: true });
  }

  async getCompanyDetails(id: string) {
    await dbConnect();
    const company = await Company.findById(id);
    if (!company) return null;
    
    // In the future, this might include more aggregated data (e.g., active gigs, employees)
    return company; 
  }
}

export default new CompanyService();
