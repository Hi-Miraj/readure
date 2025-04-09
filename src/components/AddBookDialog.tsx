
import React from 'react';
import { useForm } from "react-hook-form";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddBookDialogProps {
  onAddBook: (book: Book) => void;
}

const AddBookDialog: React.FC<AddBookDialogProps> = ({ onAddBook }) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      coverUrl: "",
      description: "",
      totalPages: 0,
      currentPage: 0,
      status: "to-read" as const,
      category: "",
    },
  });

  const onSubmit = (data: any) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: data.title,
      author: data.author,
      coverUrl: data.coverUrl || `https://picsum.photos/seed/${Date.now()}/200/300`,
      description: data.description || "",
      totalPages: Number(data.totalPages),
      currentPage: Number(data.currentPage),
      status: data.status,
      dateAdded: new Date().toISOString(),
      notes: "",
      category: data.category || "Uncategorized",
    };

    onAddBook(newBook);
    form.reset();
    setOpen(false);
    toast({
      title: "Book added",
      description: `${data.title} has been added to your library`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Enter the details of the book you want to add to your library.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Book title" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Author name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/book-cover.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="totalPages"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Total Pages</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentPage"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Current Page</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Reading Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reading status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="to-read">To Read</SelectItem>
                        <SelectItem value="reading">Currently Reading</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fiction, Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px]"
                      placeholder="Brief description of the book..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Add Book</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
