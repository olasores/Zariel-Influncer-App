import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated and is an admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all profiles using service role (bypasses RLS)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get wallet data for each user
    const usersWithData = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: wallet } = await supabaseAdmin
          .from('token_wallets')
          .select('balance, total_earned, total_spent')
          .eq('user_id', profile.id)
          .maybeSingle();

        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('status, current_period_end')
          .eq('user_id', profile.id)
          .maybeSingle();

        const { count: contentCount } = await supabaseAdmin
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', profile.id);

        const { count: purchaseCount } = await supabaseAdmin
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', profile.id);

        return {
          ...profile,
          wallet: wallet || { balance: 0, total_earned: 0, total_spent: 0 },
          subscription: subscription || null,
          content_count: contentCount || 0,
          purchase_count: purchaseCount || 0,
        };
      })
    );

    return NextResponse.json(usersWithData);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, newBalance, notes } = body;

    if (!userId || newBalance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current wallet
    const { data: wallet } = await supabaseAdmin
      .from('token_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const difference = newBalance - wallet.balance;

    // Update wallet balance
    const { error: walletError } = await supabaseAdmin
      .from('token_wallets')
      .update({ balance: newBalance })
      .eq('user_id', userId);

    if (walletError) throw walletError;

    // Create transaction record
    const { error: txError } = await supabaseAdmin
      .from('token_transactions')
      .insert({
        amount: Math.abs(difference),
        type: difference > 0 ? 'admin_credit' : 'admin_debit',
        description: notes || 'Admin balance adjustment',
        to_user_id: difference > 0 ? userId : null,
        from_user_id: difference < 0 ? userId : null,
      });

    if (txError) throw txError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting balance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
