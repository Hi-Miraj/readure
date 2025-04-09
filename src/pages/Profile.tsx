
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Book, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { loadBooks } from '@/lib/supabase-store';
import { Book as BookType } from '@/types/book';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [books, setBooks] = useState<BookType[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      setUserId(data.session.user.id);
      setEmail(data.session.user.email || '');
      fetchProfile(data.session.user.id);
      fetchBooks();
    };
    
    checkAuth();
  }, [navigate]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setUsername(data.username || '');
      setAvatar(data.avatar_url);
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const userBooks = await loadBooks();
      setBooks(userBooks);
    } catch (error: any) {
      console.error('Error loading books:', error);
    }
  };

  const updateProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const updates = {
        id: userId,
        username,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userId) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    
    try {
      setUploading(true);
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      setAvatar(data.publicUrl);
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const getReadingSummary = () => {
    const reading = books.filter(book => book.status === 'reading').length;
    const toRead = books.filter(book => book.status === 'to-read').length;
    const finished = books.filter(book => book.status === 'finished').length;
    const total = books.length;

    return { reading, toRead, finished, total };
  };

  const summary = getReadingSummary();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="stats">Reading Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={email}
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Avatar</CardTitle>
                <CardDescription>Upload a profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || ''} alt={username} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <Label
                  htmlFor="avatar"
                  className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors"
                >
                  {uploading ? "Uploading..." : "Change Avatar"}
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Reading Statistics</CardTitle>
              <CardDescription>Overview of your reading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-secondary/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Books</div>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-blue-500">Reading</Badge>
                  </div>
                  <div className="text-3xl font-bold">{summary.reading}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                
                <div className="bg-amber-100 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-amber-500">To Read</Badge>
                  </div>
                  <div className="text-3xl font-bold">{summary.toRead}</div>
                  <div className="text-sm text-muted-foreground">On Your List</div>
                </div>
                
                <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-green-500">Finished</Badge>
                  </div>
                  <div className="text-3xl font-bold">{summary.finished}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
              
              {summary.total === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't added any books yet. Visit your library to add books!</p>
                  <Button className="mt-4" onClick={() => navigate('/library')}>
                    Go to Library
                  </Button>
                </div>
              )}
              
              {summary.total > 0 && (
                <div className="mt-8">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/analytics')}>
                    <BarChart className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
