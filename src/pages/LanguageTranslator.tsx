import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, ArrowLeft, Loader2, Copy, Check, Volume2, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const LanguageTranslator = () => {
  const { preferences, speak } = useAccessibility();
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Comprehensive list of languages
  const languages = [
    { value: "auto", label: "Auto-detect" },
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "chinese", label: "Chinese (Simplified)" },
    { value: "chinese traditional", label: "Chinese (Traditional)" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "arabic", label: "Arabic" },
    { value: "hindi", label: "Hindi" },
    { value: "bengali", label: "Bengali" },
    { value: "urdu", label: "Urdu" },
    { value: "turkish", label: "Turkish" },
    { value: "polish", label: "Polish" },
    { value: "dutch", label: "Dutch" },
    { value: "greek", label: "Greek" },
    { value: "hebrew", label: "Hebrew" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
    { value: "indonesian", label: "Indonesian" },
    { value: "malay", label: "Malay" },
    { value: "swahili", label: "Swahili" },
    { value: "swedish", label: "Swedish" },
    { value: "norwegian", label: "Norwegian" },
    { value: "danish", label: "Danish" },
    { value: "finnish", label: "Finnish" },
    { value: "czech", label: "Czech" },
    { value: "romanian", label: "Romanian" },
    { value: "hungarian", label: "Hungarian" },
    { value: "ukrainian", label: "Ukrainian" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "marathi", label: "Marathi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "punjabi", label: "Punjabi" },
    { value: "persian", label: "Persian (Farsi)" },
    { value: "afrikaans", label: "Afrikaans" },
    { value: "bulgarian", label: "Bulgarian" },
    { value: "croatian", label: "Croatian" },
    { value: "serbian", label: "Serbian" },
    { value: "slovak", label: "Slovak" },
    { value: "slovenian", label: "Slovenian" },
    { value: "lithuanian", label: "Lithuanian" },
    { value: "latvian", label: "Latvian" },
    { value: "estonian", label: "Estonian" },
    { value: "icelandic", label: "Icelandic" },
    { value: "irish", label: "Irish" },
    { value: "welsh", label: "Welsh" },
    { value: "basque", label: "Basque" },
    { value: "catalan", label: "Catalan" },
    { value: "galician", label: "Galician" },
  ];

  useEffect(() => {
    speak("Welcome to Universal Language Translator. Enter text and select languages to translate.");
  }, []);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to translate");
      speak("Please enter text to translate");
      return;
    }

    if (!targetLanguage || targetLanguage === "auto") {
      toast.error("Please select a target language");
      speak("Please select a target language");
      return;
    }

    setIsLoading(true);
    setTranslatedText("");

    try {
      const { data, error } = await supabase.functions.invoke('translate-language', {
        body: {
          text: text.trim(),
          targetLanguage,
          sourceLanguage: sourceLanguage !== "auto" ? sourceLanguage : undefined,
        }
      });

      if (error) throw error;

      setTranslatedText(data.translatedText);
      toast.success("Translation completed!");
      if (preferences.voiceAssist) {
        speak(`Translation completed. Translated text: ${data.translatedText.substring(0, 100)}`);
      }
    } catch (error: any) {
      console.error("Error translating:", error);
      const errorMsg = error.message || "Failed to translate. Please try again.";
      toast.error(errorMsg);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copied to clipboard!");
      speak("Text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleSwapLanguages = () => {
    if (translatedText && sourceLanguage !== "auto") {
      setText(translatedText);
      setTranslatedText(text);
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
    } else if (translatedText) {
      setText(translatedText);
      setTranslatedText("");
      setSourceLanguage(targetLanguage);
      setTargetLanguage("english");
    }
  };

  const handleReadAloud = (textToRead: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      // Try to set language based on selection
      utterance.lang = lang === "english" ? "en-US" : lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
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
            <Languages className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Universal Language Translator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Universal Language Translator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Translate text between 60+ languages with AI-powered accuracy. Breaking language barriers for everyone.
          </p>
        </div>

        {/* Translation Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Source Language Input */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  Source Text
                </CardTitle>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="w-40" aria-label="Source language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Enter or paste the text you want to translate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                className="min-h-[200px] text-base rounded-lg"
                disabled={isLoading}
                aria-label="Source text"
                aria-required="true"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(text)}
                  disabled={!text}
                  aria-label="Copy source text"
                >
                  {copied && text ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReadAloud(text, sourceLanguage)}
                  disabled={!text}
                  aria-label="Read source text aloud"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Target Language Output */}
          <Card className="border-border bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  Translated Text
                </CardTitle>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-40" aria-label="Target language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.filter(lang => lang.value !== "auto").map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Your translated text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[200px] p-4 bg-muted rounded-lg border border-border">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Translating...</span>
                  </div>
                ) : translatedText ? (
                  <p className="text-base text-foreground whitespace-pre-wrap">{translatedText}</p>
                ) : (
                  <p className="text-muted-foreground">Translation will appear here...</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText}
                  aria-label="Copy translated text"
                >
                  {copied && translatedText ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReadAloud(translatedText, targetLanguage)}
                  disabled={!translatedText}
                  aria-label="Read translated text aloud"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Translate Button */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={handleSwapLanguages}
            variant="outline"
            size="lg"
            disabled={!translatedText || isLoading}
            className="px-6"
            aria-label="Swap languages"
          >
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Swap Languages
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={isLoading || !text.trim() || !targetLanguage}
            className="bg-primary hover:bg-primary/90 h-12 px-8 text-lg"
            aria-label="Translate text"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5 mr-2" />
                Translate
              </>
            )}
          </Button>
        </div>

        {/* Info Section */}
        <Card className="border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>Supported Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our Universal Language Translator supports over 60 languages, including:
            </p>
            <div className="grid md:grid-cols-4 gap-2">
              {languages.filter(lang => lang.value !== "auto").slice(0, 32).map((lang) => (
                <div key={lang.value} className="text-sm text-foreground p-2 bg-muted rounded">
                  {lang.label}
                </div>
              ))}
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                And many more...
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="mt-6 border-border bg-gradient-card">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">60+ Languages</h3>
                <p className="text-muted-foreground">
                  Translate between 60+ languages including major world languages and regional dialects
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI ensures accurate translations that preserve meaning and context
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Voice Support</h3>
                <p className="text-muted-foreground">
                  Listen to translations with text-to-speech in multiple languages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LanguageTranslator;

