
import React, { useState } from 'react';
import { Book, ReadingSession } from '@/types/book';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import BookWritingCanvas from '@/components/BookWritingCanvas';
import { Save, Trash2, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import BookTracking from './BookTracking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';

interface BookDetailsProps {
  book: Book | null;
  onSave: (updatedBook: Book) => void;
  onDelete: (bookId: string) => void;
  onBack: () => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, onSave, onDelete, onBack }) => {
  const [localBook, setLocalBook] = useState<Book | null>(book);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();

  React.useEffect(() => {
    setLocalBook(book);
  }, [book]);

  if (!localBook) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a book to view details or add a new book to your library.</p>
      </div>
    );
  }

  const handleInputChange = (field: keyof Book, value: any) => {
    setLocalBook(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleStatusChange = (status: 'to-read' | 'reading' | 'finished') => {
    setLocalBook(prev => {
      if (!prev) return prev;
      return { ...prev, status };
    });
  };

  const handleSaveNotes = (content: string) => {
    if (localBook) {
      const updatedBook = { ...localBook, notes: content };
      setLocalBook(updatedBook);
      onSave(updatedBook);
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully",
      });
    }
  };

  const handleProgressUpdate = () => {
    if (localBook) {
      onSave(localBook);
      toast({
        title: "Progress updated",
        description: "Your reading progress has been updated",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this book?") && localBook) {
      onDelete(localBook.id);
      toast({
        title: "Book deleted",
        description: "The book has been removed from your library",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!localBook) return;
    
    if (newPage < 0) newPage = 0;
    if (newPage > localBook.totalPages) newPage = localBook.totalPages;
    
    // Calculate pages read in this session
    const pagesRead = newPage - localBook.currentPage;
    
    if (pagesRead > 0) {
      // Create a new reading session entry
      const today = format(new Date(), 'yyyy-MM-dd');
      const timestamp = new Date().toISOString();
      
      // Check if there's already an entry for today
      const readingHistory = localBook.readingHistory || [];
      const todayEntryIndex = readingHistory.findIndex(entry => entry.date === today);
      
      let updatedHistory;
      if (todayEntryIndex >= 0) {
        // Update existing entry
        updatedHistory = [...readingHistory];
        updatedHistory[todayEntryIndex] = {
          ...updatedHistory[todayEntryIndex],
          pagesRead: updatedHistory[todayEntryIndex].pagesRead + pagesRead,
          timestamp
        };
      } else {
        // Add new entry
        updatedHistory = [...readingHistory, { date: today, pagesRead, timestamp }];
      }
      
      setLocalBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPage: newPage,
          readingHistory: updatedHistory
        };
      });
      
      // Show toast for pages read
      toast({
        title: "Reading progress",
        description: `You read ${pagesRead} pages today!`,
      });
    } else {
      // Just update the current page without adding to reading history
      setLocalBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPage: newPage
        };
      });
    }
  };

  const formatReadingTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'h:mm a');
    } catch {
      return 'Unknown time';
    }
  };

  const categories = [
    "Fiction", "Mystery", "Science Fiction", "Fantasy", "Biography", 
    "History", "Self-Help", "Business", "Romance", "Thriller", "Horror", 
    "Poetry", "Children", "Young Adult", "Science", "Travel", "Other"
  ];
  
  const todayReadingTotal = localBook.readingHistory
    ?.filter(session => session.date === format(new Date(), 'yyyy-MM-dd'))
    ?.reduce((total, session) => total + session.pagesRead, 0) || 0;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Library
          </Button>
          <h2 className="text-xl font-semibold">{localBook.title}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleProgressUpdate}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="details">Book Details</TabsTrigger>
          <TabsTrigger value="progress">Reading Progress</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                src={localBook.coverUrl || 'https://via.placeholder.com/150'} 
                alt={`${localBook.title} cover`}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={localBook.title} 
                    onChange={(e) => handleInputChange('title', e.target.value)} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input 
                    id="author" 
                    value={localBook.author} 
                    onChange={(e) => handleInputChange('author', e.target.value)} 
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={localBook.category || "Other"} 
                    onValueChange={(value: string) => handleInputChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Reading Status</Label>
                <Select 
                  value={localBook.status} 
                  onValueChange={(value: any) => handleStatusChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reading status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-read">To Read</SelectItem>
                    <SelectItem value="reading">Currently Reading</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="totalPages">Total Pages</Label>
                <Input 
                  id="totalPages" 
                  type="number" 
                  min="1"
                  value={localBook.totalPages} 
                  onChange={(e) => handleInputChange('totalPages', parseInt(e.target.value) || 0)} 
                />
              </div>
              
              <div>
                <Label htmlFor="description">Book Description (Optional)</Label>
                <Input 
                  id="description" 
                  value={localBook.description || ''} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  placeholder="A brief description of the book"
                />
              </div>

              <div>
                <Label htmlFor="coverUrl">Cover Image URL (Optional)</Label>
                <Input 
                  id="coverUrl" 
                  value={localBook.coverUrl || ''} 
                  onChange={(e) => handleInputChange('coverUrl', e.target.value)} 
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="progress" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BookTracking book={localBook} onPageChange={handlePageChange} />
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Today's Reading</h3>
                {todayReadingTotal > 0 ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{todayReadingTotal} pages</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Last updated: {formatReadingTime(
                        localBook.readingHistory?.find(s => s.date === format(new Date(), 'yyyy-MM-dd'))?.timestamp || ''
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reading recorded today. Start reading and update your progress!</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Reading Stats</h3>
              <div className="space-y-3">
                {localBook.readingHistory && localBook.readingHistory.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-semibold">
                          {localBook.readingHistory.length}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Total Pages Read</p>
                        <p className="text-2xl font-semibold">
                          {localBook.readingHistory.reduce((total, session) => total + session.pagesRead, 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Reading Sessions</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                        {[...localBook.readingHistory]
                          .sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime())
                          .slice(0, 5)
                          .map((session, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/25 rounded">
                              <div>
                                <p className="font-medium">{format(new Date(session.date), 'MMM d, yyyy')}</p>
                                {session.timestamp && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatReadingTime(session.timestamp)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{session.pagesRead} pages</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-muted/30 p-6 rounded-md text-center">
                    <p className="text-muted-foreground">No reading sessions recorded yet.</p>
                    <p className="text-sm mt-2">Update your reading progress to start tracking your sessions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Book Notes</h3>
            <BookWritingCanvas 
              initialContent={localBook.notes || ""}
              onSave={handleSaveNotes}
              placeholder="Write your thoughts about this book..."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookDetails;
