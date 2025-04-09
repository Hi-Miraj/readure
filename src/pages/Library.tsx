
import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddBookDialog from '@/components/AddBookDialog';
import BookCard from '@/components/BookCard';
import BookDetails from '@/components/BookDetails';
import { Book } from '@/types/book';
import { Badge } from "@/components/ui/badge";
import { saveBooks, loadBooks } from '@/lib/supabase-store';
import { useToast } from '@/hooks/use-toast';

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load books from Supabase on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const userBooks = await loadBooks();
        setBooks(userBooks);
      } catch (error) {
        console.error('Error loading books:', error);
        toast({
          title: "Error loading books",
          description: "There was a problem loading your books.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, [toast]);

  // Save books to Supabase whenever the books state changes
  useEffect(() => {
    if (!loading) {
      saveBooks(books).catch(error => {
        console.error('Error saving books:', error);
      });
    }
  }, [books, loading]);

  const handleAddBook = (newBook: Book) => {
    setBooks(prevBooks => [newBook, ...prevBooks]);
    setSelectedBook(newBook);
    setShowDetails(true);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      )
    );
    setSelectedBook(updatedBook);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    setSelectedBook(null);
    setShowDetails(false);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setShowDetails(true);
  };

  const handleBackToLibrary = () => {
    setShowDetails(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter books based on search query
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group books by status for better organization
  const groupedBooks = {
    reading: filteredBooks.filter(book => book.status === 'reading'),
    toRead: filteredBooks.filter(book => book.status === 'to-read'),
    finished: filteredBooks.filter(book => book.status === 'finished')
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Your Library</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search books..." 
              className="pl-8" 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <AddBookDialog onAddBook={handleAddBook} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading your books...</p>
          </div>
        </div>
      ) : showDetails ? (
        <BookDetails 
          book={selectedBook} 
          onSave={handleUpdateBook}
          onDelete={handleDeleteBook}
          onBack={handleBackToLibrary}
        />
      ) : (
        <div className="space-y-10">
          {/* Currently Reading Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Currently Reading</h2>
              <Badge variant="secondary">{groupedBooks.reading.length}</Badge>
            </div>
            
            {groupedBooks.reading.length === 0 ? (
              <p className="text-muted-foreground">You're not currently reading any books.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedBooks.reading.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onClick={handleSelectBook} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* To Read Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">To Read</h2>
              <Badge variant="secondary">{groupedBooks.toRead.length}</Badge>
            </div>
            
            {groupedBooks.toRead.length === 0 ? (
              <p className="text-muted-foreground">No books in your to-read list.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedBooks.toRead.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onClick={handleSelectBook} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Finished Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Finished</h2>
              <Badge variant="secondary">{groupedBooks.finished.length}</Badge>
            </div>
            
            {groupedBooks.finished.length === 0 ? (
              <p className="text-muted-foreground">You haven't finished any books yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedBooks.finished.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onClick={handleSelectBook} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* All Books (if none in categories) */}
          {filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {books.length === 0 
                  ? "You haven't added any books yet. Add your first book to get started!" 
                  : "No books match your search. Try a different term."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
