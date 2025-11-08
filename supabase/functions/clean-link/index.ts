const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Cleaning link:', url);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch the webpage content
    let htmlContent;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }
      
      htmlContent = await response.text();
    } catch (error) {
      console.error('Error fetching URL:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch the webpage. Please check if the URL is accessible.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to clean the content and remove ads/annotations
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
            content: 'You are an HTML content cleaner. Your task is to extract the main content from HTML and remove all advertisements, pop-ups, annotations, cookie banners, newsletter signups, and other non-essential elements. Return only clean, readable HTML content with the main article/text. Preserve the structure, headings, paragraphs, lists, and links. Remove scripts, ads, sidebars, footers with ads, and any promotional content. Return valid HTML.'
          },
          {
            role: 'user',
            content: `Clean this HTML content by removing all ads, annotations, and non-essential elements. Return only the main content in clean HTML format:\n\n${htmlContent.slice(0, 15000)}`
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
    const cleanedContent = data.choices[0].message.content;

    // Extract text from HTML for a cleaner reading experience
    const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Extract only the plain text content from HTML. Remove all HTML tags and return clean, readable text with proper formatting preserved (line breaks for paragraphs).'
          },
          {
            role: 'user',
            content: `Extract clean text from this HTML:\n\n${cleanedContent.slice(0, 10000)}`
          }
        ],
      }),
    });

    let cleanText = '';
    if (textResponse.ok) {
      const textData = await textResponse.json();
      cleanText = textData.choices[0].message.content;
    }

    return new Response(
      JSON.stringify({
        cleanedHtml: cleanedContent,
        cleanedText: cleanText,
        originalUrl: url,
        cleanedUrl: url, // In a real implementation, this could be a proxy URL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in clean-link function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

