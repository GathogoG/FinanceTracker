# Finance Track Application Documentation

## Overview

Finance Track is a personal finance management application designed to help users track their net worth, manage accounts, monitor investments, and plan their financial future. The application is built with Next.js, Firebase, and Google's Generative AI.

## Core Features

### 1. Dashboard (page: /dashboard)
- **Net Worth Chart:** A visual representation of the user's net worth over time. It can be viewed on a monthly or yearly basis.
- **Accounts Summary:** A card displaying all connected accounts (Bank, Credit Card, Cash) and their balances, along with the total net worth.
- **Recent Transactions:** A list of the 5 most recent transactions.

### 2. Accounts (page: /dashboard/accounts)
- **View All Accounts:** The Accounts page lists all user-created accounts, grouped by type: Bank Accounts, Credit Cards, and In-Hand Cash.
- **Add Account:** Users can add new accounts by clicking the "Add Account" button.
    - **Types:** Bank Account, Credit Card, Cash.
    - **Details for Credit Cards:** When adding a credit card, users must also provide a Credit Limit and a monthly Billing Cycle Day.
- **View Account Details:** Clicking on an account navigates to a detailed page showing the account's summary and a complete list of its transactions.
- **Edit/Delete Account:** From the accounts list, users can use the three-dot menu to edit or delete an account. Deleting an account is permanent and will remove all associated transactions.
- **Pay Bill:** The "Pay Bill" button allows users to record a payment from a bank account to a credit card.

### 3. Transactions (page: /dashboard/transactions)
- **View All Transactions:** This page displays a complete history of all transactions.
- **Filtering:** Users can filter transactions by type (All, Income, Expenses), month, and year.
- **Add Expense:** Users can add an expense, providing a description, amount, and source account. The AI will automatically categorize the expense.
    - **Splitting:** An option to "Split Expense" allows users to track money owed to them by friends.
- **Add Income:** Users can add income, specifying the description, amount, and the account to deposit it into.
    - **Borrowing:** There is an option to mark income as "borrowed money." If checked, the user must specify the lender's name. This creates a debt record.
- **Add Transfer:** Users can record a transfer of funds between two of their non-credit-card accounts.

### 4. Borrowing (page: /dashboard/borrowing)
- This page lists all outstanding debts that were recorded using the "borrowed money" option in the Add Income dialog.
- **Settle Debt:** Users can settle a debt by clicking the "Settle" button, which opens a dialog to pay in full or make a partial payment. A full history of repayments is available.

### 5. Lending (page: /dashboard/lending)
- This page lists money others owe to the user, either from a split expense or a direct loan.
- **Settle Debt:** Users can record a full or partial repayment from a friend. A full history of repayments is available.

### 6. Help & Support (page: /dashboard/help)
- **FAQ:** An interactive list of frequently asked questions.
- **AI Support Chat:** A link to the AI Chat page for immediate assistance.
- **Submit Feedback:** A form for users to submit feedback, suggestions, or bug reports directly to the admin.

### 7. AI Chat (page: /dashboard/chat)
- Users can chat with an AI assistant for help with financial questions or questions about how to use the app. The AI can provide navigation buttons to relevant pages.
- **Personalized Financial Plan:** Users can ask the AI to create a personalized financial plan by providing their monthly income, expenses, and financial goals.

### 8. Settings (page: /dashboard/settings)
- **Currency:** Users can change their preferred display currency (e.g., USD, EUR, INR).
- **Theme:** Users can switch between Light, Dark, and System themes for the application interface.

### 9. Admin Section
- **Access:** Users with an `isAdmin` flag in their profile can access the "Admin" section from the sidebar.
- **User Chats (page: /dashboard/admin/chat):** The admin can view a list of all user conversations. They can click on a conversation to view the full chat history and manually send messages to the user.
- **Feedback & Suggestions (page: /dashboard/admin/feedback):** The admin can view all feedback submitted by users, including the user's details and the content of their message.

## Database Structure (Firestore)

This is a simplified overview of the Firestore database structure to help you understand the available data.

### `users/{userId}`
- **uid**: `string` - The user's unique ID.
- **displayName**: `string`
- **email**: `string`
- **photoURL**: `string` (optional)
- **isAdmin**: `boolean` (optional)
- **preferences**: `object`
  - **currency**: `string` (e.g., "INR", "USD")
  - **theme**: `string` (e.g., "light", "dark", "system")

### `users/{userId}/accounts/{accountId}`
- **name**: `string`
- **type**: `string` ("Bank Account", "Credit Card", "Cash")
- **balance**: `number`
- **creditLimit**: `number` (for Credit Card type)
- **billingCycleDay**: `number` (for Credit Card type)

### `users/{userId}/transactions/{transactionId}`
- **description**: `string`
- **amount**: `number` (negative for expenses, positive for income)
- **category**: `string`
- **date**: `Timestamp`
- **accountId**: `string` (reference to the account)

### `users/{userId}/borrows/{borrowId}`
- **lender**: `string`
- **originalAmount**: `number`
- **remainingAmount**: `number`
- **date**: `Timestamp`
- **status**: `string` ("outstanding", "settled")
- **settledDate**: `Timestamp` (optional)

### `users/{userId}/borrows/{borrowId}/settlements/{settlementId}`
- **amount**: `number`
- **date**: `Timestamp`

### `users/{userId}/lent/{lentId}`
- **borrower**: `string`
- **description**: `string`
- **originalAmount**: `number`
- **remainingAmount**: `number`
- **date**: `Timestamp`
- **status**: `string` ("outstanding", "settled")
- **settledDate**: `Timestamp` (optional)

### `users/{userId}/lent/{lentId}/settlements/{settlementId}`
- **amount**: `number`
- **date**: `Timestamp`

### `chats/{userId}`
- This document holds metadata about a chat session.
- **lastMessageAt**: `Timestamp`
- **user**: `object`
  - **displayName**: `string`
  - **email**: `string`
  - **photoURL**: `string`

### `chats/{userId}/messages/{messageId}`
- **text**: `string`
- **sender**: `string` ("user", "assistant", "admin")
- **timestamp**: `Timestamp`
- **navigation**: `object` (optional)
  - **label**: `string`
  - **href**: `string`
