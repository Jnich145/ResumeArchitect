import aiService from './aiService';

// Keywords commonly used in ATS systems by category
const ATS_KEYWORDS = {
  SKILLS: [
    'problem solving', 'communication', 'teamwork', 'leadership', 'attention to detail',
    'time management', 'organization', 'adaptability', 'creativity', 'analytical',
    'project management', 'critical thinking', 'collaboration', 'decision making',
    'research', 'planning', 'presentation', 'negotiation', 'mentoring', 'training'
  ],
  TECHNICAL: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB',
    'SQL', 'PostgreSQL', 'Python', 'Java', 'C#', '.NET', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'REST API', 'GraphQL'
  ],
  ACTION_VERBS: [
    'achieved', 'built', 'coordinated', 'created', 'delivered', 'developed',
    'established', 'generated', 'implemented', 'improved', 'increased', 'initiated',
    'launched', 'led', 'managed', 'organized', 'produced', 'reduced', 'resolved', 'streamlined'
  ]
};

// ATS scoring service
const atsService = {
  /**
   * Basic ATS analysis without AI (for free tier)
   */
  basicAnalysis(resumeContent: string, jobDescription?: string): {
    score: number;
    suggestions: string[];
    keywordMatches: {keyword: string, present: boolean}[];
  } {
    // Convert text to lowercase for case-insensitive matching
    const resumeLower = resumeContent.toLowerCase();
    
    // Track keywords found
    const matches: {keyword: string, present: boolean}[] = [];
    
    // If job description is provided, extract potential keywords
    let extractedKeywords: string[] = [];
    if (jobDescription) {
      extractedKeywords = extractKeywordsFromJobDescription(jobDescription);
    }
    
    // Combine standard keywords with extracted keywords (if any)
    const keywordsToCheck = [
      ...ATS_KEYWORDS.SKILLS,
      ...ATS_KEYWORDS.TECHNICAL,
      ...ATS_KEYWORDS.ACTION_VERBS,
      ...extractedKeywords
    ];
    
    // Remove duplicates
    const uniqueKeywords = [...new Set(keywordsToCheck)];
    
    // Check for keyword matches
    for (const keyword of uniqueKeywords) {
      const present = resumeLower.includes(keyword.toLowerCase());
      matches.push({ keyword, present });
    }
    
    // Calculate score based on matches
    const matchCount = matches.filter(m => m.present).length;
    const totalKeywords = matches.length;
    const score = Math.round((matchCount / totalKeywords) * 100);
    
    // Generate suggestions
    const suggestions = generateSuggestions(matches);
    
    return {
      score,
      suggestions,
      keywordMatches: matches
    };
  },
  
  /**
   * Advanced ATS analysis with AI (for premium tier)
   */
  async advancedAnalysis(
    userId: string,
    resumeContent: string,
    jobDescription: string
  ): Promise<{
    score: number;
    suggestions: string[];
    keywordMatches: {keyword: string, present: boolean}[];
    optimizedContent?: string;
  }> {
    try {
      // Use AI service for advanced analysis
      return await aiService.optimizeForATS(
        userId,
        'premium', // This is a premium-only feature
        resumeContent,
        jobDescription
      );
    } catch (error) {
      console.error('Error in advanced ATS analysis:', error);
      
      // Fallback to basic analysis if AI fails
      const basicResult = this.basicAnalysis(resumeContent, jobDescription);
      return {
        ...basicResult,
        score: Math.max(0, basicResult.score - 10) // Slightly lower score for fallback
      };
    }
  }
};

/**
 * Extract potential keywords from job description using simple NLP techniques
 */
function extractKeywordsFromJobDescription(jobDescription: string): string[] {
  const jobLower = jobDescription.toLowerCase();
  
  // Extract noun phrases and terms (this is a simple implementation)
  // In a production system, you might use a more sophisticated NLP library
  const words = jobLower.split(/\s+/);
  
  // Filter out common words, pronouns, articles, etc.
  const commonWords = new Set([
    'the', 'and', 'a', 'an', 'of', 'to', 'in', 'is', 'are', 'for', 'with',
    'as', 'that', 'on', 'at', 'this', 'by', 'from', 'or', 'be', 'it', 'we',
    'you', 'they', 'your', 'our', 'their', 'will', 'would', 'should', 'could'
  ]);
  
  // Keep words that are at least 4 chars and not common
  const potentialKeywords = words.filter(word => 
    word.length >= 4 && !commonWords.has(word)
  );
  
  // Keep unique keywords
  return [...new Set(potentialKeywords)];
}

/**
 * Generate suggestions based on keyword matches
 */
function generateSuggestions(matches: {keyword: string, present: boolean}[]): string[] {
  const suggestions: string[] = [];
  
  // Find missing keywords by category
  const missingSkills = matches
    .filter(m => !m.present && ATS_KEYWORDS.SKILLS.includes(m.keyword))
    .map(m => m.keyword);
  
  const missingTechnical = matches
    .filter(m => !m.present && ATS_KEYWORDS.TECHNICAL.includes(m.keyword))
    .map(m => m.keyword);
  
  const missingActionVerbs = matches
    .filter(m => !m.present && ATS_KEYWORDS.ACTION_VERBS.includes(m.keyword))
    .map(m => m.keyword);
  
  const otherMissing = matches
    .filter(m => !m.present && 
      !ATS_KEYWORDS.SKILLS.includes(m.keyword) &&
      !ATS_KEYWORDS.TECHNICAL.includes(m.keyword) &&
      !ATS_KEYWORDS.ACTION_VERBS.includes(m.keyword)
    )
    .map(m => m.keyword);
  
  // Generate category-specific suggestions
  if (missingSkills.length > 0) {
    suggestions.push(`Consider adding these skills: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? '...' : ''}`);
  }
  
  if (missingTechnical.length > 0) {
    suggestions.push(`Include these technical terms: ${missingTechnical.slice(0, 3).join(', ')}${missingTechnical.length > 3 ? '...' : ''}`);
  }
  
  if (missingActionVerbs.length > 0) {
    suggestions.push(`Use strong action verbs like: ${missingActionVerbs.slice(0, 3).join(', ')}${missingActionVerbs.length > 3 ? '...' : ''}`);
  }
  
  if (otherMissing.length > 0) {
    suggestions.push(`Consider adding these keywords: ${otherMissing.slice(0, 5).join(', ')}${otherMissing.length > 5 ? '...' : ''}`);
  }
  
  // Add generic suggestions
  if (matches.filter(m => m.present).length < matches.length * 0.3) {
    suggestions.push('Your resume may need significant keyword optimization to pass ATS systems.');
  }
  
  if (matches.filter(m => ATS_KEYWORDS.ACTION_VERBS.includes(m.keyword) && m.present).length < 5) {
    suggestions.push('Use more action verbs to describe your accomplishments.');
  }
  
  return suggestions;
}

export default atsService; 