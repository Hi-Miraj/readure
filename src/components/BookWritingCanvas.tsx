
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bold, Italic, List, Quote } from 'lucide-react';

interface BookWritingCanvasProps {
  initialContent?: string;
  onSave: (content: string) => void;
  placeholder?: string;
}

const BookWritingCanvas = ({ initialContent = '', onSave, placeholder = 'Start writing about this book...' }: BookWritingCanvasProps) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(content);
    setIsEditing(false);
  };

  const handleFormat = (format: string) => {
    const textarea = document.getElementById('book-writing-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        cursorOffset = 2;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Set cursor position after format is applied
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + formattedText.length);
    }, 0);
  };

  const renderFormattedContent = () => {
    let formattedContent = content;
    
    // Replace bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace quotes
    formattedContent = formattedContent.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    
    // Replace lists
    formattedContent = formattedContent.replace(/^- (.*)$/gm, '<li>$1</li>').replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`);
    
    // Replace new lines
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return { __html: formattedContent };
  };

  return (
    <Card className="w-full overflow-hidden border-2 transition-all shadow-sm hover:shadow-md">
      {isEditing ? (
        <div className="flex flex-col">
          <div className="bg-muted p-2 border-b flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('bold')}
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('italic')}
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('list')}
              aria-label="List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFormat('quote')}
              aria-label="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
          <textarea
            id="book-writing-textarea"
            className="min-h-[200px] p-4 w-full outline-none resize-y bg-card text-card-foreground"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
          />
          <div className="flex justify-end space-x-2 p-2 bg-muted border-t">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="min-h-[200px] p-4 prose dark:prose-invert max-w-none cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {content ? (
            <div dangerouslySetInnerHTML={renderFormattedContent()} />
          ) : (
            <p className="text-muted-foreground">{placeholder}</p>
          )}
          <div className="mt-4 text-center opacity-0 hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookWritingCanvas;
