import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete expired products
    const today = new Date().toISOString()

    const { error: deleteError, data: deletedData } = await supabase
      .from('products')
      .delete()
      .lt('expiration_date', today)

    if (deleteError) throw deleteError

    // Update orders for deleted products
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .in(
        'product_id',
        deletedData?.map((d: any) => d.id) || []
      )
      .in('status', ['pending', 'confirmed'])

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      deletedProducts: deletedData?.length || 0,
      message: 'Cleanup completed successfully',
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
