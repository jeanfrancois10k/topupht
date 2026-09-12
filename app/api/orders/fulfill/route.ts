import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getProvider } from "@/services/providers/registry";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId manquant" }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Read-only in API routes ideally, but required by SSR
          },
        },
      }
    );

    // Verify User Session (Optional but recommended for security, though Admin might trigger it too)
    // If it's triggered by Admin, we might need a Service Role key to bypass RLS, 
    // but for now, we assume the user's session or admin's session is passed.

    // 1. Fetch Order Details (Using service_role key to bypass RLS for backend ops)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { cookies: { getAll() { return [] }, setAll() {} } }
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, game_products(sku)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.status === "SUCCESS") {
      return NextResponse.json({ message: "Commande déjà traitée" });
    }

    // 2. Determine Provider (For now, we route everything to MOCK)
    // In reality, you might look at a provider mapping table.
    const provider = getProvider("MOCK");

    // 3. Call Provider API
    const topupResponse = await provider.topup({
      orderId: order.id,
      playerId: order.player_id,
      serverId: order.server_id,
      productSku: order.game_products?.sku || "UNKNOWN_SKU",
    });

    // 4. Handle Response
    if (topupResponse.success) {
      // Mark as Success
      await supabaseAdmin
        .from("orders")
        .update({ 
          status: "SUCCESS",
          provider_transaction_id: topupResponse.providerTransactionId,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);
        
      return NextResponse.json({ success: true, message: "Livraison réussie" });
    } else {
      // Mark as Failed
      await supabaseAdmin
        .from("orders")
        .update({ 
          status: "FAILED",
          notes: `Échec livraison: ${topupResponse.errorMessage}` 
        })
        .eq("id", orderId);

      // Refund Wallet if paid by WALLET
      if (order.payment_method === "WALLET") {
        const { data: walletData } = await supabaseAdmin
          .from("wallets")
          .select("*")
          .eq("user_id", order.user_id)
          .single();

        if (walletData) {
          const newBalance = parseFloat(walletData.balance) + parseFloat(order.amount);
          await supabaseAdmin
            .from("wallets")
            .update({ balance: newBalance.toString() })
            .eq("id", walletData.id);
            
          // Log refund transaction
          await supabaseAdmin.from("wallet_transactions").insert({
            wallet_id: walletData.id,
            user_id: order.user_id,
            type: "REFUND",
            amount: order.amount,
            balance_before: walletData.balance,
            balance_after: newBalance.toString(),
            reference: order.order_number,
            description: `Remboursement suite à échec livraison (${order.order_number})`,
          } as any);
        }
      }

      return NextResponse.json({ success: false, error: topupResponse.errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("Fulfillment API Error:", error);
    return NextResponse.json({ error: "Erreur interne serveur" }, { status: 500 });
  }
}
