import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Volume2, VolumeX, Contrast, Type, Keyboard, Zap } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference, speak, stopSpeaking } = useAccessibility();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessibilityPreference: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    speak("Welcome to the sign up page. Please fill in your details to create an account.");
    return () => stopSpeaking();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFocus = (label: string) => {
    if (preferences.voiceAssist) {
      speak(`Focused on ${label} field`);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.accessibilityPreference) {
      newErrors.accessibilityPreference = "Please select an accessibility preference";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    stopSpeaking();
    
    if (!validateForm()) {
      speak("Please correct the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            accessibility_preference: formData.accessibilityPreference,
          },
        },
      });

      if (error) throw error;

      // Apply accessibility preferences
      const prefMap: Record<string, () => void> = {
        "Voice Assist": () => updatePreference("voiceAssist", true),
        "Large Text": () => updatePreference("largeText", true),
        "High Contrast": () => updatePreference("highContrast", true),
        "Keyboard Navigation": () => updatePreference("keyboardNavigation", true),
      };

      if (prefMap[formData.accessibilityPreference]) {
        prefMap[formData.accessibilityPreference]();
      }

      // Store preferences
      localStorage.setItem("userAccessibilityPreference", formData.accessibilityPreference);
      localStorage.setItem("userEmail", formData.email);

      if (preferences.voiceAssist) {
        speak("Account created successfully! Redirecting to home page.");
      }

      toast.success("Account created successfully!");
      
      setTimeout(() => {
        navigate("/");
      }, preferences.voiceAssist ? 2000 : 500);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create account. Please try again.";
      speak(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
        const form = formRef.current;
        if (form) {
          const inputs = Array.from(form.querySelectorAll("input, select, button"));
          const currentIndex = inputs.indexOf(e.target);
          const nextInput = inputs[currentIndex + 1] as HTMLElement;
          if (nextInput && nextInput.tagName !== "BUTTON") {
            nextInput.focus();
            e.preventDefault();
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Join us for an inclusive experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onFocus={() => handleFocus("Full Name")}
                aria-label="Full Name"
                aria-required="true"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className="h-12 text-base rounded-lg"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-red-600" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => handleFocus("Email")}
                aria-label="Email Address"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-12 text-base rounded-lg"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onFocus={() => handleFocus("Password")}
                  aria-label="Password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="h-12 text-base rounded-lg pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    speak(showPassword ? "Password hidden" : "Password visible");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  onFocus={() => handleFocus("Confirm Password")}
                  aria-label="Confirm Password"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  className="h-12 text-base rounded-lg pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    speak(showConfirmPassword ? "Confirm password hidden" : "Confirm password visible");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Accessibility Preference */}
            <div className="space-y-2">
              <Label htmlFor="accessibilityPreference" className="text-base font-semibold">
                Accessibility Preference
              </Label>
              <Select
                value={formData.accessibilityPreference}
                onValueChange={(value) => {
                  handleInputChange("accessibilityPreference", value);
                  speak(`Selected ${value}`);
                }}
              >
                <SelectTrigger
                  id="accessibilityPreference"
                  className="h-12 text-base rounded-lg"
                  aria-label="Accessibility Preference"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select your preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Voice Assist">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Voice Assist
                    </div>
                  </SelectItem>
                  <SelectItem value="Large Text">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Large Text
                    </div>
                  </SelectItem>
                  <SelectItem value="High Contrast">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4" />
                      High Contrast
                    </div>
                  </SelectItem>
                  <SelectItem value="Keyboard Navigation">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-4 h-4" />
                      Keyboard Navigation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.accessibilityPreference && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.accessibilityPreference}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              aria-label="Sign Up"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  aria-label="Go to login page"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;

