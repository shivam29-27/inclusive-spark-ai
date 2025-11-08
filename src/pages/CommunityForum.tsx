import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Users, ArrowLeft, Send, Heart, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CommunityPost {
  id: string;
  author: string;
  message: string;
  kindness_score: number;
  moderation: {
    original: string;
    suggestion: string;
  } | null;
  created_at: string;
}

const CommunityForum = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchPosts = async () => {
    setIsFetching(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/community-posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts. Please check your configuration.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('community-posts', {
        method: 'POST',
        body: {
          message: message.trim(),
          author: author.trim() || 'Anonymous'
        }
      });

      if (error) throw error;

      toast.success("Post created successfully!");
      setMessage("");
      setAuthor("");
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getKindnessColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Community Forum</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Community Forum
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Safe, moderated space powered by AI empathy filters and kindness scoring.
          </p>
        </div>

        {/* Create Post Section */}
        <Card className="border-border bg-gradient-card mb-8">
          <CardHeader>
            <CardTitle>Create a Post</CardTitle>
            <CardDescription>
              Share your thoughts with the community. All posts are moderated for kindness.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              disabled={isLoading}
            />
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
            <Button
              onClick={createPost}
              disabled={isLoading || !message.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Posting..." : "Post Message"}
            </Button>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {isFetching ? (
            <Card className="border-border bg-gradient-card">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Loading posts...</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-border bg-gradient-card">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="border-border bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {post.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{post.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getKindnessColor(post.kindness_score)} text-white border-0`}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {post.kindness_score}
                        </Badge>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{post.message}</p>
                      {post.moderation && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Moderation Suggestion
                              </p>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                {post.moderation.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;

