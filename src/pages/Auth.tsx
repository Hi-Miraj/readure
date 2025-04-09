
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthMode = 'sign-in' | 'sign-up';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'sign-up') {
        if (password !== confirmedPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Success! Please check your email",
          description: "We've sent you a confirmation email.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-muted/40">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-indigo-400 dark:to-purple-400">
            Readure
          </h1>
        </div>
        <p className="text-muted-foreground">Track your reading journey, one page at a time.</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {mode === 'sign-in' ? 'Sign In' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'sign-in' 
              ? 'Welcome back! Sign in to your account' 
              : 'Join Readure to track and share your reading progress'}
          </CardDescription>
        </CardHeader>
        <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {mode === 'sign-up' && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmedPassword}
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
