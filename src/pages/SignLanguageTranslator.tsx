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

// --- MODIFICATION: New constant for loop delay ---
const TRANSLATE_LOOP_DELAY = 500;

const SignLanguageTranslator = () => {
  const { preferences, speak } = useAccessibility();
  const [isStreaming, setIsStreaming] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(null);
  const [mode, setMode] = useState<"translate" | "query">("translate");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // --- MODIFICATION: Replaced intervalRef with loopTimeoutRef and mountedRef ---
  const loopTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

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
    stopTranslationLoop();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setTranslation("");
    setCurrentResponse(null);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return null;
    
    const canvas = document.createElement('canvas');
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
    stopTranslationLoop(); 
    
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
    setTranslation("");

    try {
      const imageData = captureFrame();
      if (!imageData) {
        throw new Error("Failed to capture image");
      }
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


  // --- MODIFICATION: Added logic to specifically handle and filter the "No sign language detected" message ---
  const captureAndTranslate = async () => {
    // Guards to stop the loop
    if (isProcessing || !mountedRef.current || !isStreaming || mode !== "translate") {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const imageData = captureFrame();
      if (!imageData) {
        // Skip this frame and continue the loop
        console.warn("Skipped frame: Failed to capture image.");
        // Continue to finally block to schedule next iteration
      } else {
        const { data, error } = await supabase.functions.invoke('translate-sign', {
          body: { imageData }
        });
        
        if (error) throw error;
        
        if (data?.translation) {
          const symbol = data.translation.trim();
          
          // Filter out "No sign language detected" messages
          if (
            symbol && 
            symbol !== "No sign language detected" &&
            symbol !== "No sign language detected."
          ) {
            console.log("Recognized Symbol:", symbol);
            
            // --- SYMBOL DISPLAY LOGIC ---
            // Only show the last detected symbol (replace, don't accumulate)
            if (!symbol.startsWith("_")) {
              // Replace with the new symbol (only show last output)
              setTranslation(symbol);
              
              // Voice assistance: speak the symbol description if it's an emoji
              if (preferences.voiceAssist) {
                const symbolDescriptions: Record<string, string> = {
                  '👍': 'thumbs up',
                  '👎': 'thumbs down',
                  '👆': 'pointing up',
                  '✌️': 'peace sign',
                  '👌': 'OK sign',
                  '✊': 'fist',
                  '✋': 'open hand',
                  '👋': 'wave',
                  '❤️': 'heart',
                  '💕': 'love',
                  '👏': 'clapping',
                };
                const description = symbolDescriptions[symbol] || symbol;
                speak(description);
              }
            }
            // Ignore special commands (_del_, _space_, _clear_) since we only show last symbol
          }
        }
      }
    } catch (error) {
      console.error("Error translating sign:", error);
      toast.error("Failed to translate sign. Please try again.");
    } finally {
      setIsProcessing(false);
      // Schedule the next call after this one finishes
      if (mountedRef.current && isStreaming && mode === "translate") {
        loopTimeoutRef.current = window.setTimeout(captureAndTranslate, TRANSLATE_LOOP_DELAY);
      }
    }
  };

  const stopTranslationLoop = () => {
    if (loopTimeoutRef.current !== null) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  };

  const startTranslationLoop = () => {
    stopTranslationLoop();
    if (mountedRef.current && isStreaming && mode === "translate") {
      loopTimeoutRef.current = window.setTimeout(captureAndTranslate, TRANSLATE_LOOP_DELAY);
    }
  };

  const handleClearTranslation = () => {
    setTranslation("");
  };

  // This useEffect controls the loop start/stop
  useEffect(() => {
    stopTranslationLoop();
    
    setTranslation("");
    setCurrentResponse(null);

    if (mode === "translate" && isStreaming && mountedRef.current) {
      startTranslationLoop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isStreaming]);

  // Added mountedRef and main unmount cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
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
            <span className="text-xl font-bold text-foreground">Sign Language Translator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sign Language Translator & Query System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Translate sign language to text or ask questions and get AI-powered responses with sign language output.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <Button
              variant={mode === "translate" ? "default" : "ghost"}
              onClick={() => setMode("translate")}
              className="px-6"
            >
              <Hand className="w-4 h-4 mr-2" />
              Translation Mode
            </Button>
            <Button
              variant={mode === "query" ? "default" : "ghost"}
              onClick={() => setMode("query")}
              className="px-6"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Query Mode
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                {mode === "translate" ? "Camera Feed" : "Sign Your Query"}
              </CardTitle>
              <CardDescription>
                {mode === "translate" 
                  ? "Position yourself in frame. The last detected sign will be displayed."
                  : "Position yourself in front of the camera and sign your question or query"}
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
                      <p className="text-white font-semibold">
                        {mode === "translate" ? "Processing sign..." : "Processing your query..."}
                      </p>
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
                    {mode === "query" && (
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
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === "translate" ? (
                  <>
                    <Hand className="w-5 h-5 text-primary" />
                    Translation
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Response
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {mode === "translate" 
                  ? "Last detected sign will be displayed here"
                  : "Your query and AI response will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === "translate" ? (
                <div className="min-h-[300px] bg-muted rounded-lg p-6">
                  {translation ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                      <div className="text-8xl md:text-9xl text-foreground text-center">
                        {translation}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        {isStreaming 
                          ? "Waiting for sign language gestures..." 
                          : "Start the camera to begin symbol conversion"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-h-[300px]">
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
                            💡 Response provided in sign language format. In a full implementation, this would be displayed as animated sign language video.
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Query History */}
        {mode === "query" && queryHistory.length > 0 && (
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
        <Card className="mt-8 border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            {mode === "translate" ? (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1. Start Camera</h3>
                    <p className="text-muted-foreground">
                      Allow camera access and position yourself in the frame
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2. Sign Gestures</h3>
                    <p className="text-muted-foreground">
                      Use sign language gestures, fingerspelling (A-Z), or numbers (0-9). Each sign will be displayed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">3. See Last Symbol</h3>
                    <p className="text-muted-foreground">
                      AI converts your signs to symbols and displays the last detected symbol (emoji, letter, or number).
                    </p>
                  </div>
                </div>
              </>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;