import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import axios from 'axios';
import { generatePrompt } from './prompts/contactCenterAssessment';
import { generateLanguagePrompt } from './prompts/languageAssessment';
import { cleanAndFormatResponse, parseJsonResponseContactCenter } from './utils/formatVertexResponse';

// Configuration (should be in env vars)
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const BUCKET_NAME = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'harx-audios-test';

// Service Account setup
// Note: In production, it's better to use environment variables for credentials content
// rather than a file path if deploying to Vercel/Cloud Run.
// For now, assuming credentials are managed via GOOGLE_APPLICATION_CREDENTIALS env var or similar.

class VertexService {
  private vertexAI: any;
  private generativeModel: any;
  private storage: Storage;

  constructor() {
    this.vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });

    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
    });

    this.storage = new Storage({
       projectId: PROJECT_ID,
       // keyFilename: ... (optional if using default env var credentials)
    });
  }

  async summarizeAudio(fileUri: string, prompt: string) {
    try {
       const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  mimeType: 'audio/flac', // Or detect dynamically
                  fileUri: fileUri,
                },
              },
              { text: prompt },
            ],
          },
        ],
      };

      const result = await this.generativeModel.generateContent(request);
      const response = await result.response;
      return { summary: response.candidates[0].content.parts[0].text };

    } catch (error: any) {
      console.error('Error summarizing audio:', error);
      throw new Error(`Failed to summarize audio: ${error.message}`);
    }
  }

  async transcribeAudio(fileUri: string, languageCode: string = 'en-US') {
    try {
      const prompt = `Transcribe the following audio file verbatim. output just the text.`;
      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  mimeType: 'audio/opus', // Standard for web recording
                  fileUri: fileUri,
                },
              },
              { text: prompt },
            ],
          },
        ],
      };

      const result = await this.generativeModel.generateContent(request);
      const response = await result.response;
      const transcription = response.candidates[0].content.parts[0].text;
      return { transcription };
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }


  async evaluateRepLanguage(fileUri: string, textToCompare: string) {
    try {
      const request = {
        contents: [{
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: 'audio/opus', // Adjust as needed
                fileUri: fileUri
              }
            },
            {
              text: generateLanguagePrompt(textToCompare)
            }
          ]
        }],
      };
      
      const result = await this.generativeModel.generateContent(request);
      const response = await result.response;
      return cleanAndFormatResponse(response);
    } catch (error: any) {
      console.error('Error evaluating language:', error);
      throw new Error(`Failed to analyze language: ${error.message}`);
    }
  }

  async evaluateRepCCSkills(fileUri: string, scenarioData: any) {
    try {
      const request = {
        contents: [{
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: 'audio/opus',
                fileUri: fileUri
              }
            },
            {
              text: generatePrompt(scenarioData)
            }
          ]
        }],
      };
      
      const result = await this.generativeModel.generateContent(request);
      const response = await result.response;
      const text = response.candidates[0].content.parts[0].text;
      return parseJsonResponseContactCenter(text);
    } catch (error: any) {
      console.error('Error evaluating CC skills:', error);
      throw new Error(`Failed to analyze CC skills: ${error.message}`);
    }
  }

  async uploadAudio(fileBuffer: Buffer, destinationName: string) {
    try {
      const bucket = this.storage.bucket(BUCKET_NAME);
      const file = bucket.file(destinationName);

      await file.save(fileBuffer, {
        resumable: false,
        // metadata: { contentType: 'audio/...' }
      });

      return {
        message: `${destinationName} successfully uploaded to ${BUCKET_NAME}`,
        bucketName: BUCKET_NAME,
        fileUri: `gs://${BUCKET_NAME}/${destinationName}`,
      };
    } catch (error: any) {
      console.error(`Failed to upload to ${BUCKET_NAME}:`, error.message);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }
}

export const vertexService = new VertexService();


