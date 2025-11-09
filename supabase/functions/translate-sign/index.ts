const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    console.log('Received sign language frame for translation');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image for sign language gestures. Convert detected signs to SYMBOLS/EMOJIS.

IMPORTANT: Return ONLY a single symbol/emoji that represents the sign language gesture, NOT text.

Symbol Mapping Rules:
- Thumbs up gesture = 👍
- Thumbs down = 👎
- Pointing/index finger = 👆
- Peace sign (two fingers) = ✌️
- OK sign (circle with thumb and index) = 👌
- Fist = ✊
- Open hand/palm = ✋
- Wave gesture = 👋
- Heart shape with hands = ❤️
- Love/affection gesture = 💕
- Clapping = 👏
- Fingerspelling letters (A-Z) = Return the corresponding letter as a single character
- Numbers (1-10) = Return the corresponding number as a single character
- Space gesture = Return "_space_"
- Delete/backspace gesture = Return "_del_"
- Clear gesture = Return "_clear_"

For fingerspelling:
- If you detect a letter being signed (A, B, C, etc.), return that single letter
- If you detect a number being signed (1, 2, 3, etc.), return that single number

For special commands:
- Space gesture (hand sweeping horizontally) = "_space_"
- Delete gesture (hand wiping motion) = "_del_"
- Clear gesture (both hands clearing) = "_clear_"

If no clear sign language is detected, return: "No sign language detected"

Return ONLY the symbol/emoji/letter/number/command, nothing else.`
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
    const translation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-sign function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
