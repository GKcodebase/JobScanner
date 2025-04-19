export interface JobDetails {
  title: string;
  company: string;
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

export interface ATSAnalysis {
  score: number;
  suggestions: string[];
  keywordDensity: Record<string, number>;
}

export interface UserSettings {
  geminiApiKey: string;
  resumeData?: ArrayBuffer;
  modelSelection: string;
}

export interface ContentScriptResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface UserStats {
  scans: number;
  atsChecks: number;
  lastUpdated: string;
}