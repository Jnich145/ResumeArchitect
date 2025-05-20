import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Check for OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Initialize OpenAI with API key or mock
let openai: OpenAI;
let useMockAI = false; // Set to false to use real API when available

try {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ No OpenAI API key found. Using mock AI implementation for development.');
    useMockAI = true;
    openai = {} as any;
  } else {
    // Initialize OpenAI client with proper configuration
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'development', // Allow browser usage in development
      maxRetries: 3
    });
    
    // Log API initialization
    console.log('💬 Using real OpenAI API for AI responses.');
    
    // Verify API key in development mode
    if (process.env.NODE_ENV === 'development') {
      (async () => {
        try {
          // Make a simple model list call to verify API key is working
          await openai.models.list();
          console.log('✅ OpenAI API key verified successfully.');
        } catch (error) {
          console.error('❌ OpenAI API key verification failed:', error);
          console.warn('⚠️ Falling back to mock AI implementation for development.');
          useMockAI = true;
        }
      })();
    }
  }
} catch (error) {
  console.warn('⚠️ Error initializing OpenAI. Using mock implementation:', error);
  useMockAI = true;
  openai = {} as any;
}

// User Schema for AI usage tracking (outside the main User model)
interface AIUsage {
  userId: mongoose.Types.ObjectId;
  usageCount: number;
  lastUsed: Date;
  monthlyUsage: number;
  monthlyReset: Date;
}

const AIUsageSchema = new mongoose.Schema<AIUsage>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  monthlyUsage: {
    type: Number,
    default: 0
  },
  monthlyReset: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
  }
});

