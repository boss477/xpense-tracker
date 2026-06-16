import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client dynamically inside the handler
// This prevents Next.js from throwing errors during the static build phase
// if the SUPABASE_SERVICE_ROLE_KEY environment variable is not set at build time.
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawMessage = body.raw_message;

    if (!rawMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 1. Extract the Amount
    const amountMatch = rawMessage.match(/(?:Rs\.?|INR)\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Clean up boilerplate text to avoid false positive matches
    let cleanedMessage = rawMessage.replace(/Call \d+ for dispute\.?\s*/i, '');
    cleanedMessage = cleanedMessage.replace(/SMS BLOCK .*? to \d+\.?/i, '');

    // Determine if this is an Income transaction
    const isIncome = /is credited with/i.test(cleanedMessage) || /credited to/i.test(cleanedMessage);
    const transactionType = isIncome ? 'income' : 'expense';
    const initialCategory = isIncome ? 'Income' : 'Uncategorized';

    // 2. Extract the Merchant
    let merchant = "Unknown Merchant";

    // FORMAT A: Check for the new format -> "; NEW SARAVANAA S credited."
    const newFormatMatch = cleanedMessage.match(/;\s*(.+?)\s+credited/i);
    // FORMAT B: Info format -> "Info: UPI/653121257200/Swiggy."
    const infoFormatMatch = cleanedMessage.match(/Info:\s*UPI\/\d+\/(.+?)(?:\.|$|\s)/i);
    // FORMAT C: Old/standard format -> "sent to Swiggy. UPI Ref..."
    const oldFormatMatch = cleanedMessage.match(/(?:sent to|paid to|to|VPA)\s+(.+?)(?:\s+on|\s+via|\s+Ref|\s+UPI|\.|$)/i);
    // FORMAT D: Income format -> "from REWAA KAMAL BAT."
    const incomeFormatMatch = cleanedMessage.match(/from\s+(.+?)(?:\.|\s+UPI|$)/i);

    if (newFormatMatch) {
      merchant = newFormatMatch[1].trim();
    } else if (infoFormatMatch) {
      merchant = infoFormatMatch[1].trim();
    } else if (oldFormatMatch) {
      merchant = oldFormatMatch[1].trim();
    } else if (incomeFormatMatch) {
      merchant = incomeFormatMatch[1].trim();
    }

    // Clean up any trailing punctuation just to be safe
    merchant = merchant.replace(/[.,;]+$/, "").trim();

    // 3. Extract the Exact Transaction Date (Fixes "Slow SMS" lag)
    let transactionDate = new Date(); // Fallback to "right now" if the text has no date
    
    // Look for ICICI's specific date format: "on 14-Jun-26"
    const dateMatch = rawMessage.match(/on\s+(\d{1,2}-[a-zA-Z]{3}-\d{2})/i);
    
    if (dateMatch) {
      // Split "14-Jun-26" into pieces
      const dateParts = dateMatch[1].split('-'); 
      // Rebuild it so JavaScript never gets confused: "14 Jun 2026"
      const cleanDateString = `${dateParts[0]} ${dateParts[1]} 20${dateParts[2]}`;
      
      const parsedDate = new Date(cleanDateString);
      
      // If it parsed successfully, update the calendar date but KEEP the current time!
      if (!isNaN(parsedDate.getTime())) {
        transactionDate.setFullYear(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
      }
    }

    // 4. Insert into Supabase WITH the forced timestamp
    const { error } = await getSupabase()
      .from('expenses')
      .insert([
        {
          amount: amount,
          raw_message: rawMessage,
          category: initialCategory,
          type: transactionType,
          merchant: merchant,
          created_at: transactionDate.toISOString()
        }
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw error;
    }

    // 4. Return success to MacroDroid
    return NextResponse.json({ success: true, merchant, amount });

  } catch (error) {
    console.error("Ingestion Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
