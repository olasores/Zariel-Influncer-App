import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin environment variables are missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();
    const { product_id, buyer_id, quantity = 1 } = body;

    console.log('Purchase request:', { product_id, buyer_id, quantity }); // Debug log

    if (!product_id || !buyer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the buyer exists and get their current token balance
    const { data: buyer, error: buyerError } = await supabaseAdmin
      .from('profiles')
      .select('id, token_balance')
      .eq('id', buyer_id)
      .single();

    console.log('Buyer verification:', { buyer, buyerError }); // Debug log

    if (buyerError || !buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get product details
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'active')
      .single();

    console.log('Product details:', { product, productError }); // Debug log

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    const totalCost = product.price_tokens * quantity;
    console.log('Purchase calculation:', { totalCost, buyerBalance: buyer.token_balance }); // Debug log

    // Check if buyer has enough tokens
    if ((buyer.token_balance || 0) < totalCost) {
      return NextResponse.json({ 
        error: 'Insufficient tokens',
        required: totalCost,
        available: buyer.token_balance || 0
      }, { status: 400 });
    }

    // Check stock if limited
    if (product.stock_quantity >= 0 && product.stock_quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    try {
      // Start transaction - Update buyer balance
      const { error: buyerUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ token_balance: (buyer.token_balance || 0) - totalCost })
        .eq('id', buyer_id);

      if (buyerUpdateError) throw buyerUpdateError;

      // Update admin balance
      const { data: currentAdmin, error: adminFetchError } = await supabaseAdmin
        .from('profiles')
        .select('token_balance')
        .eq('id', product.admin_id)
        .single();

      if (adminFetchError) throw adminFetchError;

      const { error: adminUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          token_balance: (currentAdmin.token_balance || 0) + totalCost
        })
        .eq('id', product.admin_id);

      if (adminUpdateError) throw adminUpdateError;

      // Update product stock if limited
      if (product.stock_quantity >= 0) {
        const newStock = product.stock_quantity - quantity;
        const { error: stockUpdateError } = await supabaseAdmin
          .from('products')
          .update({
            stock_quantity: newStock,
            status: newStock <= 0 ? 'out_of_stock' : product.status
          })
          .eq('id', product_id);

        if (stockUpdateError) throw stockUpdateError;
      }

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('product_purchases')
        .insert({
          product_id,
          buyer_id,
          admin_id: product.admin_id,
          tokens_paid: totalCost,
          quantity,
          status: 'completed'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create transaction record
      const { error: transactionError } = await supabaseAdmin
        .from('token_transactions')
        .insert({
          from_user_id: buyer_id,
          to_user_id: product.admin_id,
          amount: totalCost,
          transaction_type: 'product_purchase',
          reference_id: purchase.id,
          description: `Purchase of ${product.title}`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      console.log('Purchase completed successfully:', purchase); // Debug log

      return NextResponse.json({
        success: true,
        purchase_id: purchase.id,
        tokens_paid: totalCost
      });

    } catch (transactionError) {
      console.error('Transaction failed, rolling back:', transactionError);
      
      // Rollback buyer balance
      await supabaseAdmin
        .from('profiles')
        .update({ token_balance: buyer.token_balance })
        .eq('id', buyer_id);

      throw transactionError;
    }

  } catch (error: any) {
    console.error('Error processing product purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const buyer_id = searchParams.get('buyer_id');
    const admin_id = searchParams.get('admin_id');

    let query = supabaseAdmin
      .from('product_purchases')
      .select(`
        *,
        product:products(
          id,
          title,
          description,
          image_url,
          category
        ),
        buyer:profiles!product_purchases_buyer_id_fkey(
          id,
          full_name,
          email,
          role
        ),
        admin:profiles!product_purchases_admin_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (buyer_id) {
      query = query.eq('buyer_id', buyer_id);
    } else if (admin_id) {
      // Verify the admin_id is actually an admin
      const { data: admin, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', admin_id)
        .single();

      if (adminError || !admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can view all purchases' }, { status: 403 });
      }
      // Admin can see all purchases
    } else {
      return NextResponse.json({ error: 'Must provide buyer_id or admin_id' }, { status: 400 });
    }

    const { data: purchases, error } = await query;

    if (error) throw error;

    return NextResponse.json({ purchases: purchases || [] });
  } catch (error: any) {
    console.error('Error fetching product purchases:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}