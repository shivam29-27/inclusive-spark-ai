import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { preferences, speak, stopSpeaking } = useAccessibility();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    speak("Welcome to the login page. Enter your email and password to sign in.");
    return () => stopSpeaking();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    stopSpeaking();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const savedPreference = localStorage.getItem("userAccessibilityPreference");
      if (savedPreference && preferences.voiceAssist) {
        speak("Login successful! Redirecting to home page.");
      }

      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      const errorMsg = error.message || "Invalid email or password";
      speak(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => preferences.voiceAssist && speak("Email field")}
                className="h-12 text-base rounded-lg"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => preferences.voiceAssist && speak("Password field")}
                  className="h-12 text-base rounded-lg pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isLoading ? "Signing In..." : "Log In"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

