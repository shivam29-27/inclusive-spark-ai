import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand, Video, VideoOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignLanguageTranslator = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        
        // Start capturing frames every 2 seconds
        intervalRef.current = window.setInterval(() => {
          captureAndTranslate();
        }, 2000);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  };

  const captureAndTranslate = async () => {
    if (!videoRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to edge function
        const { data, error } = await supabase.functions.invoke('translate-sign', {
          body: { imageData }
        });
        
        if (error) throw error;
        
        if (data?.translation) {
          const translationText = data.translation.trim();
          // Display translation if it's not "No sign language detected"
          if (translationText && translationText !== "No sign language detected") {
            setTranslation(translationText);
          }
        }
      }
    } catch (error) {
      console.error("Error translating sign:", error);
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
            <span className="text-xl font-bold text-foreground">Sign Language Translator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time Sign Language Translation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered translation supporting ASL, BSL, ISL and more. Show thumbs up 👋 for "All the best"!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Camera Feed
              </CardTitle>
              <CardDescription>
                Position yourself in frame and sign naturally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Camera is off</p>
                    </div>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Processing...
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                {!isStreaming ? (
                  <Button 
                    onClick={startCamera}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <VideoOff className="w-5 h-5 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Translation Output */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="w-5 h-5 text-primary" />
                Translation
              </CardTitle>
              <CardDescription>
                Real-time text conversion of detected signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] bg-muted rounded-lg p-6">
                {translation ? (
                  <div className="space-y-4">
                    <p className="text-lg text-foreground leading-relaxed">
                      {translation}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      {isStreaming 
                        ? "Waiting for sign language gestures..." 
                        : "Start the camera to begin translation"}
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
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Start Camera</h3>
                <p className="text-muted-foreground">
                  Allow camera access and position yourself in the frame
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Sign Naturally</h3>
                <p className="text-muted-foreground">
                  Use ASL, BSL, ISL or other supported sign languages. Show thumbs up for "All the best"!
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Real-Time Translation</h3>
                <p className="text-muted-foreground">
                  AI analyzes and translates your signs to text instantly
                </p>
              </div>
            </div>
            
            {/* Special Gestures */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">Special Gestures</h3>
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👍</div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Thumbs Up</p>
                    <p className="text-muted-foreground text-sm">
                      Show your thumb finger (thumbs up gesture) to translate as "All the best"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;
