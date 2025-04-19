export interface JobDetails {
  title: string;
  requirements: string[];
  skills: string[];
  compensation?: string;
  sponsorship?: boolean;
  clearance?: boolean;
}

export interface MatchAnalysis {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface UserSettings {
  geminiApiKey: string;
  modelSelection: string;
  resumeData?: ArrayBuffer;
}