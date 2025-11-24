'use server';

/**
 * @fileOverview A flow for generating an analysis comparing different evaluations.
 *
 * - generateEvaluationAnalysis - A function that generates an analysis comparing different evaluations.
 * - GenerateEvaluationAnalysisInput - The input type for the generateEvaluationAnalysis function.
 * - GenerateEvaluationAnalysisOutput - The return type for the generateEvaluationAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluationDataSchema = z.object({
  date: z.string().describe('The date of the evaluation (YYYY-MM-DD).'),
  bodyMeasurements: z.object({
    weight: z.number().describe('Weight in kilograms.'),
    height: z.number().describe('Height in centimeters.'),
    waistCircumference: z.number().describe('Waist circumference in centimeters.'),
    hipCircumference: z.number().describe('Hip circumference in centimeters.'),
  }).describe('Body measurements of the individual.'),
  bodyComposition: z.object({
    bodyFatPercentage: z.number().describe('Body fat percentage.'),
    muscleMass: z.number().describe('Muscle mass in kilograms.'),
    boneDensity: z.number().describe('Bone density.'),
  }).describe('Body composition data.'),
});

const GenerateEvaluationAnalysisInputSchema = z.object({
  evaluations: z.array(EvaluationDataSchema).describe('An array of evaluation data to compare.'),
  analysisType: z.enum(['evolution', 'regression', 'stability']).describe('The type of analysis to perform.'),
});
export type GenerateEvaluationAnalysisInput = z.infer<typeof GenerateEvaluationAnalysisInputSchema>;

const GenerateEvaluationAnalysisOutputSchema = z.object({
  analysisReport: z.string().describe('A textual analysis comparing the provided evaluations.'),
});
export type GenerateEvaluationAnalysisOutput = z.infer<typeof GenerateEvaluationAnalysisOutputSchema>;

export async function generateEvaluationAnalysis(input: GenerateEvaluationAnalysisInput): Promise<GenerateEvaluationAnalysisOutput> {
  return generateEvaluationAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationAnalysisPrompt',
  input: {schema: GenerateEvaluationAnalysisInputSchema},
  output: {schema: GenerateEvaluationAnalysisOutputSchema},
  prompt: `You are an expert fitness and health analyst.

You are provided with a series of physical evaluations for an individual, and asked to perform a specific type of analysis.

The analysis should identify key trends and insights based on the provided data. Focus on significant changes and potential areas of concern or improvement.

Evaluations:
{{#each evaluations}}
  Date: {{date}}
  Body Measurements: Weight: {{bodyMeasurements.weight}} kg, Height: {{bodyMeasurements.height}} cm, Waist: {{bodyMeasurements.waistCircumference}} cm, Hips: {{bodyMeasurements.hipCircumference}} cm
  Body Composition: Body Fat %: {{bodyComposition.bodyFatPercentage}}%, Muscle Mass: {{bodyComposition.muscleMass}} kg, Bone Density: {{bodyComposition.boneDensity}}
{{/each}}

Analysis Type: {{analysisType}}

Generate a detailed textual analysis report summarizing the findings. The report should be suitable for a trainer to review and understand the client's progress or regression. DO NOT generate any clinical recommendations!
`,
});

const generateEvaluationAnalysisFlow = ai.defineFlow(
  {
    name: 'generateEvaluationAnalysisFlow',
    inputSchema: GenerateEvaluationAnalysisInputSchema,
    outputSchema: GenerateEvaluationAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
