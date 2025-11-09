import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand, Video, VideoOff, ArrowLeft, Send, MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface QueryResponse {
  recognizedQuery: string;
  response: string;
  responseInSignLanguage: string;
  timestamp: string;
}

const SignLanguageQuery = () => {
  const { preferences, speak } = useAccessibility();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (preferences.voiceAssist) {
      speak("Welcome to Sign Language Query System. Sign your question or query in front of the camera and click Send Query.");
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast.success("Camera started. Position yourself and sign your query.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
      if (preferences.voiceAssist) {
        speak("Failed to access camera. Please check permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    return null;
  };

  const handleSendQuery = async () => {
    if (!isStreaming) {
      toast.error("Please start the camera first");
      if (preferences.voiceAssist) {
        speak("Please start the camera first");
      }
      return;
    }

    if (isProcessing) {
      toast.info("Please wait for the current query to process");
      return;
    }

    setIsProcessing(true);
    setCurrentResponse(null);

    try {
      const imageData = captureFrame();
      if (!imageData) {
        throw new Error("Failed to capture image");
      }

      // Prepare query history for context
      const history = queryHistory.map(q => ({
        query: q.recognizedQuery,
        response: q.response
      }));

      const { data, error } = await supabase.functions.invoke('sign-language-query', {
        body: { 
          imageData,
          queryHistory: history
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        if (preferences.voiceAssist) {
          speak(data.error);
        }
        return;
      }

      const response: QueryResponse = {
        recognizedQuery: data.recognizedQuery,
        response: data.response,
        responseInSignLanguage: data.responseInSignLanguage,
        timestamp: data.timestamp
      };

      setCurrentResponse(response);
      setQueryHistory(prev => [...prev, response]);
      
      toast.success("Query processed successfully!");
      if (preferences.voiceAssist) {
        speak(`Your query: ${response.recognizedQuery}. Response: ${response.response.substring(0, 100)}`);
      }
    } catch (error: any) {
      console.error("Error processing query:", error);
      const errorMsg = error.message || "Failed to process query. Please try again.";
      toast.error(errorMsg);
      if (preferences.voiceAssist) {
        speak(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
            <Hand className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Sign Language Query System</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sign Language Query System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask questions, get answers - all in sign language. Sign your query and receive responses in sign language.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera Section */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Sign Your Query
              </CardTitle>
              <CardDescription>
                Position yourself in front of the camera and sign your question or query
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  aria-label="Camera feed for sign language input"
                />
                <canvas ref={canvasRef} className="hidden" />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Camera not started</p>
                    </div>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-white font-semibold">Processing your sign language...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button
                    onClick={startCamera}
                    className="bg-primary hover:bg-primary/90 flex-1"
                    aria-label="Start camera"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1"
                      aria-label="Stop camera"
                    >
                      <VideoOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                    <Button
                      onClick={handleSendQuery}
                      disabled={isProcessing}
                      className="bg-primary hover:bg-primary/90 flex-1"
                      aria-label="Send sign language query"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Query
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Response
              </CardTitle>
              <CardDescription>
                Your query and AI response will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentResponse ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Your Query (Recognized):</h3>
                    <p className="text-foreground">{currentResponse.recognizedQuery}</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Response:</h3>
                    <p className="text-foreground whitespace-pre-wrap">{currentResponse.response}</p>
                  </div>

                  {currentResponse.responseInSignLanguage && (
                    <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Hand className="w-4 h-4" />
                        Sign Language Instructions:
                      </h3>
                      <p className="text-foreground whitespace-pre-wrap text-sm">
                        {currentResponse.responseInSignLanguage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 In a full implementation, this would be displayed as animated sign language video.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sign your query and click "Send Query" to get a response</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Query History */}
        {queryHistory.length > 0 && (
          <Card className="mt-6 border-border bg-gradient-card">
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>
                Previous queries and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {queryHistory.slice().reverse().map((item, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="bg-primary/10 rounded-lg p-3 mb-2">
                      <p className="text-sm font-semibold text-foreground">Query:</p>
                      <p className="text-foreground">{item.recognizedQuery}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm font-semibold text-foreground">Response:</p>
                      <p className="text-foreground text-sm">{item.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-6 border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Start Camera</h3>
                <p className="text-muted-foreground">
                  Click "Start Camera" and allow camera access. Position yourself clearly in the frame.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Sign Your Query</h3>
                <p className="text-muted-foreground">
                  Use sign language (ASL, BSL, ISL, etc.) to ask your question or make your query.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Get Response</h3>
                <p className="text-muted-foreground">
                  Click "Send Query" to process. Receive your answer in text and sign language instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignLanguageQuery;

