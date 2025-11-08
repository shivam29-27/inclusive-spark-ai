import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AudioLines, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emotionColors: Record<string, string> = {
  'Joyful': 'text-green-600 bg-green-100',
  'Anxious': 'text-orange-600 bg-orange-100',
  'Calm': 'text-blue-600 bg-blue-100',
  'Surprised': 'text-yellow-600 bg-yellow-100',
  'Focused': 'text-purple-600 bg-purple-100',
  'Frustrated': 'text-red-600 bg-red-100',
  'Excited': 'text-pink-600 bg-pink-100',
  'Sad': 'text-gray-600 bg-gray-100',
  'Confident': 'text-indigo-600 bg-indigo-100',
  'Confused': 'text-amber-600 bg-amber-100',
};

const VoiceEmotionTranslator = () => {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEmotion = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setEmotion(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text: text.trim() }
      });

      if (error) throw error;

      setEmotion(data.emotion);
      toast.success("Emotion detected successfully!");
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      toast.error("Failed to analyze emotion. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
            <AudioLines className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Voice Emotion Translator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Voice Emotion Translator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Detect and translate emotional tone to build deeper, more empathetic connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AudioLines className="w-5 h-5 text-primary" />
                Enter Text
              </CardTitle>
              <CardDescription>
                Type or paste the text you want to analyze for emotional tone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to analyze emotion..."
                className="min-h-[200px]"
                disabled={isAnalyzing}
              />
              <Button
                onClick={analyzeEmotion}
                disabled={isAnalyzing || !text.trim()}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AudioLines className="w-5 h-5 mr-2" />
                    Analyze Emotion
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle>Emotion Detected</CardTitle>
              <CardDescription>
                The emotional tone detected in your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] flex items-center justify-center">
                {emotion ? (
                  <div className="text-center space-y-4">
                    <div
                      className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                        emotionColors[emotion] || 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{emotion}</p>
                      <p className="text-muted-foreground mt-2">
                        Emotional tone identified
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <AudioLines className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {isAnalyzing
                        ? "Analyzing emotion..."
                        : "Enter text and click analyze to detect emotion"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>Supported Emotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.keys(emotionColors).map((emotionName) => (
                <div
                  key={emotionName}
                  className={`p-3 rounded-lg text-center ${
                    emotionColors[emotionName]
                  }`}
                >
                  <p className="font-semibold">{emotionName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceEmotionTranslator;

