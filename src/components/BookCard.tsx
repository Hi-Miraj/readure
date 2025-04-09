
import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const progressPercentage = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;

  const statusColors = {
    'to-read': 'bg-blue-500',
    'reading': 'bg-amber-500',
    'finished': 'bg-green-500'
  };

  const statusLabels = {
    'to-read': 'To Read',
    'reading': 'Reading',
    'finished': 'Finished'
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={() => onClick(book)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={book.coverUrl || 'https://via.placeholder.com/150'} 
          alt={`${book.title} cover`}
          className="w-full h-full object-cover"
        />
        <Badge 
          className="absolute top-2 right-2"
          variant="secondary"
        >
          {statusLabels[book.status]}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{book.title}</h3>
        <p className="text-muted-foreground text-sm mb-2">by {book.author}</p>
        
        {book.status === 'reading' && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-1.5 mb-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Page {book.currentPage} of {book.totalPages}</span>
              <span>{progressPercentage}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCard;
