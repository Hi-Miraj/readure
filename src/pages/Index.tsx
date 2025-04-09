
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Library, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">Welcome to Readure</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your personal reading companion. Track your books, set reading goals, and organize your literary journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-3 rounded-full bg-primary/10 w-fit">
              <Book className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-2">Track Your Books</CardTitle>
            <CardDescription>
              Keep a record of all your books in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Add books to your collection, mark your reading progress, and organize them by status and category.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/library')} className="w-full group">
              Go to Library
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-3 rounded-full bg-primary/10 w-fit">
              <Library className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-2">Manage Your Reading</CardTitle>
            <CardDescription>
              Keep track of what you're currently reading.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Update your reading progress, add notes and thoughts as you read, and categorize your books.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/library')} className="w-full group">
              Manage Books
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-3 rounded-full bg-primary/10 w-fit">
              <BarChart3 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-2">Analyze Your Reading</CardTitle>
            <CardDescription>
              View insights about your reading habits.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Track your reading progress over time, see statistics about your book collection, and identify trends.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/analytics')} className="w-full group">
              View Analytics
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/20 mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Add a Book</h3>
              <p className="text-sm text-muted-foreground">Add books to your library with title, author, and page count.</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/20 mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Update Progress</h3>
              <p className="text-sm text-muted-foreground">Track your reading by updating your current page.</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/20 mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground">See your reading stats and track your progress over time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
