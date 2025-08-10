
import Groq from 'groq-sdk';

interface IncidentData {
  incidentType: string;
  description: string;
  location: string;
  severity: string;
}

interface PatrolData {
  location: string;
  checkpoints: string[];
  duration: number;
}

interface CrimePattern {
  patterns: string[];
  hotspots: string[];
  recommendations: string[];
}

interface IncidentAnalysis {
  riskAssessment: string;
  recommendedActions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PatrolSummary {
  summary: string;
  insights: string[];
  recommendations: string[];
}

class AIService {
  private groq: Groq;

  constructor() {
    // Initialize Groq client if API key is available
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    } else {
      console.warn('GROQ_API_KEY not found, AI features will be limited');
    }
  }

  async analyzeIncident(incident: IncidentData): Promise<IncidentAnalysis> {
    if (!this.groq) {
      return this.getFallbackIncidentAnalysis(incident);
    }

    try {
      const systemPrompt = process.env.AI_SYSTEM_PROMPT || 
        "You are a security analyst AI that assesses incident risk and provides actionable recommendations. Respond only with valid JSON.";
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this security incident:
            Type: ${incident.incidentType}
            Description: ${incident.description}
            Location: ${incident.location}
            Severity: ${incident.severity}
            
            Provide a JSON response with:
            - riskAssessment: string (brief risk assessment)
            - recommendedActions: string[] (specific actions to take)
            - priority: "low" | "medium" | "high" | "critical"`
          }
        ],
        model: process.env.AI_MODEL || "mixtral-8x7b-32768",
        temperature: parseFloat(process.env.AI_TEMPERATURE || "0.2"),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || "500"),
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return this.getFallbackIncidentAnalysis(incident);
      }
    } catch (error) {
      console.error('AI incident analysis error:', error);
      return this.getFallbackIncidentAnalysis(incident);
    }
  }

  private getFallbackIncidentAnalysis(incident: IncidentData): IncidentAnalysis {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical'
    };

    return {
      riskAssessment: `${incident.incidentType} incident at ${incident.location} requires standard security response protocols.`,
      recommendedActions: [
        'Secure the area',
        'Document all evidence',
        'Contact appropriate authorities if required',
        'File incident report'
      ],
      priority: severityMap[incident.severity] || 'medium'
    };
  }

  async generatePatrolSummary(patrolData: PatrolData): Promise<PatrolSummary> {
    if (!this.groq) {
      return this.getFallbackPatrolSummary(patrolData);
    }

    try {
      const systemPrompt = process.env.AI_PATROL_PROMPT || 
        "You are a security patrol analyst that creates professional patrol summaries. Respond only with valid JSON.";
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate a patrol summary for:
            Location: ${patrolData.location}
            Checkpoints: ${patrolData.checkpoints.join(', ')}
            Duration: ${patrolData.duration} hours
            
            Provide a JSON response with:
            - summary: string (professional patrol summary)
            - insights: string[] (key observations)
            - recommendations: string[] (future recommendations)`
          }
        ],
        model: process.env.AI_MODEL || "mixtral-8x7b-32768",
        temperature: parseFloat(process.env.AI_TEMPERATURE || "0.3"),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || "600"),
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return this.getFallbackPatrolSummary(patrolData);
      }
    } catch (error) {
      console.error('AI patrol summary error:', error);
      return this.getFallbackPatrolSummary(patrolData);
    }
  }

  private getFallbackPatrolSummary(patrolData: PatrolData): PatrolSummary {
    return {
      summary: `Patrol completed at ${patrolData.location} covering ${patrolData.checkpoints.length} checkpoints over ${patrolData.duration} hours.`,
      insights: ["All checkpoints covered", "Standard patrol procedures followed"],
      recommendations: ["Continue regular patrol schedule", "Monitor area for changes"]
    };
  }

  async analyzeCrimePatterns(incidents: Array<{
    incidentType: string;
    location: string;
    time: string;
    severity: string;
  }>): Promise<CrimePattern> {
    if (!this.groq) {
      return this.getFallbackCrimePatterns(incidents);
    }

    try {
      const systemPrompt = process.env.AI_CRIME_ANALYSIS_PROMPT || 
        "You are a crime analyst AI that identifies patterns and trends in incident data. Provide structured JSON responses.";
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze these recent incidents for patterns:
            ${incidents.map(i => `${i.incidentType} at ${i.location} on ${i.time} (${i.severity})`).join('\n')}
            
            Provide a JSON response with:
            - patterns: string[] (identified crime patterns)
            - hotspots: string[] (high-activity locations)
            - recommendations: string[] (strategic recommendations)`
          }
        ],
        model: process.env.AI_MODEL || "mixtral-8x7b-32768",
        temperature: parseFloat(process.env.AI_TEMPERATURE || "0.3"),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || "1000"),
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return this.getFallbackCrimePatterns(incidents);
      }
    } catch (error) {
      console.error('AI pattern analysis error:', error);
      return this.getFallbackCrimePatterns(incidents);
    }
  }

  private getFallbackCrimePatterns(incidents: Array<{
    incidentType: string;
    location: string;
    time: string;
    severity: string;
  }>): CrimePattern {
    return {
      patterns: ["Mixed incident types across locations"],
      hotspots: [...new Set(incidents.map(i => i.location))],
      recommendations: ["Increase patrol presence", "Monitor trends", "Continue data collection"]
    };
  }
}

export const aiService = new AIService();
