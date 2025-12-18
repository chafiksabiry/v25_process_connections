import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { scenario, response: agentResponse, evaluationCriteria, skillName } = await req.json();

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert contact center trainer. Analyze the agent's response based on ${skillName} criteria.
          Provide detailed feedback in JSON format:
          {
            "score": number (1-100),
            "strengths": ["string"],
            "improvements": ["string"],
            "feedback": "string",
            "tips": ["string"],
            "keyMetrics": {
              "professionalism": number (1-100),
              "effectiveness": number (1-100),
              "customerFocus": number (1-100)
            }
          }`
        },
        {
          role: "user",
          content: `Scenario: ${scenario}\nAgent's Response: ${agentResponse}\nEvaluation Criteria: ${JSON.stringify(evaluationCriteria)}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const feedback = JSON.parse(analysisResponse.choices[0].message.content || '{}');
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('Error analyzing response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

