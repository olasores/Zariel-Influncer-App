import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Simple products test API called');
    
    // Test 1: Check if products table exists
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log('Products table count test:', { count, countError });
    
    if (countError) {
      return NextResponse.json({ 
        error: 'Products table not found',
        details: countError 
      }, { status: 500 });
    }

    // Test 2: Get products without join
    const { data: simpleProducts, error: simpleError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    console.log('Simple products query:', { simpleProducts, simpleError });

    // Test 3: Get products with join
    const { data: products, error } = await supabase
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
    
    console.log('Products with join query:', { products, error });

    return NextResponse.json({ 
      tableExists: !countError,
      count,
      simpleProducts,
      products,
      errors: { countError, simpleError, error }
    });
  } catch (error: any) {
    console.error('Products test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}