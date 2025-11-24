'use server';

/**
 * @fileOverview Generates a textual analysis for a student's report based on evaluation data.
 *
 * - generateTextualReport - A function that generates the textual report.
 * - GenerateTextualReportInput - The input type for the generateTextualReport function.
 * - GenerateTextualReportOutput - The return type for the generateTextualReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextualReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  evaluationData: z
    .string()
    .describe(
      'A comprehensive stringified JSON payload of the student\'s evaluation data, including body measurements, body composition, bone density, and protocol results.'
    ),
  comparisonData: z
    .string()
    .optional()
    .describe(
      'Optional stringified JSON payload of previous evaluation data for comparison (evolution, regression, or stability analysis).'
    ),
});

export type GenerateTextualReportInput = z.infer<typeof GenerateTextualReportInputSchema>;

const GenerateTextualReportOutputSchema = z.object({
  report: z.string().describe('The generated textual analysis report.'),
});

export type GenerateTextualReportOutput = z.infer<typeof GenerateTextualReportOutputSchema>;

export async function generateTextualReport(
  input: GenerateTextualReportInput
): Promise<GenerateTextualReportOutput> {
  return generateTextualReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTextualReportPrompt',
  input: {schema: GenerateTextualReportInputSchema},
  output: {schema: GenerateTextualReportOutputSchema},
  prompt: `You are an experienced fitness trainer. Your task is to generate a textual analysis report for a student based on their evaluation data.

  Student Name: {{{studentName}}}
  Evaluation Data: {{{evaluationData}}}
  Comparison Data (if available): {{{comparisonData}}}

  Analyze the evaluation data and comparison data (if provided) to generate a concise and informative report. Highlight key findings, trends, and areas of improvement.
  Focus on providing a comprehensive overview of the student's physical condition and progress.
  DO NOT generate any clinical recommendations!
  The generated report must not contain HTML tags.
  Make it sound very motivational and encouraging.
  Be as brief as possible but ensure all important information is captured.

  Report:
  `,
});

const generateTextualReportFlow = ai.defineFlow(
  {
    name: 'generateTextualReportFlow',
    inputSchema: GenerateTextualReportInputSchema,
    outputSchema: GenerateTextualReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
