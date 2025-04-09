import React from 'react';
import ReadingProgressChart from '@/components/ReadingProgressChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  BookMarked, 
  CheckCircle, 
  Clock, 
  Calendar
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { format, parseISO, isToday, isYesterday, startOfMonth } from 'date-fns';
// Import the Flame icon from lucide-react
import { Flame } from 'lucide-react';

// Fetch books from localStorage or return mock data if not available
const fetchBooksData = (): Promise<Book[]> => {
  const storedBooks = localStorage.getItem('books');
  if (storedBooks) {
    return Promise.resolve(JSON.parse(storedBooks));
  }
  
  // Mock data for demonstration if no localStorage data exists
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      totalPages: 180,
      currentPage: 180,
      status: 'finished',
      dateAdded: '2025-03-01',
      category: 'Fiction',
      readingHistory: [
        { date: '2025-04-01', pagesRead: 30, timestamp: new Date().toISOString() },
        { date: '2025-04-02', pagesRead: 25, timestamp: new Date().toISOString() },
        { date: '2025-04-03', pagesRead: 20, timestamp: new Date().toISOString() },
        { date: '2025-04-04', pagesRead: 35, timestamp: new Date().toISOString() },
        { date: '2025-04-05', pagesRead: 40, timestamp: new Date().toISOString() },
        { date: '2025-04-06', pagesRead: 15, timestamp: new Date().toISOString() },
        { date: '2025-04-07', pagesRead: 15, timestamp: new Date().toISOString() },
      ]
    },
    {
      id: '2',
      title: 'Atomic Habits',
      author: 'James Clear',
      totalPages: 320,
      currentPage: 200,
      status: 'reading',
      dateAdded: '2025-03-15',
      category: 'Self-help',
      readingHistory: [
        { date: '2025-04-02', pagesRead: 20, timestamp: new Date().toISOString() },
        { date: '2025-04-03', pagesRead: 30, timestamp: new Date().toISOString() },
        { date: '2025-04-05', pagesRead: 25, timestamp: new Date().toISOString() },
        { date: '2025-04-06', pagesRead: 35, timestamp: new Date().toISOString() },
        { date: '2025-04-07', pagesRead: 40, timestamp: new Date().toISOString() },
        { date: '2025-04-08', pagesRead: 50, timestamp: new Date().toISOString() },
      ]
    },
    {
      id: '3',
      title: 'Deep Work',
      author: 'Cal Newport',
      totalPages: 296,
      currentPage: 150,
      status: 'reading',
      dateAdded: '2025-03-20',
      category: 'Business',
      readingHistory: [
        { date: '2025-04-01', pagesRead: 40, timestamp: new Date().toISOString() },
        { date: '2025-04-04', pagesRead: 35, timestamp: new Date().toISOString() },
        { date: '2025-04-06', pagesRead: 45, timestamp: new Date().toISOString() },
        { date: '2025-04-08', pagesRead: 30, timestamp: new Date().toISOString() },
      ]
    }
  ];
  
  return Promise.resolve(mockBooks);
};

