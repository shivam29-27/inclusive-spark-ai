import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Eye, Hand, Users, Sparkles, AudioLines, Accessibility } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Hand,
      title: "Sign Language Translator",
      description: "Real-time sign-to-speech and text conversion supporting ASL, BSL, ISL and more.",
      color: "text-primary",
    },
    {
      icon: MessageCircle,
      title: "Empathy Companion",
      description: "AI-guided journaling and mental wellness support that understands your emotions.",
      color: "text-secondary",
    },
    {
      icon: Accessibility,
      title: "Accessible UI Generator",
      description: "Transform any website into an accessible experience with AI-powered enhancements.",
      color: "text-accent",
    },
    {
      icon: AudioLines,
      title: "Voice Emotion Translator",
      description: "Detect and translate emotional tone to build deeper, more empathetic connections.",
      color: "text-primary",
    },
    {
      icon: Eye,
      title: "AI Visual Describer",
      description: "Real-time scene interpretation for visually impaired users via webcam.",
      color: "text-harmony",
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Safe, moderated space powered by AI empathy filters and kindness scoring.",
      color: "text-empathy",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">KindMind</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors">Community</a>
            <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-hero text-white px-6 py-2 rounded-full mb-6 shadow-empathy">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI for Inclusion & Empathy</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Let Intelligence Make<br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">The World Kinder</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Bridging emotional, physical, and communication gaps through empathy-driven innovation — 
            empowering people of all abilities to connect, express, and thrive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-soft hover:shadow-empathy transition-all">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Empathy-Driven Innovation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to make technology accessible, inclusive, and deeply human.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border bg-gradient-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color.split('-')[1]}/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-hero text-white border-0 shadow-empathy overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <CardHeader className="relative z-10 text-center pb-6">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Join the Kindness Revolution
              </CardTitle>
              <CardDescription className="text-white/90 text-lg max-w-2xl mx-auto">
                Be part of a community that believes technology should serve humanity 
                with compassion, accessibility, and genuine care.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center pb-8">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg">
                Get Early Access
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold text-foreground">KindMind</span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2024 KindMind. Making the world kinder, one interaction at a time.
            </p>
            <div className="flex gap-6">
              <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
