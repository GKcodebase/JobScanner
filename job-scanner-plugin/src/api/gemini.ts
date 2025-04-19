import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobDetails, MatchAnalysis, ATSAnalysis } from '../types';

export class GeminiAPI {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractJobDetails(pageContent: string): Promise<JobDetails> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Extract job details from the following content. Return a JSON object with title, company, requirements (array), skills (array), compensation (if available), sponsorship (boolean), and clearance (boolean): ${pageContent}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async analyzeMatch(jobDetails: JobDetails, resumeText: string): Promise<MatchAnalysis> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Compare the job requirements with the resume and provide a JSON with score (0-100), matchedSkills (array), missingSkills (array), and suggestions (array).`;
    
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }],
        role: 'user'
      }, {
        parts: [{ text: JSON.stringify({ jobDetails, resumeText }) }],
        role: 'user'
      }]
    });
    
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async generateATSScore(resumeText: string): Promise<ATSAnalysis> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze this resume for ATS compatibility. Return a JSON with score (0-100), suggestions array, and keywordDensity object.`;
    
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }, { text: resumeText }],
        role: 'user'
      }]
    });
    
    const response = await result.response;
    return JSON.parse(response.text());
  }
}