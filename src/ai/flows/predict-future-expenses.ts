'use server';

/**
 * @fileOverview Predicts future expenses based on past spending patterns using AI.
 *
 * - predictFutureExpenses - A function that handles the prediction of future expenses.
 * - PredictFutureExpensesInput - The input type for the predictFutureExpenses function.
 * - PredictFutureExpensesOutput - The return type for the predictFutureExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictFutureExpensesInputSchema = z.object({
  pastSpendingData: z
    .string()
    .describe(
      'A string containing the user historical spending data, including categories and amounts.'
    ),
  predictionHorizon: z
    .string()
    .describe(
      'The number of months/years for which the expenses are predicted. E.g., 3 months, 1 year.'
    ),
});
export type PredictFutureExpensesInput = z.infer<
  typeof PredictFutureExpensesInputSchema
>;

const PredictedExpenseSchema = z.object({
    month: z.string().describe("The month of the predicted expense."),
    predicted: z.number().describe("The predicted expense amount.")
});

const PredictFutureExpensesOutputSchema = z.object({
  predictedExpenses: z.array(PredictedExpenseSchema)
    .describe('An array of predicted expenses for the specified horizon.'),
});
export type PredictFutureExpensesOutput = z.infer<
  typeof PredictFutureExpensesOutputSchema
>;

export async function predictFutureExpenses(
  input: PredictFutureExpensesInput
): Promise<PredictFutureExpensesOutput> {
  return predictFutureExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFutureExpensesPrompt',
  input: {schema: PredictFutureExpensesInputSchema},
  output: {schema: PredictFutureExpensesOutputSchema},
  prompt: `You are an AI financial advisor. Analyze the user's past spending data and predict their future expenses for the specified time horizon.

Past Spending Data: {{{pastSpendingData}}}
Prediction Horizon: {{{predictionHorizon}}}

Based on this information, provide a detailed prediction of future expenses.
Return the data as a JSON object with a 'predictedExpenses' key, containing an array of objects, with "month" and "predicted" keys. For example: { "predictedExpenses": [{ "month": "August", "predicted": 3250 }] }.
`,
});

const predictFutureExpensesFlow = ai.defineFlow(
  {
    name: 'predictFutureExpensesFlow',
    inputSchema: PredictFutureExpensesInputSchema,
    outputSchema: PredictFutureExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
