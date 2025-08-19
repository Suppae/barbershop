import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { firstName, lastName, date, time, email, phoneNumber, haircutType } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !date || !time || !email || !phoneNumber || !haircutType) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send data to the external webhook
    const webhookUrl = 'https://ruimiranda12.app.n8n.cloud/webhook-test/52a058b1-25e9-4bf1-a573-78a5d89ea5ee'
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        date,
        time,
        email,
        phoneNumber,
        haircutType,
        timestamp: new Date().toISOString(),
        source: 'lovable-app'
      })
    })

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Dados enviados com sucesso!' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar dados' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})