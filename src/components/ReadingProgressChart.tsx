
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { format, subDays, subMonths, subYears, parseISO, isWithinInterval } from 'date-fns';
import { Book } from '@/types/book';

interface ChartData {
  date: string;
  pagesRead: number;
  rawDate: Date; // For sorting
}

// This would be replaced by actual API call in a real app
const fetchReadingData = (): Promise<Book[]> => {
  // Get books from localStorage or return mock data if not available
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
    }
  ];
  
  return Promise.resolve(mockBooks);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">{`${payload[0].value} pages read`}</p>
      </div>
    );
  }
  return null;
};

const ReadingProgressChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchReadingData
  });

  const generateChartData = (): ChartData[] => {
    const today = new Date();
    let startDate: Date;
    let dateFormat = 'MMM d';
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 7);
        dateFormat = 'EEE';
        break;
      case 'month':
        startDate = subMonths(today, 1);
        break;
      case 'year':
        startDate = subYears(today, 1);
        dateFormat = 'MMM';
        break;
    }

    const dateMap = new Map<string, { pagesRead: number, rawDate: Date }>();
    
    // Generate all dates in the range with 0 pages
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const formattedDate = format(currentDate, dateFormat);
      dateMap.set(formattedDate, { pagesRead: 0, rawDate: new Date(currentDate) });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add reading history data
    books.forEach(book => {
      book.readingHistory?.forEach(session => {
        try {
          const sessionDate = parseISO(session.date);
          if (isWithinInterval(sessionDate, { start: startDate, end: today })) {
            const formattedDate = format(sessionDate, dateFormat);
            const existingEntry = dateMap.get(formattedDate);
            if (existingEntry) {
              dateMap.set(formattedDate, { 
                pagesRead: existingEntry.pagesRead + session.pagesRead, 
                rawDate: sessionDate 
              });
            }
          }
        } catch (error) {
          console.error("Error processing session date:", session.date, error);
        }
      });
    });
    
    // Convert Map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, { pagesRead, rawDate }]) => ({
        date,
        pagesRead,
        rawDate
      }))
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  };
  
  const chartData = generateChartData();

  const renderChart = () => {
    if (isLoading) {
      return <div className="h-64 flex items-center justify-center">Loading chart data...</div>;
    }

    const commonChartProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonChartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: 'Pages', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="pagesRead"
            name="Pages Read"
            stroke="hsl(var(--primary))"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      );
    }

    return (
      <BarChart {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ value: 'Pages', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="pagesRead"
          name="Pages Read"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    );
  };
  
  const totalPagesRead = chartData.reduce((total, item) => total + item.pagesRead, 0);
  const averagePagesPerDay = Math.round(totalPagesRead / chartData.length) || 0;
  const maxPagesInOneDay = Math.max(...chartData.map(item => item.pagesRead)) || 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Reading Progress</CardTitle>
          <CardDescription>Pages read over time</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select
            value={chartType}
            onValueChange={(value: 'line' | 'bar') => setChartType(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeRange}
            onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-muted/30 rounded-md p-3 text-center">
            <p className="text-sm text-muted-foreground">Total Pages</p>
            <p className="text-2xl font-semibold">{totalPagesRead}</p>
          </div>
          <div className="bg-muted/30 rounded-md p-3 text-center">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-semibold">{averagePagesPerDay}</p>
          </div>
          <div className="bg-muted/30 rounded-md p-3 text-center">
            <p className="text-sm text-muted-foreground">Best Day</p>
            <p className="text-2xl font-semibold">{maxPagesInOneDay}</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingProgressChart;
