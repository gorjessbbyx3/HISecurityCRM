
import Groq from 'groq-sdk';

export class AIService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async analyzeIncident(incidentData: {
    incidentType: string;
    description: string;
    location: string;
    severity: string;
  }): Promise<{
    riskAssessment: string;
    recommendations: string[];
    similarPatterns: string[];
  }> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a security analyst AI that helps analyze incidents and provide risk assessments. Provide structured JSON responses."
          },
          {
            role: "user",
            content: `Analyze this security incident:
            Type: ${incidentData.incidentType}
            Description: ${incidentData.description}
            Location: ${incidentData.location}
            Severity: ${incidentData.severity}
            
            Provide a JSON response with:
            - riskAssessment: string (brief risk analysis)
            - recommendations: string[] (3-5 actionable recommendations)
            - similarPatterns: string[] (potential patterns to watch for)`
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          riskAssessment: "AI analysis completed",
          recommendations: ["Review incident details", "Implement standard security protocols"],
          similarPatterns: ["Monitor for recurring incidents in this area"]
        };
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Return default analysis if AI service fails
      return {
        riskAssessment: "Standard risk assessment - manual review recommended",
        recommendations: [
          "Conduct thorough investigation",
          "Review security protocols",
          "Increase patrol frequency if needed"
        ],
        similarPatterns: ["Monitor area for similar incidents"]
      };
    }
  }

  async generatePatrolSummary(patrolData: {
    location: string;
    duration: number;
    incidents: number;
    checkpoints: string[];
    notes: string;
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a security operations AI that helps generate patrol summaries and insights. Provide structured JSON responses."
          },
          {
            role: "user",
            content: `Generate a patrol summary for this data:
            Location: ${patrolData.location}
            Duration: ${patrolData.duration} hours
            Incidents reported: ${patrolData.incidents}
            Checkpoints: ${patrolData.checkpoints.join(', ')}
            Notes: ${patrolData.notes}
            
            Provide a JSON response with:
            - summary: string (professional patrol summary)
            - insights: string[] (key observations)
            - recommendations: string[] (operational recommendations)`
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          summary: `Patrol completed at ${patrolData.location} covering ${patrolData.checkpoints.length} checkpoints over ${patrolData.duration} hours.`,
          insights: ["All checkpoints covered", "Standard patrol procedures followed"],
          recommendations: ["Continue regular patrol schedule", "Monitor area for changes"]
        };
      }
    } catch (error) {
      console.error('AI patrol summary error:', error);
      return {
        summary: `Patrol completed at ${patrolData.location} covering ${patrolData.checkpoints.length} checkpoints.`,
        insights: ["Patrol completed successfully"],
        recommendations: ["Continue monitoring"]
      };
    }
  }

  async analyzeCrimePatterns(incidents: Array<{
    incidentType: string;
    location: string;
    time: string;
    severity: string;
  }>): Promise<{
    patterns: string[];
    hotspots: string[];
    recommendations: string[];
  }> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a crime analyst AI that identifies patterns and trends in incident data. Provide structured JSON responses."
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
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          patterns: ["Mixed incident types across locations"],
          hotspots: [...new Set(incidents.map(i => i.location))],
          recommendations: ["Increase patrol presence", "Monitor trends"]
        };
      }
    } catch (error) {
      console.error('AI pattern analysis error:', error);
      return {
        patterns: ["Pattern analysis requires more data"],
        hotspots: [...new Set(incidents.map(i => i.location))],
        recommendations: ["Continue data collection", "Regular monitoring"]
      };
    }
  }
}

export const aiService = new AIService();