// Reset monthly usage if past the reset date
AIUsageSchema.pre('save', function(next) {
  const now = new Date();
  if (now > this.monthlyReset) {
    this.monthlyUsage = 0;
    this.monthlyReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  next();
});

const AIUsageModel = mongoose.model<AIUsage>('AIUsage', AIUsageSchema);

// Helper to check and update usage limits
async function checkAndUpdateUsage(userId: string, tier: 'free' | 'basic' | 'premium'): Promise<boolean> {
  try {
    // For development, always allow usage and treat as premium tier
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Bypassing AI usage limits. Treating user ${userId} as premium tier.`);
      
      // Force reset usage counters in development to avoid any limits
      try {
        await AIUsageModel.findOneAndUpdate(
          { userId },
          {
            $set: {
              monthlyUsage: 0,
              usageCount: 0,
              lastUsed: new Date(),
              monthlyReset: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          },
          { upsert: true }
        );
      } catch (error) {
        console.log("Could not reset usage, but bypassing checks anyway");
      }
      
      return true;
    }
    
    // Usage limits by tier for production
    const limits = {
      free: 5,      // 5 requests per month for free users
      basic: 50,    // 50 requests per month for basic tier
      premium: 200  // 200 requests per month for premium tier
    };
    
    // Get or create usage record
    let usage = await AIUsageModel.findOne({ userId });
    
    if (!usage) {
      usage = new AIUsageModel({
        userId,
        usageCount: 0,
        lastUsed: new Date(),
        monthlyUsage: 0,
        monthlyReset: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      });
    }
    
    // Check if user has hit their limit
    if (usage.monthlyUsage >= limits[tier]) {
      return false; // User has exceeded their monthly limit
    }
    
    // Update usage
    usage.usageCount += 1;
    usage.monthlyUsage += 1;
    usage.lastUsed = new Date();
    await usage.save();
    
    return true;
  } catch (error) {
    console.error('Error checking AI usage:', error);
    
    // For development, allow usage even on error
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    return false;
  }
}

// Prompt templates for different AI features
const PROMPT_TEMPLATES = {
  IMPROVE_SUMMARY: `
    Transform the following professional summary into a powerful personal branding statement.
    
    Guidelines:
    1. Begin with a strong self-identifier (e.g., "Results-driven software engineer with...")
    2. Include years of experience if more than 2 years
    3. Highlight 3-4 core competencies or specialized skills
    4. Mention 1-2 significant achievements with measurable results
    5. Keep to 3-4 impactful sentences (50-75 words maximum)
    6. Use active voice and powerful action verbs
    7. Eliminate pronouns (I, me, my) and clichés
    8. Tailor to your target industry while remaining authentic
    9. Focus on what you can offer an employer, not what you want
    
    Original Summary:
    {{content}}
  `,
  
  IMPROVE_BULLET_POINT: `
    Transform this work experience bullet point using the enhanced STAR method.
    
    Guidelines:
    1. Begin with a strong action verb in the correct tense (past for previous jobs)
    2. Structure: Action Verb + Task + Approach + Result
    3. Quantify results with specific metrics (%, $, time saved, etc.)
    4. Showcase your skills and contributions, not just responsibilities
    5. Highlight accomplishments that demonstrate valuable transferable skills
    6. Use industry-relevant keywords
    7. Keep to 1-2 lines (25 words maximum)
    8. Remove unnecessary words, articles, pronouns
    9. Focus on outcomes and impact, not just tasks
    
    Examples of powerful transformations:
    - Before: "Responsible for managing social media"
    - After: "Increased social media engagement by 78% through strategic content calendar implementation, growing follower base by 15K in 6 months"
    
    - Before: "Helped with customer service issues"
    - After: "Resolved 50+ daily customer inquiries with 97% satisfaction rate, implementing new response protocol that reduced resolution time by 34%"
    
    Original Bullet Point:
    {{content}}
  `,
  
  IMPROVE_COMPANY: `
    Enhance the company name for maximum professional impact on a resume.
    
    Guidelines:
    1. Use the official legal name of well-known companies (e.g., "Meta Platforms, Inc." not just "Facebook")
    2. Include appropriate entity designation (LLC, Inc., Ltd.) for smaller companies
    3. For lesser-known companies, ensure name sounds established and credible
    4. If it's a generic name, make it more specific (e.g., "TechSolutions" → "TechSolutions Global Partners")
    5. For international companies, include full legal name plus location if relevant
    6. Remove unnecessary words like "The" unless part of official name
    7. Maintain capitalization conventions of the company
    8. For acquisitions, use format: "Company A (acquired by Company B)"
    
    Original Company Name:
    {{content}}
  `,
  
  IMPROVE_POSITION: `
    Elevate this job title to accurately reflect responsibilities while maximizing impact.
    
    Guidelines:
    1. Use industry-standard terminology recognized by ATS systems
    2. Accurately represent seniority level (Junior, Senior, Lead, Principal, etc.)
    3. Specify domain expertise where applicable (e.g., "Frontend Developer" vs just "Developer")
    4. Include specializations if relevant (e.g., "Digital Marketing Manager - SEO Specialist")
    5. Replace generic titles with more specific alternatives
       - "Assistant" → "Administrative Specialist" or "Executive Assistant" 
       - "Representative" → "Account Executive" or "Client Success Representative"
       - "Staff" → "Team Member" or appropriate departmental role
    6. Match titles to target industry conventions
    7. Avoid inflating titles beyond actual responsibilities
    8. For hybrid roles, use format "Primary Role / Secondary Focus"
    
    Examples of powerful transformations:
    - "Salesperson" → "B2B Sales Executive"
    - "IT Worker" → "IT Infrastructure Specialist"
    - "Marketing Person" → "Digital Marketing Strategist"
    
    Original Position:
    {{content}}
  `,
  
  IMPROVE_INSTITUTION: `
    Format this educational institution name according to professional resume standards.
    
    Guidelines:
    1. Use the complete, official name of the institution
    2. Include proper accreditation designations if applicable
    3. For universities with multiple campuses, specify the correct campus
    4. Use standard abbreviations only for widely recognized institutions (MIT, UCLA)
    5. For international institutions, include city/country if not obvious from name
    6. Maintain correct capitalization and spacing conventions
    7. Include proper articles ("The Ohio State University") if part of official name
    8. For merged or renamed institutions, use current official name with former name in parentheses if needed
    
    Examples:
    - "state university of new york" → "State University of New York at Buffalo"
    - "Harvard" → "Harvard University"
    - "London Business School" → "London Business School" (already correct)
    
    Original Institution:
    {{content}}
  `,
  
  IMPROVE_DEGREE: `
    Format this academic degree according to professional resume standards.
    
    Guidelines:
    1. Use correct degree abbreviation or full name (e.g., "Bachelor of Science" or "B.S.")
    2. Maintain consistent formatting (either all abbreviated or all spelled out)
    3. Capitalize degree names properly (Bachelor of Arts, not bachelor of arts)
    4. Include specific major/concentration using "in" format (e.g., "Master of Science in Computer Science")
    5. For dual degrees, use format "X and Y" (e.g., "B.A. in Economics and Political Science")
    6. For specialized certifications, include proper accreditation
    7. For international degrees, provide U.S. equivalent in parentheses if applicable
    8. Use standard academic terminology recognizable to recruiters
    
    Examples:
    - "bachelors" → "Bachelor of Arts in Communications"
    - "MBA degree" → "Master of Business Administration"
    - "computer science bs" → "Bachelor of Science in Computer Science"
    
    Original Degree:
    {{content}}
  `,
  
  IMPROVE_FIELD: `
    Enhance this field of study to maximize relevance and impact on a resume.
    
    Guidelines:
    1. Use proper academic terminology and capitalization
    2. Be specific about specialization areas (e.g., "Machine Learning" vs just "Computer Science")
    3. For interdisciplinary studies, use format "X with focus on Y"
    4. Include relevant concentrations, tracks, or specializations
    5. Align terminology with industry standards and job targets
    6. Use recognized field names that will pass ATS screening
    7. For lesser-known fields, include a brief clarifying phrase if space permits
    8. Maintain proper capitalization of specific disciplines
    
    Examples:
    - "business" → "Business Administration with concentration in Finance"
    - "computer programming" → "Computer Science with specialization in Software Engineering"
    - "english" → "English Literature with focus on Technical Writing"
    
    Original Field of Study:
    {{content}}
  `,
  
  IMPROVE_SKILL: `
    Transform this skill into a high-impact, ATS-optimized resume keyword.
    
    Guidelines:
    1. Use industry-standard terminology that will pass ATS screening
    2. Be specific rather than general (e.g., "React.js" instead of just "JavaScript")
    3. Include version numbers or certification levels for technical skills if relevant
    4. For soft skills, use specific descriptors (e.g., "Cross-functional Team Leadership" vs. just "Leadership")
    5. Group related skills using proper categorization
    6. Use proper capitalization for proprietary names (e.g., "Microsoft PowerPoint" not "microsoft powerpoint")
    7. For methodologies, include full proper name (e.g., "Agile Scrum" not just "Agile")
    8. Match keywords from relevant job descriptions in your target industry
    
    Examples:
    - "excel" → "Microsoft Excel (Advanced, including VLOOKUP and Pivot Tables)"
    - "coding" → "Full-Stack Development (React.js, Node.js, PostgreSQL)"
    - "management" → "Project Management (Agile, Scrum, Kanban)"
    
    Original Skill:
    {{content}}
  `,
  
  GENERATE_BULLET_POINTS: `
    Create 3 powerful, achievement-oriented bullet points for this role following top resume writing standards.
    
    Guidelines:
    1. Begin each bullet with a strong, varied action verb in the correct tense
    2. Follow the enhanced STAR format: Situation/Task + Action + Result
    3. Include quantifiable metrics and specific achievements (%, $, time saved, people managed, etc.)
    4. Demonstrate business impact, not just task completion
    5. Highlight transferable skills relevant to future target roles
    6. Incorporate relevant industry keywords for ATS optimization
    7. Focus on most impressive and relevant accomplishments
    8. Show progression of responsibility if applicable
    9. Keep each bullet to 1-2 lines maximum (concise but comprehensive)
    
    Role Information:
    Job Title: {{jobTitle}}
    Company: {{company}}
    Industry: {{industry}}
    Key Responsibilities: {{responsibilities}}
  `,
  
  ATS_OPTIMIZE: `
    Analyze and optimize this resume content to maximize ATS compatibility and keyword matching.
    
    Guidelines:
    1. Identify critical missing keywords from the job description
    2. Evaluate keyword density and suggest natural placement opportunities
    3. Check for proper formatting of technical skills, acronyms, and certifications
    4. Assess action verb variety and impact
    5. Recommend improvements for scannable structure and readability
    6. Identify unnecessarily complex language that could confuse ATS systems
    7. Suggest quantifiable metrics to add where appropriate
    8. Check for industry-standard terminology alignment
    9. Evaluate overall keyword matching percentage and improvement opportunities
    
    Resume Section:
    {{resumeContent}}
    
    Job Description:
    {{jobDescription}}
  `,
  
  CHECK_GRAMMAR: `
    Perform a comprehensive professional proofread of this resume content.
    
    Guidelines:
    1. Correct all grammar, spelling, and punctuation errors
    2. Ensure consistent verb tense (past tense for previous positions, present for current role)
    3. Standardize formatting of dates, numbers, and percentages
    4. Eliminate redundant or filler words
    5. Check for proper capitalization of job titles, companies, and proper nouns
    6. Ensure parallelism in bullet point structure
    7. Remove personal pronouns (I, me, my)
    8. Check for consistent formatting of similar elements
    9. Improve clarity and conciseness without changing meaning
    10. Flag any potentially controversial or inappropriate content
    
    Content:
    {{content}}
  `
};

// Function to validate content for inappropriate/harmful content
async function validateContent(content: string): Promise<boolean> {
  try {
    if (useMockAI) {
      console.log(`[MOCK] Validating content`);
      return true;
    }
    
    const moderationResponse = await openai.moderations.create({
      input: content
    });
    
    return !moderationResponse.results[0].flagged;
  } catch (error) {
    console.error('Error validating content:', error);
    
    // For development, allow content even on error
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    return false;
  }
}

// Mock response generators for development
const mockResponses = {
  improveContent(content: string, contentType: 'summary' | 'bullet_point' | 'institution' | 'degree' | 'field_of_study' | 'skill' | 'company' | 'position'): string {
    if (contentType === 'bullet_point') {
      // For bullet points, create an achievement-focused bullet based on content context
      const bulletTypes = [
        // Leadership bullets
        "Led cross-functional team to redesign critical system architecture, reducing latency by 40% and improving user satisfaction scores from 72% to 94%.",
        "Directed implementation of automated CI/CD pipeline, reducing deployment time from 2 days to 30 minutes and decreasing production defects by 65%.",
        "Managed migration of legacy systems to cloud infrastructure, resulting in $1.2M annual cost savings and 99.99% system availability.",
        
        // Technical achievement bullets
        "Engineered scalable microservices architecture handling 500K daily transactions, enabling 300% business growth without performance degradation.",
        "Developed machine learning algorithm that increased prediction accuracy by 37%, generating $2.5M in additional annual revenue.",
        "Architected and implemented real-time data processing system that reduced analytics latency from hours to seconds, enabling critical business decisions.",
        
        // Process improvement bullets
        "Streamlined deployment process by implementing infrastructure as code, reducing configuration errors by 90% and deployment time by 75%.",
        "Created comprehensive API documentation and developer portal that reduced integration time for partners from weeks to days.",
        "Implemented automated testing framework increasing test coverage from 65% to 92%, reducing production bugs by 78%.",
        
        // Team/collaboration bullets
        "Mentored 5 junior developers through structured training program, accelerating their progression to mid-level roles by an average of 8 months.",
        "Collaborated with product and design teams to implement user feedback system that increased feature adoption by 47%.",
        "Facilitated adoption of agile practices across 8 teams, resulting in 35% faster time-to-market and improved interdepartmental communication."
      ];
      
      // Return random bullet that hasn't been used recently
      // Create a pseudo-random selection based on content to ensure variety
      const contentHash = content.length * 31 + (content.charCodeAt(0) || 65);
      return bulletTypes[contentHash % bulletTypes.length];
    } else if (contentType === 'summary') {
      // Return completely rewritten summary rather than appending text
      if (content.includes("MIT") || content.includes("Graduate")) {
        return "Recent MIT Quantum Physics graduate with strong analytical skills and research experience. Adept at solving complex problems, analyzing data, and developing innovative solutions. Seeking to leverage advanced theoretical knowledge and computational expertise in a challenging research or development role.";
      } else if (content.includes("manager") || content.includes("lead") || content.includes("leadership")) {
        return "Seasoned leader with proven success driving operational excellence and team development. Expert in strategic planning, process optimization, and cross-functional collaboration. Consistently delivers exceptional results while fostering an environment of innovation and continuous improvement.";
      } else if (content.includes("developer") || content.includes("engineer") || content.includes("programming")) {
        return "Innovative software engineer with expertise in full-stack development and cloud architecture. Proficient in multiple programming languages and frameworks with a track record of delivering scalable, robust applications. Passionate about clean code, user experience, and implementing industry best practices.";
      } else {
        return "Results-driven professional with strong analytical abilities and excellent communication skills. Experienced in project management, stakeholder engagement, and process improvement. Committed to delivering high-quality outcomes through collaborative problem-solving and attention to detail.";
      }
    }
    
    // Keep the other content types as they are
    else if (contentType === 'institution') {
      return content.replace(/college/i, "University").replace(/school/i, "Institute of Technology");
    } else if (contentType === 'degree') {
      return content.replace(/diploma/i, "Degree").replace(/certificate/i, "Advanced Certificate");
    } else if (contentType === 'field_of_study') {
      if (!content || content.length < 3) return "Computer Science";
      return content;
    } else if (contentType === 'skill') {
      const skills = ["Data Analysis", "Project Management", "Team Leadership", 
                      "Strategic Planning", "JavaScript", "Python", "React", 
                      "Cloud Computing", "Machine Learning", "Communication"];
      return skills[Math.floor(Math.random() * skills.length)];
    } else if (contentType === 'company') {
      // For company names
      if (!content || content.length < 3) return "Innovative Solutions Inc.";
      
      // Replace generic company names with more professional ones
      return content
        .replace(/solutions/i, "Solutions International")
        .replace(/tech/i, "Technologies Group")
        .replace(/systems/i, "Systems Global")
        .replace(/service/i, "Professional Services")
        .replace(/company/i, "Corporation");
    } else if (contentType === 'position') {
      // For job positions
      if (!content || content.length < 3) return "Senior Project Manager";
      
      // Enhance job titles to sound more impressive
      return content
        .replace(/manager/i, "Senior Manager")
        .replace(/developer/i, "Software Engineer")
        .replace(/assistant/i, "Specialist")
        .replace(/rep/i, "Representative")
        .replace(/associate/i, "Professional")
        .replace(/staff/i, "Team Lead");
    } else {
      // This shouldn't be reached but providing a fallback just in case
      return "Enhanced professional content for your resume.";
    }
  },
  
  generateBulletPoints(jobInfo: any): string[] {
    // Collection of varied bullet point templates
    const bulletTemplates = [
      `Led cross-functional team of ${Math.floor(Math.random() * 10) + 5} members to deliver project ${Math.floor(Math.random() * 20) + 10}% under budget and ${Math.floor(Math.random() * 5) + 2} weeks ahead of schedule, resulting in $${Math.floor(Math.random() * 500) + 100}K cost savings and accelerated market entry.`,
      
      `Architected and implemented cloud-based solution that reduced infrastructure costs by ${Math.floor(Math.random() * 30) + 20}% while improving system reliability from ${Math.floor(Math.random() * 90) + 9}% to 99.9% uptime.`,
      
      `Spearheaded migration to microservices architecture, resulting in ${Math.floor(Math.random() * 40) + 30}% faster deployment cycles and ${Math.floor(Math.random() * 50) + 20}% reduction in production bugs.`,
      
      `Designed and optimized data processing pipeline handling ${Math.floor(Math.random() * 10) + 1}TB of daily data, improving processing speed by ${Math.floor(Math.random() * 70) + 30}% and enabling real-time analytics capabilities.`,
      
      `Implemented comprehensive DevOps practices including CI/CD pipelines, infrastructure as code, and automated testing, reducing release cycle from ${Math.floor(Math.random() * 4) + 2} weeks to ${Math.floor(Math.random() * 3) + 1} days.`,
      
      `Developed and deployed machine learning models for ${jobInfo.industry || 'business'} analytics, increasing prediction accuracy by ${Math.floor(Math.random() * 25) + 15}% and generating $${Math.floor(Math.random() * 900) + 100}K in additional revenue.`,
      
      `Collaborated with stakeholders to redesign ${jobInfo.company ? jobInfo.company + "'s" : ""} ${jobInfo.industry || 'company'} workflow system, resulting in ${Math.floor(Math.random() * 40) + 20}% improvement in team productivity and ${Math.floor(Math.random() * 30) + 10}% reduction in operational costs.`,
      
      `Led security enhancement initiative implementing zero-trust architecture and comprehensive penetration testing, reducing security incidents by ${Math.floor(Math.random() * 80) + 20}% and achieving compliance with ${['SOC 2', 'HIPAA', 'GDPR', 'ISO 27001'][Math.floor(Math.random() * 4)]} standards.`,
      
      `Mentored and managed team of ${Math.floor(Math.random() * 8) + 3} junior developers, implementing agile methodologies and technical training that improved code quality metrics by ${Math.floor(Math.random() * 40) + 30}%.`,
      
      `Created comprehensive API documentation and developer portal that reduced onboarding time by ${Math.floor(Math.random() * 50) + 30}% and increased external developer adoption by ${Math.floor(Math.random() * 200) + 100}%.`
    ];
    
    // Get 3 random non-repeating bullet points
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < 3) {
      selectedIndices.add(Math.floor(Math.random() * bulletTemplates.length));
    }
    
    return Array.from(selectedIndices).map(index => bulletTemplates[index]);
  },
  
  optimizeForATS(resumeContent: string, jobDescription: string): any {
    const keywordMatches = [
      { keyword: 'project management', present: true },
      { keyword: 'agile methodology', present: false },
      { keyword: 'cross-functional teams', present: true },
      { keyword: 'data analysis', present: false },
      { keyword: 'stakeholder communication', present: true }
    ];
    
    // Extract some keywords from the job description for more realistic mock
    const extractedKeywords = jobDescription.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 5)
      .slice(0, 3)
      .map(keyword => ({ 
        keyword, 
        present: resumeContent.toLowerCase().includes(keyword)
      }));
    
    // Add any extracted keywords to our mock matches
    if (extractedKeywords.length > 0) {
      keywordMatches.push(...extractedKeywords);
    }
    
    return {
      score: 78,
      suggestions: [
        'Include "agile methodology" in your experience section',
        'Add "data analysis" to your skills section',
        'Quantify your achievements with more specific metrics',
        `Use more industry-specific terminology from the job description: "${jobDescription.substring(0, 30)}..."`
      ],
      keywordMatches,
      optimizedContent: `${resumeContent} [Optimized for ATS with industry keywords and improved matching]`
    };
  },
  
  checkGrammar(content: string): any {
    return {
      correctedContent: content.replace(/  +/g, ' ').trim(),
      corrections: [
        {
          original: 'lead a team',
          corrected: 'led a team',
          explanation: 'Changed verb tense from present to past for consistency'
        },
        {
          original: 'responsible for',
          corrected: 'managed',
          explanation: 'Replaced passive phrasing with active verb for stronger impact'
        }
      ]
    };
  }
};

// Select the appropriate prompt template
const getPromptTemplate = (contentType: string): string => {
  switch (contentType) {
    case 'summary':
      return PROMPT_TEMPLATES.IMPROVE_SUMMARY;
    case 'bullet_point':
      return PROMPT_TEMPLATES.IMPROVE_BULLET_POINT;
    case 'company':
      return PROMPT_TEMPLATES.IMPROVE_COMPANY;
    case 'position':
      return PROMPT_TEMPLATES.IMPROVE_POSITION;
    case 'institution':
      return PROMPT_TEMPLATES.IMPROVE_INSTITUTION;
    case 'degree':
      return PROMPT_TEMPLATES.IMPROVE_DEGREE;
    case 'field_of_study':
      return PROMPT_TEMPLATES.IMPROVE_FIELD;
    case 'skill':
      return PROMPT_TEMPLATES.IMPROVE_SKILL;
    default:
      return PROMPT_TEMPLATES.IMPROVE_BULLET_POINT;
  }
};

// Main AI service functions
export const aiService = {
  // Generate improved content for resume sections
  async improveContent(
    userId: string,
    userTier: 'free' | 'basic' | 'premium',
    content: string,
    contentType: 'summary' | 'bullet_point' | 'institution' | 'degree' | 'field_of_study' | 'skill' | 'company' | 'position'
  ): Promise<string> {
    try {
      // Use mock implementation if enabled
      if (useMockAI) {
        console.log(`[MOCK] Improving ${contentType} for user ${userId}`);
        return mockResponses.improveContent(content, contentType);
      }
      
      // Validate the content
      const isValid = await validateContent(content);
      if (!isValid) {
        throw new Error('Content contains inappropriate material');
      }
      
      // Check usage limits
      const canProceed = await checkAndUpdateUsage(userId, userTier);
      if (!canProceed) {
        throw new Error('Monthly AI usage limit reached');
      }
      
      // Get the appropriate prompt template
      const promptTemplate = getPromptTemplate(contentType);
      
      // Replace content placeholder in the template
      const prompt = promptTemplate.replace('{{content}}', content);
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: userTier === 'premium' ? "gpt-4o" : "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a professional resume writer specializing in concise, impactful content.
            
            Your task is to improve the provided content to make it more powerful and achievement-oriented.
            
            Requirements:
            1. Be extremely CONCISE - use 30-50% fewer words than the original when possible
            2. Focus on specific achievements with measurable results
            3. Use strong action verbs and industry-standard terminology
            4. Maintain proper formatting with clean line breaks and spacing
            5. Never use generic phrases, clichés, or filler words
            6. Never mention that the content was improved by AI
            7. Return ONLY the improved content with no explanations or extra text
            8. Preserve any bullet point formatting in the original`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      });
      
      // Return improved content
      return completion.choices[0].message.content?.trim() || content;
    } catch (error: any) {
      console.error('Error improving content:', error);
      
      // For development, return mock response on error
      if (process.env.NODE_ENV === 'development') {
        return mockResponses.improveContent(content, contentType);
      }
      
      throw new Error(`Failed to improve content: ${error.message}`);
    }
  },
  
  // Generate bullet points based on job information
  async generateBulletPoints(
    userId: string,
    userTier: 'free' | 'basic' | 'premium',
    jobInfo: {
      jobTitle: string;
      company: string;
      industry: string;
      responsibilities: string;
    }
  ): Promise<string[]> {
    try {
      // Use mock implementation if enabled
      if (useMockAI) {
        console.log(`[MOCK] Generating bullet points for user ${userId}`);
        return mockResponses.generateBulletPoints(jobInfo);
      }
      
      // Validate input
      const combinedContent = Object.values(jobInfo).join(' ');
      const isValid = await validateContent(combinedContent);
      if (!isValid) {
        throw new Error('Content contains inappropriate material');
      }
      
      // Check usage limits
      const canProceed = await checkAndUpdateUsage(userId, userTier);
      if (!canProceed) {
        throw new Error('Monthly AI usage limit reached');
      }
      
      // Replace placeholders in the template
      let prompt = PROMPT_TEMPLATES.GENERATE_BULLET_POINTS;
      for (const [key, value] of Object.entries(jobInfo)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: userTier === 'premium' ? "gpt-4o" : "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a professional resume writer who creates concise, impactful bullet points.
            
            Requirements:
            1. Create exactly 3 bullet points
            2. Each bullet must be extremely concise (15-20 words maximum)
            3. Each bullet must start with a strong action verb in past tense
            4. Include specific metrics and achievements (%, $, time saved, etc.)
            5. Use clean, professional formatting
            6. Focus on business impact and results, not just responsibilities
            7. Return ONLY the bullet points, one per line, with no explanations
            8. No bullet point should be longer than one line
            9. Each bullet should start with "• " (bullet character + space)`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      
      // Parse response into bullet points
      const response = completion.choices[0].message.content?.trim() || '';
      
      // Handle the format consistently, ensuring each bullet starts with •
      const bulletPoints = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`);
      
      // Ensure we get exactly 3 bullet points or fallback to mock if API fails to deliver
      if (bulletPoints.length < 3) {
        console.warn('API returned fewer than 3 bullet points, using mock data to supplement');
        const mockBullets = mockResponses.generateBulletPoints(jobInfo);
        while (bulletPoints.length < 3) {
          bulletPoints.push(mockBullets[bulletPoints.length]);
        }
      }
      
      return bulletPoints.slice(0, 3); // Return exactly 3 bullets
    } catch (error: any) {
      console.error('Error generating bullet points:', error);
      
      // For development, return mock response on error
      if (process.env.NODE_ENV === 'development') {
        return mockResponses.generateBulletPoints(jobInfo);
      }
      
      throw new Error(`Failed to generate bullet points: ${error.message}`);
    }
  },
  
  // Generate resume suggestions based on resume data and job description
  async generateResumeSuggestions(
    userId: string,
    userTier: 'free' | 'basic' | 'premium',
    resumeData: any,
    jobDescription?: string
  ): Promise<{
    suggestions: Array<{
      section: string;
      content: any;
      explanation: string;
    }>
  }> {
    try {
      // Validate content - create a summary of the resume for validation
      const resumeSummary = JSON.stringify(resumeData).substring(0, 1000);
      const isValid = await validateContent(resumeSummary);
      if (!isValid) {
        throw new Error('Content contains inappropriate material');
      }
      
      // Check usage limits
      const canProceed = await checkAndUpdateUsage(userId, userTier);
      if (!canProceed) {
        throw new Error('Monthly AI usage limit reached');
      }
      
      if (useMockAI) {
        console.log(`[MOCK] Generating resume suggestions for user ${userId}`);
        
        // Extract context from resume data to make mock suggestions more relevant
        const name = resumeData.personalInfo?.name || 'professional';
        const title = resumeData.personalInfo?.title || 'professional';
        const industry = resumeData.experience?.[0]?.industry || '';
        const skills = resumeData.skills || [];
        
        return {
          suggestions: [
            {
              section: 'summary',
              content: `${title} with ${Math.floor(Math.random() * 10) + 2}+ years of experience in ${industry || 'the industry'}. Skilled in ${skills.slice(0, 3).join(', ')}. Focused on delivering results and exceeding expectations.`,
              explanation: `Crafted a concise, role-focused summary highlighting ${name}'s experience and key skills.`
            },
            {
              section: 'skills',
              content: [...skills, 'Problem Solving', 'Communication', 'Team Leadership'].slice(0, 8),
              explanation: 'Prioritized and organized skills based on relevance to target roles.'
            },
            {
              section: 'experience',
              content: resumeData.experience?.map((exp: any) => ({
                ...exp,
                description: `${exp.description || ''} [Enhanced with quantifiable metrics and leadership indicators]`
              })),
              explanation: 'Added measurable achievements and leadership indicators to experience descriptions.'
            }
          ]
        };
      }
      
      // Prepare the resume data for the AI
      const promptData = {
        resumeData: resumeData,
        jobDescription: jobDescription || ""
      };
      
      // Call OpenAI API for resume suggestions
      const completion = await openai.chat.completions.create({
        model: userTier === 'premium' ? "gpt-4o" : "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a resume optimization expert providing targeted suggestions.
            
            Requirements:
            1. Analyze the provided resume data and job description
            2. Generate EXACTLY 3 high-impact suggestions for improvement
            3. Each suggestion must be extremely concise and specific
            4. Focus on measurable achievements and keywords from the job description
            5. Ensure proper formatting with clean structure
            6. Avoid generic advice, clichés, and filler text
            7. For each suggestion, include the exact section to improve, the precise content change, and a 1-sentence explanation
            8. Use proper capitalization and professional language
            9. Return a JSON object with your suggestions in the format: 
               { "suggestions": [{ "section": string, "content": any, "explanation": string }] }`
          },
          { 
            role: "user", 
            content: JSON.stringify(promptData) 
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      });
      
      // Parse the JSON response
      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const response = JSON.parse(responseText);
      
      return {
        suggestions: response.suggestions || []
      };
    } catch (error: any) {
      console.error('Error generating resume suggestions:', error);
      
      // For development, return a basic response on error
      if (process.env.NODE_ENV === 'development') {
        return {
          suggestions: [
            {
              section: 'summary',
              content: 'Error generating tailored suggestions. Please try again or contact support.',
              explanation: 'There was an error processing your resume data.'
            }
          ]
        };
      }
      
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
  },
  
  // Optimize resume for ATS based on job description
  async optimizeForATS(
    userId: string,
    userTier: 'free' | 'basic' | 'premium',
    resumeContent: string,
    jobDescription: string
  ): Promise<{
    score: number;
    suggestions: string[];
    keywordMatches: {keyword: string, present: boolean}[];
    optimizedContent?: string;
  }> {
    try {
      // Use mock implementation if enabled
      if (useMockAI) {
        console.log(`[MOCK] Optimizing for ATS for user ${userId}`);
        return mockResponses.optimizeForATS(resumeContent, jobDescription);
      }
      
      // Premium feature check
      if (userTier !== 'premium') {
        throw new Error('ATS optimization is a premium feature');
      }
      
      // Validate content
      const combinedContent = resumeContent + ' ' + jobDescription;
      const isValid = await validateContent(combinedContent);
      if (!isValid) {
        throw new Error('Content contains inappropriate material');
      }
      
      // Check usage limits
      const canProceed = await checkAndUpdateUsage(userId, userTier);
      if (!canProceed) {
        throw new Error('Monthly AI usage limit reached');
      }
      
      // Replace placeholders in the template
      let prompt = PROMPT_TEMPLATES.ATS_OPTIMIZE
        .replace('{{resumeContent}}', resumeContent)
        .replace('{{jobDescription}}', jobDescription);
      
      // Call OpenAI API for ATS optimization
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an ATS (Applicant Tracking System) optimization expert.
            
            Requirements:
            1. Analyze the resume content against the job description
            2. Return a concise JSON with the following fields:
               - score: A number from 0-100 representing ATS match percentage
               - suggestions: A list of 3-5 specific, actionable improvements (each under 15 words)
               - keywordMatches: An array of important keywords and whether they're present
               - optimizedContent: The improved content with ATS-friendly formatting
            3. Focus on keyword optimization, clear formatting, and quantifiable achievements
            4. Maintain professional language and industry-standard terminology
            5. Ensure all formatting is clean and properly structured
            6. Be extremely concise in all suggestions and feedback`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      // Parse the JSON response
      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const response = JSON.parse(responseText);
      
      return {
        score: response.score || 0,
        suggestions: response.suggestions || [],
        keywordMatches: response.keywordMatches || [],
        optimizedContent: response.optimizedContent
      };
    } catch (error: any) {
      console.error('Error optimizing for ATS:', error);
      
      // For development, return mock response on error
      if (process.env.NODE_ENV === 'development') {
        return mockResponses.optimizeForATS(resumeContent, jobDescription);
      }
      
      throw new Error(`Failed to optimize for ATS: ${error.message}`);
    }
  },
  
  // Check grammar and spelling
  async checkGrammar(
    userId: string,
    userTier: 'free' | 'basic' | 'premium',
    content: string
  ): Promise<{
    correctedContent: string;
    corrections: {original: string, corrected: string, explanation: string}[];
  }> {
    try {
      // Use mock implementation if enabled
      if (useMockAI) {
        console.log(`[MOCK] Checking grammar for user ${userId}`);
        return mockResponses.checkGrammar(content);
      }
      
      // Basic tier feature check
      if (userTier === 'free') {
        throw new Error('Grammar checking is not available on the free tier');
      }
      
      // Validate content
      const isValid = await validateContent(content);
      if (!isValid) {
        throw new Error('Content contains inappropriate material');
      }
      
      // Check usage limits
      const canProceed = await checkAndUpdateUsage(userId, userTier);
      if (!canProceed) {
        throw new Error('Monthly AI usage limit reached');
      }
      
      // Replace placeholders in the template
      let prompt = PROMPT_TEMPLATES.CHECK_GRAMMAR.replace('{{content}}', content);
      
      // Call OpenAI API for grammar checking
      const completion = await openai.chat.completions.create({
        model: userTier === 'premium' ? "gpt-4o" : "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are a professional proofreader specializing in resumes.
            
            Requirements:
            1. Perform a precise, professional proofread of the provided content
            2. Return a JSON object containing:
               - correctedContent: The fully corrected text with proper formatting maintained
               - corrections: An array of specific issues found, each containing:
                 * original: The exact problematic text
                 * corrected: The precise correction
                 * explanation: A brief, professional explanation (5-10 words max)
            3. Focus on grammar, spelling, punctuation, tense consistency, and formatting
            4. Use clean, professional formatting preserving the original structure
            5. Be extremely concise in all explanations
            6. Never add commentary outside the JSON structure`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      // Parse the JSON response
      const responseText = completion.choices[0].message.content?.trim() || '{}';
      const response = JSON.parse(responseText);
      
      return {
        correctedContent: response.correctedContent || content,
        corrections: response.corrections || []
      };
    } catch (error: any) {
      console.error('Error checking grammar:', error);
      
      // For development, return mock response on error
      if (process.env.NODE_ENV === 'development') {
        return mockResponses.checkGrammar(content);
      }
      
      throw new Error(`Failed to check grammar: ${error.message}`);
    }
  }
};

export default aiService; 