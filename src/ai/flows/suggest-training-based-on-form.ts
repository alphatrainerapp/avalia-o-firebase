'use server';
/**
 * @fileOverview AI agent that provides training suggestions based on the user's physical form and past measurements.
 *
 * - suggestTraining - A function that suggests training plans based on user's physical form and past measurements.
 * - SuggestTrainingInput - The input type for the suggestTraining function.
 * - SuggestTrainingOutput - The return type for the suggestTraining function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrainingInputSchema = z.object({
  currentMeasurements: z.string().describe('The user\'s current body measurements, including body composition and bone density.'),
  pastMeasurements: z.string().describe('The user\'s past body measurements, including body composition and bone density.'),
  trainingGoals: z.string().describe('The user\'s training goals.'),
});
export type SuggestTrainingInput = z.infer<typeof SuggestTrainingInputSchema>;

const SuggestTrainingOutputSchema = z.object({
  trainingSuggestions: z.string().describe('Suggested training plans based on the user\'s physical form and past measurements.'),
});
export type SuggestTrainingOutput = z.infer<typeof SuggestTrainingOutputSchema>;

export async function suggestTraining(input: SuggestTrainingInput): Promise<SuggestTrainingOutput> {
  return suggestTrainingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrainingPrompt',
  input: {schema: SuggestTrainingInputSchema},
  output: {schema: SuggestTrainingOutputSchema},
  prompt: `You are an AI assistant designed to provide training suggestions to trainers based on a user's physical form and past measurements.

  Instructions:
  1.  Analyze the user's current and past body measurements, including body composition and bone density, in relation to their training goals.
  2.  Suggest a tailored training plan for the trainer to consider.
  3.  Remember the trainer is meant to use this tool and always override the training suggestions it generates. DO NOT generate any clinical recommendations!

Current Measurements: {{{currentMeasurements}}}
Past Measurements: {{{pastMeasurements}}}
Training Goals: {{{trainingGoals}}}

Training Suggestions:`,
});

const suggestTrainingFlow = ai.defineFlow(
  {
    name: 'suggestTrainingFlow',
    inputSchema: SuggestTrainingInputSchema,
    outputSchema: SuggestTrainingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
