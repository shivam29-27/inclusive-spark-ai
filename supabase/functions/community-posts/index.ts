const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // GET - Fetch all posts
    if (req.method === 'GET') {
      console.log('Fetching community posts');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/community_posts?order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const posts = await response.json();
      return new Response(
        JSON.stringify(posts || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create new post with empathy moderation
    if (req.method === 'POST') {
      const { message, author } = await req.json();
      console.log('Received new post from:', author);

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }

      // Check for toxic language using AI
      const moderationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'You are an empathy moderator. Analyze if the message contains harsh, rude, or unkind language. If it does, respond with JSON: {"toxic": true, "suggestion": "kinder alternative message"}. If the message is kind, respond with JSON: {"toxic": false}. Only return valid JSON, nothing else.'
            },
            { role: 'user', content: message }
          ],
        }),
      });

      const moderationData = await moderationResponse.json();
      const moderationResult = JSON.parse(moderationData.choices[0].message.content);

      let moderation = null;
      if (moderationResult.toxic) {
        moderation = {
          original: message,
          suggestion: moderationResult.suggestion
        };
      }

      // Calculate kindness score (higher if no moderation needed)
      const kindnessScore = moderationResult.toxic ? 50 : Math.floor(Math.random() * 20) + 75;

      // Insert the post
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/community_posts`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          author: author || 'Anonymous',
          message,
          kindness_score: kindnessScore,
          moderation: moderation
        }),
      });

      if (!insertResponse.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await insertResponse.json();
      console.log('Post created:', newPost[0].id);
      
      return new Response(
        JSON.stringify(newPost[0]),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in community-posts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
