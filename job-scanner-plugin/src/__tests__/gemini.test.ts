import { GeminiAPI } from '../api/gemini';

describe('GeminiAPI', () => {
  let api: GeminiAPI;

  beforeEach(() => {
    api = new GeminiAPI('test-api-key');
  });

  test('extractJobDetails should parse job information', async () => {
    const mockJobText = 'Software Engineer position at TechCorp';
    const result = await api.extractJobDetails(mockJobText);
    
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('requirements');
    expect(result).toHaveProperty('skills');
  });
});