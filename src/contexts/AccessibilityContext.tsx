import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityPreferences {
  voiceAssist: boolean;
  largeText: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  theme: 'light' | 'dark';
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
  voiceAssist: false,
  largeText: false,
  highContrast: false,
  keyboardNavigation: false,
  reducedMotion: false,
  theme: 'dark',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const stored = localStorage.getItem('accessibilityPreferences');
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  });

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    document.documentElement.classList.toggle('large-text', preferences.largeText);
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast);
    document.documentElement.classList.toggle('reduced-motion', preferences.reducedMotion);
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const speak = (text: string) => {
    if (!preferences.voiceAssist || !synth) return;

    // Stop any current speech
    if (currentUtterance) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    setCurrentUtterance(utterance);
    synth.speak(utterance);

    utterance.onend = () => {
      setCurrentUtterance(null);
    };
  };

  const stopSpeaking = () => {
    if (synth && currentUtterance) {
      synth.cancel();
      setCurrentUtterance(null);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreference,
        speak,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

