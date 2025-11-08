import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accessibility, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface AccessibilityReport {
  score: number;
  issues: number;
  fixed: number;
  items: string[];
}

const AccessibilityScanner = () => {
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"url" | "html">("url");

  const scanAccessibility = async () => {
    if (scanMode === "url" && !url.trim()) {
      toast.error("Please enter a URL to scan");
      return;
    }

    if (scanMode === "html" && !html.trim()) {
      toast.error("Please enter HTML content to scan");
      return;
    }

    setIsScanning(true);
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-accessibility', {
        body: scanMode === "url" ? { url: url.trim() } : { html: html.trim() }
      });

      if (error) throw error;

      setReport(data as AccessibilityReport);
      toast.success("Accessibility scan completed!");
    } catch (error) {
      console.error("Error scanning accessibility:", error);
      toast.error("Failed to scan accessibility. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
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
            <Accessibility className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Accessible UI Generator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Accessibility Scanner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any website into an accessible experience with AI-powered enhancements.
          </p>
        </div>

        {/* Input Section */}
        <Card className="border-border bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary" />
              Scan Target
            </CardTitle>
            <CardDescription>
              Choose to scan by URL or paste HTML content directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={scanMode === "url" ? "default" : "outline"}
                onClick={() => setScanMode("url")}
              >
                Scan URL
              </Button>
              <Button
                variant={scanMode === "html" ? "default" : "outline"}
                onClick={() => setScanMode("html")}
              >
                Scan HTML
              </Button>
            </div>

            {scanMode === "url" ? (
              <div className="space-y-4">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isScanning}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Paste HTML content here..."
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isScanning}
                />
              </div>
            )}

            <Button
              onClick={scanAccessibility}
              disabled={isScanning || (scanMode === "url" ? !url.trim() : !html.trim())}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isScanning ? "Scanning..." : "Scan Accessibility"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {report && (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Score Card */}
            <Card className="border-border bg-gradient-card">
              <CardHeader>
                <CardTitle>Accessibility Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-6xl font-bold text-center mb-4 ${getScoreColor(report.score)}`}>
                  {report.score}
                </div>
                <Progress value={report.score} className="h-2" />
                <p className="text-center text-muted-foreground mt-4">out of 100</p>
              </CardContent>
            </Card>

            {/* Issues Card */}
            <Card className="border-border bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600 text-center">
                  {report.issues}
                </div>
                <p className="text-center text-muted-foreground mt-2">
                  accessibility issues detected
                </p>
              </CardContent>
            </Card>

            {/* Fixable Card */}
            <Card className="border-border bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Auto-Fixable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 text-center">
                  {report.fixed}
                </div>
                <p className="text-center text-muted-foreground mt-2">
                  issues can be auto-fixed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Issues List */}
        {report && report.items && report.items.length > 0 && (
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Detailed Issues
              </CardTitle>
              <CardDescription>
                Specific accessibility issues found in the scanned content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <p className="text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccessibilityScanner;

