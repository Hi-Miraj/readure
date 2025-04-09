
import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Book } from '@/types/book';

interface BookTrackingProps {
  book: Book;
  onPageChange: (newPage: number) => void;
}

const BookTracking: React.FC<BookTrackingProps> = ({ book, onPageChange }) => {
  const progressPercentage = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;

  const incrementPage = () => {
    if (book.currentPage < book.totalPages) {
      onPageChange(book.currentPage + 1);
    }
  };

  const decrementPage = () => {
    if (book.currentPage > 0) {
      onPageChange(book.currentPage - 1);
    }
  };

  const handleMultiplePages = () => {
    const pages = prompt("Enter the number of pages you've read:", "5");
    const pagesNumber = parseInt(pages || "0");
    
    if (pagesNumber > 0) {
      const newPage = Math.min(book.currentPage + pagesNumber, book.totalPages);
      onPageChange(newPage);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="currentPage" className="mb-1 inline-block">Current Page</Label>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={decrementPage}
                disabled={book.currentPage <= 0}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease by 1 page</TooltipContent>
          </Tooltip>
          
          <div className="relative flex-1">
            <Input 
              id="currentPage" 
              type="number" 
              min="0"
              max={book.totalPages}
              value={book.currentPage} 
              onChange={(e) => onPageChange(parseInt(e.target.value) || 0)} 
              className="text-center pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              / {book.totalPages}
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={incrementPage}
                disabled={book.currentPage >= book.totalPages}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase by 1 page</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleMultiplePages}
        className="w-full"
        disabled={book.currentPage >= book.totalPages}
      >
        Add Multiple Pages
      </Button>
      
      <div>
        <p className="text-sm text-muted-foreground mb-1">Reading Progress</p>
        <div className="relative w-full bg-muted rounded-full h-2.5 mb-1 overflow-hidden">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-right">{progressPercentage}% completed</p>
      </div>
    </div>
  );
};

export default BookTracking;
