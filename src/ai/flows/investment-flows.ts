'use server';
/**
 * @fileOverview Investment-related flows for searching stocks and getting quotes using Yahoo Finance API.
 *
 * - searchStocks - Searches for stock symbols using a query.
 * - getStockQuotes - Fetches latest quote data for a list of stock symbols.
 * - getHistoricalPrice - Fetches the closing price for a stock on a specific date.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {format} from 'date-fns';

const API_KEY = process.env.RAPIDAPI_KEY || '';
const API_HOST = 'apidojo-yahoo-finance-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

// Search Stocks Flow
const SearchStocksInputSchema = z.object({
  query: z.string(),
});
export type SearchStocksInput = z.infer<typeof SearchStocksInputSchema>;

const SearchStocksOutputSchema = z.array(
  z.object({
    symbol: z.string(),
    name: z.string(),
    quoteType: z.string(),
  })
);
export type SearchStocksOutput = z.infer<typeof SearchStocksOutputSchema>;

export async function searchStocks(
  input: SearchStocksInput
): Promise<SearchStocksOutput> {
  return searchStocksFlow(input);
}

const searchStocksFlow = ai.defineFlow(
  {
    name: 'searchStocksFlow',
    inputSchema: SearchStocksInputSchema,
    outputSchema: SearchStocksOutputSchema,
  },
  async ({query}) => {
    try {
      if (query.length < 2) return [];
      const url = `${BASE_URL}/auto-complete?q=${query}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });
      if (!response.ok) {
        console.error(`Yahoo Finance search failed: ${response.statusText}`);
        return [];
      }
      const data = await response.json();

      if (!data.quotes || data.quotes.length === 0) {
        console.warn('Yahoo Finance API: No matches found');
        return [];
      }

      const matches = data.quotes
        .filter((q: any) => q.symbol && (q.shortname || q.longname))
        .map((match: any) => ({
          symbol: match.symbol,
          name: match.shortname || match.longname,
          quoteType: match.quoteType,
        }));

      return matches;
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }
);

// Get Quotes Flow
const GetQuotesInputSchema = z.object({symbols: z.array(z.string())});
export type GetQuotesInput = z.infer<typeof GetQuotesInputSchema>;

const StockQuoteSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  dayChange: z.number(),
  dayChangePercent: z.string(),
  changeType: z.enum(['up', 'down', 'flat']),
});
const GetQuotesOutputSchema = z.array(StockQuoteSchema);
export type GetQuotesOutput = z.infer<typeof GetQuotesOutputSchema>;

export async function getStockQuotes(
  input: GetQuotesInput
): Promise<GetQuotesOutput> {
  return getStockQuotesFlow(input);
}

const getStockQuotesFlow = ai.defineFlow(
  {
    name: 'getStockQuotesFlow',
    inputSchema: GetQuotesInputSchema,
    outputSchema: GetQuotesOutputSchema,
  },
  async ({symbols}) => {
    if (symbols.length === 0) return [];
    try {
      const url = `${BASE_URL}/market/v2/get-quotes?symbols=${symbols.join(
        ','
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        console.error(
          `Yahoo Finance quote fetch failed: ${response.statusText}`
        );
        return [];
      }
      const data = await response.json();

      if (!data.quoteResponse || !data.quoteResponse.result) {
        console.error('Yahoo Finance quote fetch returned invalid data:', data);
        return [];
      }

      const quotes: GetQuotesOutput = data.quoteResponse.result
        .map((quote: any) => {
          const changeValue = quote.regularMarketChange || 0;
          const changePercent = quote.regularMarketChangePercent || 0;
          return {
            symbol: quote.symbol,
            price: quote.regularMarketPrice || 0,
            dayChange: changeValue,
            dayChangePercent: `${changePercent.toFixed(2)}%`,
            changeType:
              changeValue > 0 ? 'up' : changeValue < 0 ? 'down' : 'flat',
          };
        })
        .filter((q: any) => q.price > 0); // Filter out stocks with no price data

      return quotes;
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
      return [];
    }
  }
);

// Get Historical Price Flow
const GetHistoricalPriceInputSchema = z.object({
  symbol: z.string(),
  date: z.string().describe("The date as an ISO string"),
});
export type GetHistoricalPriceInput = z.infer<
  typeof GetHistoricalPriceInputSchema
>;

const GetHistoricalPriceOutputSchema = z.object({
  price: z.number().optional(),
});
export type GetHistoricalPriceOutput = z.infer<
  typeof GetHistoricalPriceOutputSchema
>;

export async function getHistoricalPrice(
  input: GetHistoricalPriceInput
): Promise<GetHistoricalPriceOutput> {
  return getHistoricalPriceFlow(input);
}

const getHistoricalPriceFlow = ai.defineFlow(
  {
    name: 'getHistoricalPriceFlow',
    inputSchema: GetHistoricalPriceInputSchema,
    outputSchema: GetHistoricalPriceOutputSchema,
  },
  async ({symbol, date}) => {
    try {
      const targetDate = new Date(date);
      // Set periods to encompass the entire target day in UTC
      const period1 = Math.floor(
        new Date(targetDate).setUTCHours(0, 0, 0, 0) / 1000
      );
      const period2 = Math.floor(
        new Date(targetDate).setUTCHours(23, 59, 59, 999) / 1000
      );

      const url = `${BASE_URL}/stock/v3/get-chart?interval=1d&symbol=${symbol}&period1=${period1}&period2=${period2}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        console.error(
          `Yahoo Finance historical price fetch failed: ${response.statusText}`
        );
        return {price: undefined};
      }
      const data = await response.json();

      const result = data?.chart?.result?.[0];
      if (
        !result ||
        !result.timestamp ||
        result.timestamp.length === 0 ||
        !result.indicators?.quote?.[0]?.close
      ) {
        console.warn(
          'Yahoo Finance API: No historical data found for this date.'
        );
        return {price: undefined};
      }

      // The API returns the data for the closest trading day. We take the first one.
      const closePrice = result.indicators.quote[0].close[0];

      return {price: closePrice && typeof closePrice === 'number' ? parseFloat(closePrice.toFixed(2)) : undefined};
    } catch (error) {
      console.error('Error fetching historical price:', error);
      return {price: undefined};
    }
  }
);
