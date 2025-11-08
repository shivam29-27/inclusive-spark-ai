import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Keyboard } from "lucide-react";

const OnScreenKeyboard = () => {
  const { preferences } = useAccessibility();
  const [isVisible, setIsVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!preferences.keyboardNavigation) {
      setIsVisible(false);
      return;
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setActiveInput(target as HTMLInputElement | HTMLTextAreaElement);
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName !== "BUTTON") {
          setIsVisible(false);
          setActiveInput(null);
        }
      }, 200);
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [preferences.keyboardNavigation]);

  if (!isVisible || !activeInput) return null;

  const insertChar = (char: string) => {
    const start = activeInput.selectionStart || 0;
    const end = activeInput.selectionEnd || 0;
    const value = activeInput.value;
    const newValue = value.substring(0, start) + char + value.substring(end);
    activeInput.value = newValue;
    activeInput.setSelectionRange(start + 1, start + 1);
    activeInput.dispatchEvent(new Event("input", { bubbles: true }));
    activeInput.focus();
  };

  const handleBackspace = () => {
    const start = activeInput.selectionStart || 0;
    if (start > 0) {
      const value = activeInput.value;
      const newValue = value.substring(0, start - 1) + value.substring(start);
      activeInput.value = newValue;
      activeInput.setSelectionRange(start - 1, start - 1);
      activeInput.dispatchEvent(new Event("input", { bubbles: true }));
      activeInput.focus();
    }
  };

  const handleSpace = () => insertChar(" ");
  const handleEnter = () => {
    if (activeInput.tagName === "TEXTAREA") {
      insertChar("\n");
    } else {
      activeInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }
  };

  const keys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-2xl z-50 border-t-2 border-blue-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <span className="font-semibold">On-Screen Keyboard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-gray-700"
            aria-label="Close keyboard"
          >
            Close
          </Button>
        </div>
        <div className="space-y-2">
          {keys.map((row, i) => (
            <div key={i} className="flex gap-1 justify-center">
              {row.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => insertChar(key)}
                  className="min-w-[3rem] h-12 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  aria-label={`Press ${key}`}
                >
                  {key.toUpperCase()}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex gap-1 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSpace}
              className="flex-1 max-w-md h-12 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              aria-label="Space"
            >
              Space
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackspace}
              className="min-w-[6rem] h-12 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              aria-label="Backspace"
            >
              ⌫ Backspace
            </Button>
            {activeInput.tagName === "TEXTAREA" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnter}
                className="min-w-[6rem] h-12 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                aria-label="Enter"
              >
                ↵ Enter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnScreenKeyboard;

