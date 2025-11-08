import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accessibility, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const AccessibilityScore = () => {
  const { preferences } = useAccessibility();
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Calculate accessibility score based on user preferences
    let calculatedScore = 0;
    const maxScore = 100;

    // Base score for having preferences set
    calculatedScore += 20;

    // Add points for each accessibility feature enabled
    if (preferences.voiceAssist) calculatedScore += 20;
    if (preferences.largeText) calculatedScore += 15;
    if (preferences.highContrast) calculatedScore += 15;
    if (preferences.keyboardNavigation) calculatedScore += 20;
    if (preferences.reducedMotion) calculatedScore += 10;

    setScore(Math.min(calculatedScore, maxScore));
  }, [preferences]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Getting Started";
  };

  const getBadgeVariant = (score: number): "default" | "secondary" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  const activeFeatures = [
    preferences.voiceAssist && "Voice Assist",
    preferences.largeText && "Large Text",
    preferences.highContrast && "High Contrast",
    preferences.keyboardNavigation && "Keyboard Nav",
    preferences.reducedMotion && "Reduced Motion",
  ].filter(Boolean);

  return (
    <Card className="border-border bg-gradient-card shadow-soft h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">Accessibility Score</CardTitle>
              <CardDescription>
                Your current accessibility settings
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-2xl font-semibold text-foreground mb-4">
            {getScoreLabel(score)}
          </div>
          <Progress value={score} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            out of 100
          </p>
        </div>

        {/* Active Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Active Features</span>
          </div>
          {activeFeatures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFeatures.map((feature, index) => (
                <Badge
                  key={index}
                  variant={getBadgeVariant(score)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {feature}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No accessibility features enabled yet. Enable features in the accessibility toolbar to improve your score!
            </p>
          )}
        </div>

        {/* Tips */}
        {score < 80 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Improve Your Score</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {!preferences.voiceAssist && (
                <li>Enable Voice Assist for screen reader support</li>
              )}
              {!preferences.keyboardNavigation && (
                <li>Enable Keyboard Navigation for better accessibility</li>
              )}
              {!preferences.largeText && (
                <li>Enable Large Text for better readability</li>
              )}
              {!preferences.highContrast && (
                <li>Enable High Contrast for better visibility</li>
              )}
            </ul>
          </div>
        )}

        {/* Achievement Badge */}
        {score >= 80 && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Accessibility Champion!</p>
            <p className="text-sm text-muted-foreground">
              You've optimized your accessibility settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessibilityScore;

