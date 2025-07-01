import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-expense.ts';
import '@/ai/flows/predict-future-expenses.ts';
import '@/ai/flows/investment-flows.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/tools/finance-data.ts';
