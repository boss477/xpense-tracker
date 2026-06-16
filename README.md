# 💸 Cashew Clone — Expense Triage & Automation Engine

Cashew Clone is a sleek, real-time personal finance manager and expense triage system. It automatically ingests financial transaction SMS alerts directly from your Android phone, parses the amount, merchant, and transaction date, and feeds them into a dashboard where you can easily categorize them.

Designed with **Next.js 15 (App Router)**, **Supabase**, and styled using **Vanilla Tailwind CSS**, it is built to run fast and look premium.

## 📸 App Preview & Demo

| Dashboard Overview | Analytics Insights |
| :---: | :---: |
| ![Dashboard Screenshot](https://raw.githubusercontent.com/boss477/xpense-tracker/master/public/dashboard-screenshot.png) | ![Insights Screenshot](https://raw.githubusercontent.com/boss477/xpense-tracker/master/public/insights-screenshot.png) |

### 🎥 Video Demonstration
<!-- Add your video embed or link here -->
*(Video Demo link will be added here)*

---


## 🚀 Key Features

* **Real-time SMS Ingestion:** API endpoint `/api/ingest` built specifically for phone automation tools like **MacroDroid**.
* **Smart Ingestion Parser:** Automatically extracts merchant, transaction type (income/expense), amount (in INR/Rs.), and date from standard transaction alerts.
* **Instant Dashboard Triage:** View, triage, and categorize your uncategorized expenses dynamically using real-time database subscriptions.
* **Beautiful Analytics:** An interactive donut and bar chart overview of your spending history, categories, and income trends.

---

## 🛠️ Self-Hosting Setup Guide

Anyone can clone and run their own copy of this tracker. Follow the steps below to set it up:

### 1. Database Setup (Supabase)
Create a free project on [Supabase](https://supabase.com/) and execute the following SQL in the SQL Editor to create the `expenses` table:

```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC NOT NULL,
  merchant TEXT NOT NULL,
  raw_message TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  type TEXT DEFAULT 'expense'
);

-- Optional: Enable Indexes for speed
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory (this file is ignored by Git to keep your credentials safe):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_INGEST_SECRET=your-super-secret-token-here
```

### 3. Deploy the App
Deploy the Next.js app to [Vercel](https://vercel.com/):
1. Import your cloned GitHub repository.
2. Add the environment variables from your `.env.local` to the Vercel project configuration.
3. Deploy! You will receive a production URL (e.g., `https://your-app-name.vercel.app`).

### 4. Deploy with 1-Click
You can also deploy directly using this Vercel Deploy button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/boss477/xpense-tracker)

---

## 📱 MacroDroid Configuration (Android Automation)

To forward incoming transaction SMS alerts to your web app in real-time, configure **MacroDroid** on your Android device:

### Trigger: SMS Received
* **Trigger:** `SMS Received`
* **Sender:** *Select the contact names/codes of your banks (e.g., `AD-ICICIB`, `HDFCBK`)* or select `Any Sender` if you want to filter messages on your own.
* **Message Content:** `Matches wildcard` -> `*Rs*` or `*INR*` (to only capture messages containing transactions).

### Action: HTTP POST Ingestion
* **Action:** `HTTP POST`
* **URL:** `https://your-deployed-app-url.vercel.app/api/ingest`
* **Content Type:** `application/json`
* **Header:** Add a new header with Name: `x-api-secret` and Value: `your-super-secret-token-here` (to match your environment variable).
* **JSON Body:**
  ```json
  {
    "raw_message": "[sms_message]"
  }
  ```
  *(Note: `[sms_message]` is a MacroDroid magic text variable that automatically expands to the contents of the received text message).*

---

## 💬 Need Help Setting Up?

If you are setting up this tracker for yourself and need assistance with the **MacroDroid macro** configuration, database schema, or hosting deployment:

👉 **Contact me — I will gladly help you get it running!**

* 📧 **Email:** [fawaz0212kb@gmail.com](mailto:fawaz0212kb@gmail.com)
* 💼 **LinkedIn:** [Fawaz Ahamed](https://www.linkedin.com/in/fawaz-ahamed-498239203/)

---

## 🛠️ Development

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test.

---

## 🤝 Contributing

Does your bank use a different SMS format? Open a Pull Request and add your bank's regex to the parsing engine! All contributions to expand bank format support are highly appreciated.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](file:///c:/Users/fawaz/cashew-clone/LICENSE) file for details.

