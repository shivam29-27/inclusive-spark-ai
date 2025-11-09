const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, queryHistory } = await req.json();
    console.log('Received sign language query');

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Step 1: Recognize the sign language and convert to text query
    const recognitionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a sign language recognition expert. Analyze the sign language gesture in the image and translate it to clear, natural English text.

Rules:
- Translate sign language gestures (ASL, BSL, ISL, etc.) to English text
- If you see a thumbs up, translate it as "All the best" or similar positive expression
- If multiple signs are shown, translate the complete phrase or sentence
- If no clear sign language is detected, respond with "No sign language detected"
- Be concise and accurate in your translation
- Return ONLY the translated text, nothing else`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Translate this sign language gesture to English text. If this is part of a conversation, consider the context.'
              },
              {
                type: 'image_url',
                image_url: { url: imageData }
              }
            ]
          }
        ],
      }),
    });

    if (!recognitionResponse.ok) {
      if (recognitionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (recognitionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await recognitionResponse.text();
      console.error('AI gateway error:', recognitionResponse.status, errorText);
      throw new Error('AI gateway error');
    }

    const recognitionData = await recognitionResponse.json();
    const recognizedQuery = recognitionData.choices[0].message.content.trim();

    // Check if sign language was detected
    if (!recognizedQuery || recognizedQuery.toLowerCase().includes('no sign language detected')) {
      return new Response(
        JSON.stringify({
          recognizedQuery: recognizedQuery || 'No sign language detected',
          response: null,
          responseInSignLanguage: null,
          error: 'No sign language detected. Please make sure you are signing clearly in the camera.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Process the query and generate a response
    const contextPrompt = queryHistory && queryHistory.length > 0
      ? `Previous conversation context:\n${queryHistory.slice(-3).map((q: any) => `User: ${q.query}\nAssistant: ${q.response}`).join('\n\n')}\n\n`
      : '';

    const queryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a helpful, empathetic AI assistant that responds to queries from sign language users. 

${contextPrompt}

Rules:
- Provide clear, concise, and helpful responses
- Be empathetic and understanding
- Keep responses under 150 words for sign language translation
- If the query is a question, answer it directly
- If the query is a greeting, respond warmly
- If the query is a request, provide helpful information or assistance
- Always be kind and supportive`
          },
          {
            role: 'user',
            content: recognizedQuery
          }
        ],
      }),
    });

    if (!queryResponse.ok) {
      throw new Error('Failed to generate response');
    }

    const responseData = await queryResponse.json();
    const textResponse = responseData.choices[0].message.content.trim();

    // Step 3: Generate sign language representation description
    // Note: In a production system, this would generate actual sign language animation/video
    // For now, we provide a description of how to sign the response
    const signLanguageDescription = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a sign language instruction expert. Given a text response, provide a brief description of how to sign it in American Sign Language (ASL).

Format your response as:
1. Key signs needed (list main signs)
2. Signing order/sequence
3. Important facial expressions or body language

Keep it concise and practical.`
          },
          {
            role: 'user',
            content: `Describe how to sign this response in ASL: "${textResponse}"`
          }
        ],
      }),
    });

    let signLanguageInstructions = '';
    if (signLanguageDescription.ok) {
      const signData = await signLanguageDescription.json();
      signLanguageInstructions = signData.choices[0].message.content.trim();
    }

    return new Response(
      JSON.stringify({
        recognizedQuery,
        response: textResponse,
        responseInSignLanguage: signLanguageInstructions,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sign-language-query function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

