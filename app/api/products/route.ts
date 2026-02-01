import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role to bypass RLS for public reading
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log('Products GET request, category:', category); // Debug log
    console.log('Supabase client config:', { url: process.env.NEXT_PUBLIC_SUPABASE_URL }); // Debug log

    // First, let's test if the table exists
    let testQuery = supabaseAdmin
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    const { count, countError } = await testQuery;
    console.log('Products table test:', { count, countError }); // Debug log

    if (countError) {
      console.error('Products table error:', countError);
      return NextResponse.json({ 
        error: `Products table error: ${countError.message}`,
        details: countError 
      }, { status: 500 });
    }

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        admin:profiles!products_admin_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;
    
    console.log('Products query result:', { 
      productsCount: products?.length || 0, 
      error,
      products: products?.slice(0, 2) // Log first 2 products for debugging
    }); // Debug log

    if (error) {
      console.error('Products query error:', error);
      throw error;
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}