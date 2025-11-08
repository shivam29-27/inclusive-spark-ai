import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Video, VideoOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VisualDescriber = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [description, setDescription] = useState("");
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
        
        // Start capturing frames every 3 seconds
        intervalRef.current = window.setInterval(() => {
          captureAndDescribe();
        }, 3000);
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
    setDescription("");
  };

  const captureAndDescribe = async () => {
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
        const { data, error } = await supabase.functions.invoke('describe-visual', {
          body: { imageData }
        });
        
        if (error) throw error;
        
        if (data?.description) {
          setDescription(data.description);
        }
      }
    } catch (error) {
      console.error("Error describing visual:", error);
      toast.error("Failed to describe visual. Please try again.");
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
            <Eye className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AI Visual Describer</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time Visual Description
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered scene interpretation for visually impaired users via webcam.
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
                Position yourself or your environment in frame
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

          {/* Description Output */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Visual Description
              </CardTitle>
              <CardDescription>
                Real-time description of what the camera sees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] bg-muted rounded-lg p-6 overflow-y-auto max-h-[400px]">
                {description ? (
                  <div className="space-y-4">
                    <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      {isStreaming 
                        ? "Waiting for visual description..." 
                        : "Start the camera to begin visual description"}
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
                  Allow camera access and point at the scene you want described
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Real-Time Analysis</h3>
                <p className="text-muted-foreground">
                  AI analyzes the visual scene every few seconds automatically
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Detailed Description</h3>
                <p className="text-muted-foreground">
                  Get comprehensive descriptions including people, objects, and environment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualDescriber;

