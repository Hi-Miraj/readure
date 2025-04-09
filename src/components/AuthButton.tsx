
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, BarChart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

const AuthButton = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({ username: null, avatar_url: null });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile({ username: null, avatar_url: null });
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      setProfile({
        username: data.username,
        avatar_url: data.avatar_url
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = () => {
    if (profile.username) return profile.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => {
    if (profile.username) return profile.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return <Button variant="ghost" size="icon" disabled><User className="h-5 w-5 opacity-50" /></Button>;
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/auth">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 border">
          <Avatar className="h-9 w-9">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/library" className="cursor-pointer flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Library</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/analytics" className="cursor-pointer flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