const Analytics = () => {
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooksData
  });

  // Calculate totals
  const totalBooks = books.length;
  const currentlyReading = books.filter(book => book.status === 'reading').length;
  const completed = books.filter(book => book.status === 'finished').length;
  
  // Calculate reading streak (consecutive days with reading activity)
  const calculateReadingStreak = () => {
    if (books.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    
    // Create a set of dates with reading activity
    const readingDays = new Set();
    books.forEach(book => {
      book.readingHistory?.forEach(session => {
        readingDays.add(session.date.split('T')[0]);
      });
    });
    
    // Convert to array and sort in descending order
    const sortedDays = Array.from(readingDays).sort().reverse();
    
    if (sortedDays.length === 0) return 0;
    
    // Check for continuous streak
    let checkDate = new Date();
    while (true) {
      const dateString = format(checkDate, 'yyyy-MM-dd');
      if (readingDays.has(dateString)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const readingStreak = calculateReadingStreak();
  
  // Calculate book categories
  const calculateBookCategories = () => {
    const categoryCount: Record<string, number> = {};
    
    books.forEach(book => {
      const category = book.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count, total: totalBooks }))
      .sort((a, b) => b.count - a.count);
  };
  
  const bookCategories = calculateBookCategories();
  
  // Calculate pages read today
  const calculatePagesToday = () => {
    return books.reduce((total, book) => {
      const pagesToday = book.readingHistory?.reduce((sum, session) => {
        const sessionDate = parseISO(session.date);
        return isToday(sessionDate) ? sum + session.pagesRead : sum;
      }, 0) || 0;
      
      return total + pagesToday;
    }, 0);
  };
  
  const pagesReadToday = calculatePagesToday();
  
  // Calculate pages read yesterday
  const calculatePagesYesterday = () => {
    return books.reduce((total, book) => {
      const pagesYesterday = book.readingHistory?.reduce((sum, session) => {
        const sessionDate = parseISO(session.date);
        return isYesterday(sessionDate) ? sum + session.pagesRead : sum;
      }, 0) || 0;
      
      return total + pagesYesterday;
    }, 0);
  };
  
  const pagesReadYesterday = calculatePagesYesterday();
  
  // Calculate pages read this month
  const calculatePagesThisMonth = () => {
    const firstDayOfMonth = startOfMonth(new Date());
    
    return books.reduce((total, book) => {
      const pagesThisMonth = book.readingHistory?.reduce((sum, session) => {
        const sessionDate = parseISO(session.date);
        return sessionDate >= firstDayOfMonth ? sum + session.pagesRead : sum;
      }, 0) || 0;
      
      return total + pagesThisMonth;
    }, 0);
  };
  
  const pagesReadThisMonth = calculatePagesThisMonth();
  
  // Get latest reading sessions
  const getLatestReadingSessions = () => {
    const allSessions: {
      bookTitle: string;
      date: Date;
      pagesRead: number;
      timestamp: string;
    }[] = [];
    
    books.forEach(book => {
      book.readingHistory?.forEach(session => {
        allSessions.push({
          bookTitle: book.title,
          date: parseISO(session.date),
          pagesRead: session.pagesRead,
          timestamp: session.timestamp || session.date,
        });
      });
    });
    
    return allSessions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  };
  
  const latestSessions = getLatestReadingSessions();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading analytics data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reading Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">In your library</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Reading</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentlyReading}</div>
            <p className="text-xs text-muted-foreground">Books in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
            <p className="text-xs text-muted-foreground">Books finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{readingStreak} days</div>
              {readingStreak > 0 && (
                <Flame className="h-6 w-6 text-orange-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Reading</CardTitle>
            <CardDescription>Pages read today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{pagesReadToday}</div>
            <p className="text-sm text-muted-foreground">
              {pagesReadToday > pagesReadYesterday 
                ? `+${pagesReadToday - pagesReadYesterday} from yesterday` 
                : pagesReadToday < pagesReadYesterday
                  ? `-${pagesReadYesterday - pagesReadToday} from yesterday`
                  : "Same as yesterday"}
            </p>
            <div className="text-sm mt-4">
              <span className="font-medium">Monthly total:</span> {pagesReadThisMonth} pages
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Latest Reading Sessions</CardTitle>
            <CardDescription>Your recent reading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestSessions.length > 0 ? (
                latestSessions.map((session, index) => (
                  <div key={index} className="flex justify-between items-start border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{session.bookTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(session.date, 'PPP')} at {format(new Date(session.timestamp), 'h:mm a')}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{session.pagesRead} pages</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No reading sessions recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reading by Category</CardTitle>
            <CardDescription>Distribution of books by genre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookCategories.length > 0 ? (
                bookCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">
                        {category.count} books
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(category.count / category.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No categories available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <ReadingProgressChart />
      </div>
    </div>
  );
};

export default Analytics;
