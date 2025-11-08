import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, ArrowLeft, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const CleanLink = () => {
  const { preferences, speak } = useAccessibility();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedContent, setCleanedContent] = useState<{
    cleanedHtml: string;
    cleanedText: string;
    originalUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    speak("Welcome to Clean Link. Enter a URL to remove ads and annotations.");
  }, []);

  const handleClean = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      speak("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      speak("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setCleanedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('clean-link', {
        body: { url: url.trim() }
      });

      if (error) throw error;

      setCleanedContent(data);
      toast.success("Link cleaned successfully!");
      speak("Link cleaned successfully. Content is ready to read.");
    } catch (error: any) {
      console.error("Error cleaning link:", error);
      const errorMsg = error.message || "Failed to clean link. Please try again.";
      toast.error(errorMsg);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      speak("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
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
            <Link2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Clean Link</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Clean Link - Ad-Free Reading
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Remove ads, annotations, and distractions from any webpage for a clean reading experience.
          </p>
        </div>

        {/* Input Section */}
        <Card className="border-border bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Enter URL
            </CardTitle>
            <CardDescription>
              Paste the URL of the webpage you want to read without ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-base font-semibold">
                Website URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleClean();
                    }
                  }}
                  placeholder="https://example.com/article"
                  disabled={isLoading}
                  className="h-12 text-base rounded-lg"
                  aria-label="Website URL"
                  aria-required="true"
                />
                <Button
                  onClick={handleClean}
                  disabled={isLoading || !url.trim()}
                  className="bg-primary hover:bg-primary/90 h-12 px-8"
                  aria-label="Clean URL"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Clean Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {cleanedContent && (
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cleaned Content</CardTitle>
                  <CardDescription>
                    Ad-free, distraction-free reading experience
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(cleanedContent.cleanedText)}
                    aria-label="Copy cleaned text"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(cleanedContent.originalUrl, '_blank')}
                    aria-label="Open original URL"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Clean Text</TabsTrigger>
                  <TabsTrigger value="html">HTML View</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <div className="bg-muted rounded-lg p-6 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-foreground">
                        {cleanedContent.cleanedText || cleanedContent.cleanedHtml.replace(/<[^>]*>/g, ' ').trim()}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <div className="bg-muted rounded-lg p-6 max-h-[600px] overflow-y-auto">
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: cleanedContent.cleanedHtml }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Enter URL</h3>
                <p className="text-muted-foreground">
                  Paste the URL of any webpage you want to read
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. AI Cleaning</h3>
                <p className="text-muted-foreground">
                  AI removes all ads, annotations, and distractions automatically
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Clean Reading</h3>
                <p className="text-muted-foreground">
                  Enjoy ad-free, distraction-free content in a clean format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanLink;

