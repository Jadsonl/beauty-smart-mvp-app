
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <title>Token Inválido</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; font-size: 20px; margin-bottom: 16px; }
            p { font-size: 16px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Token Inválido</h2>
            <p>O link de confirmação é inválido ou já foi utilizado.</p>
          </div>
        </body>
        </html>
      `, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the token and check if it's valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('confirmation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found:', tokenError);
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <title>Token Não Encontrado</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; font-size: 20px; margin-bottom: 16px; }
            p { font-size: 16px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Token Não Encontrado</h2>
            <p>O link de confirmação não foi encontrado ou já expirou.</p>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <title>Token Expirado</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; font-size: 20px; margin-bottom: 16px; }
            p { font-size: 16px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">⏰ Token Expirado</h2>
            <p>O link de confirmação expirou. Por favor, solicite um novo link.</p>
          </div>
        </body>
        </html>
      `, {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Check if token was already used
    if (tokenData.used_at) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <title>Já Confirmado</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #27ae60; font-size: 20px; margin-bottom: 16px; }
            p { font-size: 16px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="success">✅ Já Confirmado</h2>
            <p>Este agendamento já foi confirmado anteriormente.</p>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Update appointment status to 'confirmed'
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', tokenData.appointment_id);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return new Response(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <title>Erro na Confirmação</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; font-size: 20px; margin-bottom: 16px; }
            p { font-size: 16px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Erro na Confirmação</h2>
            <p>Ocorreu um erro ao confirmar o agendamento. Tente novamente.</p>
          </div>
        </body>
        </html>
      `, {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Mark token as used
    await supabase
      .from('confirmation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    // Return success page
    const successHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agendamento Confirmado</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
      text-align: center; 
      padding: 50px 20px; 
      background: #f5f5f5; 
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { 
      max-width: 400px; 
      width: 100%;
      background: white; 
      padding: 30px; 
      border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .success { 
      color: #27ae60; 
      font-size: 20px; 
      margin-bottom: 16px; 
      font-weight: 600;
    }
    p { 
      font-size: 16px; 
      line-height: 1.5; 
      color: #333; 
      margin: 16px 0;
    }
    small { 
      color: #666; 
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="success">✅ Agendamento Confirmado!</h2>
    <p>Seu agendamento foi confirmado com sucesso. Obrigado!</p>
    <p><small>Você pode fechar esta janela.</small></p>
  </div>
</body>
</html>`;
    
    return new Response(successHtml, {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=UTF-8'
      },
    });

  } catch (error) {
    console.error('Error in confirm-appointment function:', error);
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <title>Erro Interno</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; font-size: 20px; margin-bottom: 16px; }
          p { font-size: 16px; line-height: 1.5; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">❌ Erro Interno</h2>
          <p>Ocorreu um erro interno. Tente novamente mais tarde.</p>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});
