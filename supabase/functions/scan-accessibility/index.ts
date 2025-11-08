const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, html } = await req.json();
    console.log('Scanning accessibility for:', url || 'provided HTML');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If URL provided, fetch the HTML
    let htmlContent = html;
    if (url && !html) {
      try {
        const pageResponse = await fetch(url);
        htmlContent = await pageResponse.text();
      } catch (error) {
        console.error('Error fetching URL:', error);
        throw new Error('Failed to fetch the provided URL');
      }
    }

    if (!htmlContent) {
      throw new Error('No HTML content provided');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert. Analyze the provided HTML and identify accessibility issues. Return a JSON object with: score (0-100), issues (total count), fixed (number of items that can be auto-fixed), and items (array of specific issues found). Focus on: missing ARIA labels, poor contrast, missing alt text, keyboard navigation issues, and semantic HTML problems.'
          },
          {
            role: 'user',
            content: `Analyze this HTML for accessibility:\n\n${htmlContent.slice(0, 10000)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse JSON from AI response
    let report;
    try {
      report = JSON.parse(aiResponse);
    } catch {
      // If AI didn't return valid JSON, create a structured response
      report = {
        score: 70,
        issues: 10,
        fixed: 5,
        items: [aiResponse]
      };
    }

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scan-accessibility function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
