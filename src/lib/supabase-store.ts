
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { Json } from "@/integrations/supabase/types";

export const saveBooks = async (books: Book[]) => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) return false;
  
  const userId = session.session.user.id;
  
  // Store the books in localStorage as a backup
  localStorage.setItem('books', JSON.stringify(books));
  
  // Store the books in Supabase
  try {
    // First, remove existing books for this user
    await supabase
      .from('books')
      .delete()
      .eq('user_id', userId);
      
    // Then, insert all books with the user_id
    if (books.length > 0) {
      // Insert each book individually to avoid type errors
      for (const book of books) {
        const { error } = await supabase
          .from('books')
          .insert({
            user_id: userId,
            title: book.title,
            author: book.author,
            book_data: book as unknown as Json
          });
          
        if (error) throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving books to Supabase:', error);
    return false;
  }
};

export const loadBooks = async (): Promise<Book[]> => {
  // First try to get from Supabase
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      // If not logged in, fall back to localStorage
      const savedBooks = localStorage.getItem('books');
      return savedBooks ? JSON.parse(savedBooks) : [];
    }
    
    const userId = session.session.user.id;
    
    const { data, error } = await supabase
      .from('books')
      .select('book_data')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Extract the book_data from each row and cast it properly
      return data.map(row => row.book_data as unknown as Book);
    }
    
    // If no data in Supabase, check localStorage
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      const books = JSON.parse(savedBooks);
      // Save to Supabase for next time
      await saveBooks(books);
      return books;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading books from Supabase:', error);
    // Fall back to localStorage
    const savedBooks = localStorage.getItem('books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  }
};
