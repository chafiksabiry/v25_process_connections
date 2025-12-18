import axios from 'axios';
import ZohoConfig, { IZohoConfig } from '@/models/ZohoConfig';
import dbConnect from '@/lib/db/mongodb';

const ZOHO_TOKEN_URL = process.env.ZOHO_TOKEN_URL || 'https://accounts.zoho.com/oauth/v2/token';

export class ZohoService {
  
  async refreshToken(config: IZohoConfig): Promise<string> {
    try {
      console.log("Refreshing Zoho token...");
      
      const response = await axios.post(ZOHO_TOKEN_URL, null, {
        params: {
          refresh_token: config.refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from Zoho');
      }

      const newAccessToken = response.data.access_token;
      
      // Update config in DB
      config.accessToken = newAccessToken;
      config.lastUpdated = new Date();
      if (response.data.expires_in) {
          config.expiresIn = response.data.expires_in;
      }
      await config.save();

      return newAccessToken;
    } catch (error: any) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  async getValidToken(userId: string): Promise<string> {
    await dbConnect();
    const config = await ZohoConfig.findOne({ userId }).sort({ lastUpdated: -1 });
    
    if (!config) {
      throw new Error('Zoho configuration not found');
    }

    // Check if token is expired (assuming 1 hour expiry generally, but refreshing if older than 50 mins to be safe)
    // Or just always refresh if we don't track expiry perfectly. 
    // The original code seemed to refresh on 401. 
    // Here we can try to use existing if valid, or refresh.
    // For simplicity and reliability, let's refresh if older than 50 mins or missing.
    
    const now = new Date();
    const lastUpdated = new Date(config.lastUpdated);
    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / 60000;

    if (!config.accessToken || diffMinutes > 50) {
        return this.refreshToken(config);
    }

    return config.accessToken;
  }

  async executeWithRefresh<T>(userId: string, apiCall: (token: string) => Promise<T>): Promise<T> {
    let token = await this.getValidToken(userId);
    
    try {
      return await apiCall(token);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log("Token expired, refreshing...");
        // Force refresh
        await dbConnect();
        const config = await ZohoConfig.findOne({ userId });
        if (config) {
            token = await this.refreshToken(config);
            return await apiCall(token);
        }
      }
      throw error;
    }
  }

  async getSalesIQPortalName(token: string): Promise<string> {
    const response = await axios.get("https://salesiq.zoho.com/api/v2/portals", {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.data?.[0]?.screenname) {
      return response.data.data[0].screenname;
    }
    throw new Error("No SalesIQ portal found");
  }

  async getChats(userId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.post(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        { text },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async configure(userId: string, companyId: string, configData: any) {
      await dbConnect();
      
      // Verify token first
      const response = await axios.post(ZOHO_TOKEN_URL, null, {
        params: {
          refresh_token: configData.refreshToken,
          client_id: configData.clientId,
          client_secret: configData.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      if (!response.data.access_token) {
          throw new Error("Invalid Zoho credentials");
      }

      await ZohoConfig.deleteMany({ userId, companyId });

      const newConfig = new ZohoConfig({
          userId,
          companyId,
          clientId: configData.clientId,
          clientSecret: configData.clientSecret,
          refreshToken: configData.refreshToken,
          accessToken: response.data.access_token,
          expiresIn: response.data.expires_in,
          lastUpdated: new Date()
      });

      await newConfig.save();
      return { success: true, accessToken: response.data.access_token };
  }
}

export const zohoService = new ZohoService();

