import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Volume2, VolumeX, Type, Contrast, Keyboard, Moon, Sun, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const AccessibilityToolbar = () => {
  const { preferences, updatePreference, speak } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const togglePreference = (key: keyof typeof preferences, label: string) => {
    const newValue = !preferences[key];
    updatePreference(key, newValue);
    speak(`${label} ${newValue ? "enabled" : "disabled"}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            aria-label="Open accessibility settings"
          >
            <Zap className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Accessibility Settings</SheetTitle>
            <SheetDescription>
              Customize your experience to suit your needs
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.voiceAssist ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
                <span className="font-medium">Voice Assist</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePreference("voiceAssist", "Voice assist")}
                aria-label={`${preferences.voiceAssist ? "Disable" : "Enable"} voice assist`}
              >
                {preferences.voiceAssist ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5" />
                <span className="font-medium">Large Text</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePreference("largeText", "Large text")}
                aria-label={`${preferences.largeText ? "Disable" : "Enable"} large text`}
              >
                {preferences.largeText ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Contrast className="w-5 h-5" />
                <span className="font-medium">High Contrast</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePreference("highContrast", "High contrast")}
                aria-label={`${preferences.highContrast ? "Disable" : "Enable"} high contrast`}
              >
                {preferences.highContrast ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5" />
                <span className="font-medium">Keyboard Nav</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePreference("keyboardNavigation", "Keyboard navigation")}
                aria-label={`${preferences.keyboardNavigation ? "Disable" : "Enable"} keyboard navigation`}
              >
                {preferences.keyboardNavigation ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.theme === "dark" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <span className="font-medium">Theme</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newTheme = preferences.theme === "dark" ? "light" : "dark";
                  updatePreference("theme", newTheme);
                  speak(`Theme changed to ${newTheme}`);
                }}
                aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} theme`}
              >
                {preferences.theme === "dark" ? "Dark" : "Light"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AccessibilityToolbar;

