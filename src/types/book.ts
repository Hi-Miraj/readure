
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  totalPages: number;
  currentPage: number;
  status: 'to-read' | 'reading' | 'finished';
  dateAdded: string;
  notes?: string;
  category?: string;
  readingHistory?: ReadingSession[];
}

export interface ReadingSession {
  date: string;
  pagesRead: number;
  timestamp: string; // ISO format timestamp
  timeSpent?: number; // in minutes (optional)
  location?: string; // where the reading took place (optional)
  mood?: 'great' | 'good' | 'neutral' | 'distracted' | 'tired'; // reader's mood (optional)
}
