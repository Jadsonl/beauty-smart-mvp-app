
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verificar se as variáveis de ambiente estão configuradas
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY não configurada");
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    logStep("Stripe key verified");

    // Criar cliente Supabase com chave anon para autenticação
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("Token de autorização não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      logStep("ERROR: Authentication failed", { error: error?.message });
      throw new Error("Usuário não autenticado");
    }

    const user = data.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse do corpo da requisição
    const requestBody = await req.json();
    const { planType } = requestBody;
    
    logStep("Request body parsed", { planType });

    if (!planType) {
      logStep("ERROR: planType not provided");
      throw new Error("Tipo de plano não fornecido");
    }

    // Mapear planos para preços (IDs corretos do Stripe)
    const priceMapping = {
      AUTONOMO: "price_1RY6qLPXpiLbJ63CnoCv4uFr",
      BASICO: "price_1RY6qkPXpiLbJ63CKRaxvAkW", 
      PREMIUM: "price_1RY6n5PXpiLbJ63Ccqpicdz9"
    };

    const priceId = priceMapping[planType as keyof typeof priceMapping];
    if (!priceId) {
      logStep("ERROR: Invalid plan type", { planType, availablePlans: Object.keys(priceMapping) });
      throw new Error("Tipo de plano inválido");
    }

    logStep("Price ID mapped", { planType, priceId });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // Verificar se já existe um cliente Stripe
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1
    });

    let customerId = undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Criar sessão de checkout
    logStep("Creating checkout session");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/planos?success=true`,
      cancel_url: `${req.headers.get("origin")}/planos?canceled=true`,
    });

    logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    console.error("Erro ao criar checkout:", error);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
