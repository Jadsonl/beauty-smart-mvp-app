
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("check-subscription: Iniciando função");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("check-subscription: STRIPE_SECRET_KEY não configurada");
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    // Cliente Supabase com service role para bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Cliente para autenticação
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("check-subscription: Token de autorização não fornecido");
      throw new Error("Token de autorização não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("check-subscription: Verificando usuário");
    
    const { data, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !data.user) {
      console.error("check-subscription: Erro de autenticação:", error?.message);
      throw new Error("Usuário não autenticado");
    }

    const user = data.user;
    console.log("check-subscription: Usuário autenticado:", user.email);
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Buscar cliente no Stripe
    console.log("check-subscription: Buscando cliente no Stripe");
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log("check-subscription: Nenhum cliente encontrado no Stripe");
      // Atualizar status no Supabase - sem assinatura
      await supabaseService.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("check-subscription: Cliente encontrado:", customerId);

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determinar tier baseado no preço
      const priceId = subscription.items.data[0].price.id;
      
      switch (priceId) {
        case "price_1RY6qLPXpiLbJ63CnoCv4uFr":
          subscriptionTier = "Autônomo";
          break;
        case "price_1RY6qkPXpiLbJ63CKRaxvAkW":
          subscriptionTier = "Básico";
          break;
        case "price_1RY6n5PXpiLbJ63Ccqpicdz9":
          subscriptionTier = "Premium";
          break;
        default:
          subscriptionTier = "Desconhecido";
      }
      console.log("check-subscription: Assinatura ativa encontrada:", subscriptionTier);
    }

    // Atualizar status no Supabase
    await supabaseService.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    console.log("check-subscription: Sucesso", { subscribed: hasActiveSub, tier: subscriptionTier });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("check-subscription: Erro capturado:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        subscribed: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
