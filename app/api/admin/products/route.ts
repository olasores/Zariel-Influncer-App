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

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    // Get all products with admin info
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        admin:profiles!products_admin_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();
    console.log('Admin products POST request body:', body); // Debug log
    
    const { title, description, image_url, price_tokens, category, stock_quantity, admin_id } = body;

    // Validate required fields
    if (!title || !price_tokens || !admin_id) {
      console.log('Missing required fields:', { title, price_tokens, admin_id }); // Debug log
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the admin_id is actually an admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', admin_id)
      .single();

    console.log('Admin verification result:', { admin, adminError }); // Debug log

    if (adminError || !admin || admin.role !== 'admin') {
      console.log('Admin verification failed:', { adminError, admin }); // Debug log
      return NextResponse.json({ error: 'Only admins can create products' }, { status: 403 });
    }

    // Create the product
    const productData = {
      admin_id,
      title,
      description,
      image_url,
      price_tokens: parseInt(price_tokens),
      category: category || 'general',
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : -1,
      status: 'active'
    };
    
    console.log('Creating product with data:', productData); // Debug log

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    console.log('Product creation result:', { product, productError }); // Debug log

    if (productError) throw productError;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();
    const { id, title, description, image_url, price_tokens, category, stock_quantity, status, admin_id } = body;

    if (!id || !admin_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the admin_id is actually an admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', admin_id)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update products' }, { status: 403 });
    }

    // Update the product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .update({
        title,
        description,
        image_url,
        price_tokens: price_tokens ? parseInt(price_tokens) : undefined,
        category,
        stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) throw productError;

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const admin_id = searchParams.get('admin_id');

    if (!id || !admin_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the admin_id is actually an admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', admin_id)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete products' }, { status: 403 });
    }

    // Delete the product
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}