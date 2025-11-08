import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Save, Heart, Check, Loader2 } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TodaysReflection = () => {
  const { preferences, speak } = useAccessibility();
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Load saved reflection for today
  useEffect(() => {
    const todayKey = `reflection_${new Date().toDateString()}`;
    const savedReflection = localStorage.getItem(todayKey);
    if (savedReflection) {
      setReflection(savedReflection);
      setIsSaved(true);
    }
  }, []);

  const handleSave = async () => {
    if (!reflection.trim()) {
      toast.error("Please write something before saving");
      if (preferences.voiceAssist) {
        speak("Please write something before saving");
      }
      return;
    }

    setIsSaving(true);

    try {
      // Save to localStorage
      const todayKey = `reflection_${new Date().toDateString()}`;
      localStorage.setItem(todayKey, reflection);
      
      // Also save to Supabase if user is logged in (can be extended later)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Future: Save to Supabase database table for reflections
          // await supabase.from('reflections').insert({ ... });
        }
      } catch (error) {
        // User not logged in, that's okay - we use localStorage
        console.log("Saving to localStorage only");
      }

      setIsSaved(true);
      toast.success("Reflection saved successfully!");
      if (preferences.voiceAssist) {
        speak("Reflection saved successfully");
      }

      // Reset saved state after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save reflection. Please try again.");
      if (preferences.voiceAssist) {
        speak("Failed to save reflection");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (value: string) => {
    setReflection(value);
    setIsSaved(false);
  };

  return (
    <Card className="border-border bg-gradient-card shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">Today's Reflection</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{today}</span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reflection" className="text-base font-semibold flex items-center gap-2">
            <span>What's in your mind?</span>
          </Label>
          <Textarea
            id="reflection"
            value={reflection}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Share your thoughts, feelings, or reflections for today..."
            className="min-h-[150px] text-base rounded-lg resize-y"
            aria-label="Today's reflection input"
            aria-describedby="reflection-description"
            onFocus={() => {
              if (preferences.voiceAssist) {
                speak("What's in your mind? Write your thoughts here");
              }
            }}
          />
          <p id="reflection-description" className="text-sm text-muted-foreground">
            Take a moment to reflect on your day. Your thoughts are private and saved locally.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !reflection.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
          aria-label="Save reflection"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Reflection
            </>
          )}
        </Button>

        {reflection && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              💭 Your reflection is saved locally and will be available until tomorrow.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysReflection;

