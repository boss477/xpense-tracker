import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client using your Service Role Key
// This allows the backend to bypass RLS and insert data securely
const supabase = createClient(
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

    // Clean up boilerplate text to avoid false positive matches like "to 9215676766"
    let cleanedMessage = rawMessage.replace(/Call \d+ for dispute\.?\s*/i, '');
    cleanedMessage = cleanedMessage.replace(/SMS BLOCK .*? to \d+\.?/i, '');

    // 2. Extract the Merchant (Handling multiple ICICI formats)
    let merchant = "Unknown Merchant";

    // FORMAT A: Check for the new format -> "; NEW SARAVANAA S credited."
    const newFormatMatch = cleanedMessage.match(/;\s*([a-zA-Z0-9\s@&*\-]+?)\s+credited/i);
    // FORMAT B: Info format -> "Info: UPI/653121257200/Swiggy."
    const infoFormatMatch = cleanedMessage.match(/Info:\s*UPI\/\d+\/([a-zA-Z0-9\s@&*\-]+?)(?:\.|$)/i);
    // FORMAT C: Old/standard format -> "sent to Swiggy. UPI Ref..."
    const oldFormatMatch = cleanedMessage.match(/(?:sent to|to|VPA|paid to)\s+([a-zA-Z0-9\s@&*\-]+?)(?:\s+on|\s+via|\s+Ref|\s+UPI|\.|$)/i);

    if (newFormatMatch) {
      merchant = newFormatMatch[1].trim();
    } else if (infoFormatMatch) {
      merchant = infoFormatMatch[1].trim();
    } else if (oldFormatMatch) {
      merchant = oldFormatMatch[1].trim();
    }

    // Clean up any trailing punctuation just to be safe
    merchant = merchant.replace(/[.,;]+$/, "");

    // 3. Insert the perfectly parsed data into your Supabase database
    const { error } = await supabase
      .from('expenses')
      .insert([
        {
          amount: amount,
          raw_message: rawMessage,
          category: 'Uncategorized',
          type: 'expense',
          merchant: merchant
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
