# Finance Track - Your Personal Finance Partner

<div align="center">
<img src="./src/assets/fintrack.png" alt="Finance Track Logo" height="100">
</div>

<p align="center">
  <strong>A modern, AI-powered personal finance dashboard to track your net worth, manage spending, and achieve your financial goals with confidence.</strong>
</p>

---

Finance Track is more than just a budgeting app; it's your intelligent financial partner. Built for clarity and ease of use, it helps you see the complete picture of your financial life in one place. Whether you're tracking daily expenses, managing debts, or planning for the future, our AI-powered features provide the insights you need to stay in control.

## ✨ Why Choose Finance Track?

- **AI-Powered Simplicity:** From automatically categorizing your expenses to generating personalized financial plans, our AI does the heavy lifting for you.
- **Unified View:** Stop juggling multiple apps. See your bank accounts, credit cards, cash, and debts all in one beautiful dashboard.
- **Actionable Insights:** Understand your spending habits, track your net worth growth, and get a clear view of money you've borrowed or lent.
- **Secure & Private:** Your financial data is yours. With secure authentication and your own private database, you are in full control.
- **Flexible & Forgiving:** Made a mistake? Edit any transaction. Need to make a partial payment on a debt? We've got you covered.

## 🚀 Key Features: A User's Guide

Finance Track is designed to be intuitive. Here’s a look at what you can do:

### 1. The Dashboard: Your Financial Snapshot
Get a bird's-eye view of your financial health. The main dashboard features a dynamic **Net Worth chart**, a summary of all your accounts, and your most recent transactions.

### 2. Smart Expense & Income Tracking
- **Add an Expense:** Simply enter a description and amount, and our AI will automatically categorize it.
- **Split a Bill:** Going out with friends? Use the "Split Expense" option when adding an expense to track who owes you money. Their portion will automatically appear in your "Lending" tab.
- **Add Income:** Record your salary, side hustle income, or any other money you receive.
- **Record a Loan:** If you borrow money from someone, check the "This is borrowed money" box when adding income. The app will create a debt record for you to track in the "Borrowing" page.

### 3. Accounts: All in One Place
View all your accounts, grouped by type: Bank Accounts, Credit Cards, and In-Hand Cash. Click on any account to see its detailed transaction history. You can easily add, edit, or delete accounts as needed.

### 4. Borrowing & Lending: Manage Debts with Ease
- **Borrowing Page:** See a clear list of all the money you owe. When you make a payment, you can choose to **pay in full or make a partial payment**. A full history of your repayments is always available.
- **Lending Page:** This is where you track money others owe you, whether from a split expense or a direct loan. When a friend pays you back, you can settle their debt partially or in full.

### 5. AI Chat: Your Personal Assistant "JoSha"
Have a question? Just ask JoSha! Our AI assistant can:
- Answer questions about your finances, like "What's my net worth?" or "Show my recent transactions."
- Help you navigate the app.
- Provide general financial guidance.

### 6. Personalization
Head to the **Settings** page to customize your experience. Choose your preferred currency (USD, EUR, INR, etc.) and switch between Light, Dark, or System themes.

---

## 🛠️ For Developers: Getting Started Locally

If you'd like to run a local instance of Finance Track for development or testing, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/finance-track.git
    cd finance-track
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env` in the root of your project and add the following keys.

    ```env
    # Firebase Project Credentials
    # Get these from your Firebase project settings
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=

    # Google AI API Key for Genkit
    # Get this from Google AI Studio
    GOOGLE_API_KEY=

    # RapidAPI Key for Yahoo Finance
    # Get this by subscribing to the free plan on RapidAPI
    RAPIDAPI_KEY=
    ```

    - **Firebase:** Create a new project on the [Firebase Console](https://console.firebase.google.com/), create a new Web App, and copy the credentials into the `.env` file. Enable Firestore and Firebase Authentication (Email/Password and Google providers).
    - **Google AI:** Get your API key from [Google AI Studio](https://ai.google.dev/).
    - **RapidAPI:** Subscribe to the free tier of the [Yahoo Finance API on RapidAPI](https://rapidapi.com/apidojo/api/yahoo-finance1) to get your key.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application should now be running on [http://localhost:9002](http://localhost:9002).

## 💻 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
- **Authentication & Database:** [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Generative AI:** [Google AI (Gemini)](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Financial Data:** [Yahoo Finance API](https://rapidapi.com/apidojo/api/yahoo-finance1) via RapidAPI
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---
Developed with ❤️ by [JOnesPeter](https://jonespeter.site/).
