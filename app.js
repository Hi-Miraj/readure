
// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const navLinks = document.querySelectorAll('.sidebar nav ul li a');
const views = document.querySelectorAll('.view');
const addBookBtn = document.getElementById('add-book-btn');
const addBookModal = document.getElementById('add-book-modal');
const bookDetailsModal = document.getElementById('book-details-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const cancelAddBookBtn = document.getElementById('cancel-add-book');
const addBookForm = document.getElementById('add-book-form');
const bookStatusSelect = document.getElementById('book-status');
const readingDetailsDiv = document.querySelector('.reading-details');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const toast = document.getElementById('toast');
const closeDetailsBtn = document.getElementById('close-details');
const deleteBookBtn = document.getElementById('delete-book');
const updateProgressBtn = document.getElementById('update-progress');
const saveNotesBtn = document.getElementById('save-notes');
const addQuoteBtn = document.getElementById('add-quote');
const detailBookStatus = document.getElementById('detail-book-status');

// Sort elements
const sortAllBooks = document.getElementById('sort-books');
const sortToRead = document.getElementById('sort-to-read');
const sortReading = document.getElementById('sort-reading');
const sortFinished = document.getElementById('sort-finished');

// Book grids
const allBooksGrid = document.getElementById('all-books-grid');
const toReadGrid = document.getElementById('to-read-grid');
const readingGrid = document.getElementById('reading-grid');
const finishedGrid = document.getElementById('finished-grid');
const recentBooksGrid = document.getElementById('recent-books');
const currentReadingGrid = document.getElementById('current-reading');

// Counters
const totalBooksCount = document.getElementById('total-books-count');
const toReadCount = document.getElementById('to-read-count');
const readingCount = document.getElementById('reading-count');
const finishedCount = document.getElementById('finished-count');

// Book data
let books = JSON.parse(localStorage.getItem('books')) || [];
let currentBookId = null;

// Default book cover images
const defaultBookCovers = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1374&auto=format&fit=crop'
];

// Initialize the application
function init() {
    loadBooks();
    updateCounters();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            
            // Remove active class from all links and add to clicked one
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            link.parentElement.classList.add('active');
            
            // Hide all views and show selected one
            views.forEach(view => {
                view.classList.remove('active-view');
            });

            if (viewId === 'dashboard') {
                document.getElementById('dashboard-view').classList.add('active-view');
            } else if (viewId === 'all-books') {
                document.getElementById('all-books-view').classList.add('active-view');
            } else if (viewId === 'to-read') {
                document.getElementById('to-read-view').classList.add('active-view');
            } else if (viewId === 'reading') {
                document.getElementById('reading-view').classList.add('active-view');
            } else if (viewId === 'finished') {
                document.getElementById('finished-view').classList.add('active-view');
            }
            
            // Close mobile menu after navigation
            sidebar.classList.remove('active');
        });
    });

    // Add book button
    addBookBtn.addEventListener('click', () => {
        // Reset form
        addBookForm.reset();
        // Show modal
        addBookModal.style.display = 'block';
        // Initially hide reading details
        toggleReadingDetails();
    });

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addBookModal.style.display = 'none';
            bookDetailsModal.style.display = 'none';
        });
    });

    // Cancel add book
    cancelAddBookBtn.addEventListener('click', () => {
        addBookModal.style.display = 'none';
    });

    // Close book details
    closeDetailsBtn.addEventListener('click', () => {
        bookDetailsModal.style.display = 'none';
    });

    // Book status change
    bookStatusSelect.addEventListener('change', toggleReadingDetails);

    // Add book form submission
    addBookForm.addEventListener('submit', handleAddBook);

    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Sort functionality
    sortAllBooks.addEventListener('change', () => sortBooks('all', sortAllBooks.value));
    sortToRead.addEventListener('change', () => sortBooks('to-read', sortToRead.value));
    sortReading.addEventListener('change', () => sortBooks('reading', sortReading.value));
    sortFinished.addEventListener('change', () => sortBooks('finished', sortFinished.value));

    // Book detail events
    deleteBookBtn.addEventListener('click', handleDeleteBook);
    updateProgressBtn.addEventListener('click', handleUpdateProgress);
    saveNotesBtn.addEventListener('click', handleSaveNotes);
    addQuoteBtn.addEventListener('click', handleAddQuote);
    detailBookStatus.addEventListener('change', handleStatusChange);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addBookModal) {
            addBookModal.style.display = 'none';
        }
        if (e.target === bookDetailsModal) {
            bookDetailsModal.style.display = 'none';
        }
    });
}

// Toggle reading details based on status
function toggleReadingDetails() {
    if (bookStatusSelect.value === 'reading' || bookStatusSelect.value === 'finished') {
        readingDetailsDiv.style.display = 'flex';
    } else {
        readingDetailsDiv.style.display = 'none';
    }
}

// Handle adding a new book
function handleAddBook(e) {
    e.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const language = document.getElementById('book-language').value;
    const publicationDate = document.getElementById('book-publication-date').value;
    const status = document.getElementById('book-status').value;
    const totalPages = document.getElementById('book-total-pages').value || 0;
    const currentPage = document.getElementById('book-current-page').value || 0;
    const coverUrl = document.getElementById('book-cover').value || getRandomCover();
    const description = document.getElementById('book-description').value;
    
    const newBook = {
        id: Date.now().toString(),
        title,
        author,
        language,
        publicationDate,
        status,
        totalPages: parseInt(totalPages, 10),
        currentPage: parseInt(currentPage, 10),
        coverUrl,
        description,
        dateAdded: new Date().toISOString(),
        notes: '',
        quotes: []
    };
    
    books.unshift(newBook);
    saveBooks();
    loadBooks();
    updateCounters();
    addBookModal.style.display = 'none';
    showToast('Success! Book added to your library.');
}

// Get random book cover
function getRandomCover() {
    const randomIndex = Math.floor(Math.random() * defaultBookCovers.length);
    return defaultBookCovers[randomIndex];
}

// Handle deleting a book
function handleDeleteBook() {
    if (currentBookId) {
        const confirmDelete = confirm('Are you sure you want to delete this book?');
        if (confirmDelete) {
            books = books.filter(book => book.id !== currentBookId);
            saveBooks();
            loadBooks();
            updateCounters();
            bookDetailsModal.style.display = 'none';
            showToast('Book deleted from your library.');
        }
    }
}

// Handle updating progress
function handleUpdateProgress() {
    if (currentBookId) {
        const totalPages = parseInt(document.getElementById('detail-total-pages').value, 10);
        const currentPage = parseInt(document.getElementById('detail-current-page').value, 10);
        
        // Validate input
        if (currentPage > totalPages) {
            alert('Current page cannot be greater than total pages.');
            return;
        }
        
        const bookIndex = books.findIndex(book => book.id === currentBookId);
        if (bookIndex !== -1) {
            books[bookIndex].totalPages = totalPages;
            books[bookIndex].currentPage = currentPage;
            
            // If finished reading, change status
            if (currentPage === totalPages && totalPages > 0) {
                books[bookIndex].status = 'finished';
                detailBookStatus.value = 'finished';
            } else if (currentPage > 0) {
                books[bookIndex].status = 'reading';
                detailBookStatus.value = 'reading';
            }
            
            saveBooks();
            updateBookDetails(books[bookIndex]);
            loadBooks();
            updateCounters();
            showToast('Reading progress updated.');
        }
    }
}

// Handle saving notes
function handleSaveNotes() {
    if (currentBookId) {
        const notes = document.getElementById('book-notes').value;
        const bookIndex = books.findIndex(book => book.id === currentBookId);
        if (bookIndex !== -1) {
            books[bookIndex].notes = notes;
            saveBooks();
            showToast('Notes saved successfully.');
        }
    }
}

// Handle adding a quote
function handleAddQuote() {
    if (currentBookId) {
        const quoteText = document.getElementById('new-quote').value.trim();
        if (quoteText) {
            const bookIndex = books.findIndex(book => book.id === currentBookId);
            if (bookIndex !== -1) {
                const newQuote = {
                    id: Date.now().toString(),
                    text: quoteText,
                    date: new Date().toISOString()
                };
                
                if (!books[bookIndex].quotes) {
                    books[bookIndex].quotes = [];
                }
                
                books[bookIndex].quotes.push(newQuote);
                saveBooks();
                document.getElementById('new-quote').value = '';
                loadQuotes(books[bookIndex].quotes);
                showToast('Quote added successfully.');
            }
        } else {
            alert('Please enter a quote before adding.');
        }
    }
}

// Handle status change in book details
function handleStatusChange() {
    if (currentBookId) {
        const newStatus = detailBookStatus.value;
        const bookIndex = books.findIndex(book => book.id === currentBookId);
        
        if (bookIndex !== -1) {
            books[bookIndex].status = newStatus;
            
            // If changing to "to-read", reset progress
            if (newStatus === 'to-read') {
                books[bookIndex].currentPage = 0;
            }
            
            saveBooks();
            updateBookDetails(books[bookIndex]);
            loadBooks();
            updateCounters();
            showToast('Book status updated.');
        }
    }
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm) {
        const searchResults = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) ||
            (book.description && book.description.toLowerCase().includes(searchTerm))
        );
        
        // Navigate to all books view and display results
        navLinks.forEach(navLink => {
            navLink.parentElement.classList.remove('active');
        });
        document.querySelector('[data-view="all-books"]').parentElement.classList.add('active');
        
        views.forEach(view => {
            view.classList.remove('active-view');
        });
        document.getElementById('all-books-view').classList.add('active-view');
        
        // Show search results
        renderBooks(allBooksGrid, searchResults);
        document.querySelector('#all-books-view h2').textContent = `Search Results for "${searchTerm}"`;
    }
}

// Load books and display them
function loadBooks() {
    // Sort books initially
    sortBooks('all', sortAllBooks.value);
    sortBooks('to-read', sortToRead.value);
    sortBooks('reading', sortReading.value);
    sortBooks('finished', sortFinished.value);
    
    // Load recent books (latest 6)
    const recentBooks = [...books].slice(0, 6);
    renderBooks(recentBooksGrid, recentBooks);
    
    // Load currently reading books
    const currentlyReading = books.filter(book => book.status === 'reading');
    renderBooks(currentReadingGrid, currentlyReading);
}

// Sort books based on criteria
function sortBooks(category, sortCriteria) {
    let filteredBooks;
    let targetGrid;
    
    // Filter books by category
    if (category === 'all') {
        filteredBooks = [...books];
        targetGrid = allBooksGrid;
    } else if (category === 'to-read') {
        filteredBooks = books.filter(book => book.status === 'to-read');
        targetGrid = toReadGrid;
    } else if (category === 'reading') {
        filteredBooks = books.filter(book => book.status === 'reading');
        targetGrid = readingGrid;
    } else if (category === 'finished') {
        filteredBooks = books.filter(book => book.status === 'finished');
        targetGrid = finishedGrid;
    }
    
    // Sort books
    switch (sortCriteria) {
        case 'date-desc':
            filteredBooks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'date-asc':
            filteredBooks.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        case 'title':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'progress':
            filteredBooks.sort((a, b) => {
                const progressA = a.totalPages > 0 ? (a.currentPage / a.totalPages * 100) : 0;
                const progressB = b.totalPages > 0 ? (b.currentPage / b.totalPages * 100) : 0;
                return progressB - progressA;
            });
            break;
    }
    
    renderBooks(targetGrid, filteredBooks);
}

// Render books in a grid
function renderBooks(gridElement, booksToRender) {
    gridElement.innerHTML = '';
    
    if (booksToRender.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.style.gridColumn = '1 / -1';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.color = 'var(--text-secondary)';
        emptyMessage.textContent = 'No books found. Add some books to your library!';
        gridElement.appendChild(emptyMessage);
        return;
    }
    
    booksToRender.forEach(book => {
        const bookCard = createBookCard(book);
        gridElement.appendChild(bookCard);
    });
}

// Create a book card element
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.id = book.id;
    
    const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    
    bookCard.innerHTML = `
        <div class="book-cover">
            <img src="${book.coverUrl}" alt="${book.title} cover">
            <div class="book-status-badge ${book.status}">${formatStatus(book.status)}</div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            ${book.status === 'reading' ? `
                <div class="book-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <p class="progress-text">${progress}% · ${book.currentPage} of ${book.totalPages}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add click event to show book details
    bookCard.addEventListener('click', () => {
        showBookDetails(book);
    });
    
    return bookCard;
}

// Show book details in modal
function showBookDetails(book) {
    currentBookId = book.id;
    updateBookDetails(book);
    bookDetailsModal.style.display = 'block';
}

// Update book details in modal
function updateBookDetails(book) {
    // Update book details
    document.getElementById('detail-book-title').textContent = book.title;
    document.getElementById('detail-book-author').textContent = book.author;
    document.getElementById('detail-book-language').textContent = book.language || 'Not specified';
    document.getElementById('detail-book-publication-date').textContent = book.publicationDate ? formatDate(book.publicationDate) : 'Not specified';
    document.getElementById('detail-book-added-date').textContent = formatDate(book.dateAdded);
    document.getElementById('detail-book-cover').src = book.coverUrl;
    document.getElementById('detail-book-description').textContent = book.description || 'No description available.';
    document.getElementById('detail-book-status').value = book.status;
    
    // Update progress details
    document.getElementById('detail-total-pages').value = book.totalPages || '';
    document.getElementById('detail-current-page').value = book.currentPage || '';
    
    const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    document.getElementById('detail-progress-bar').style.width = `${progress}%`;
    document.getElementById('detail-page-info').textContent = `${book.currentPage} of ${book.totalPages} pages`;
    document.getElementById('detail-percentage').textContent = `${progress}%`;
    
    // Update notes
    document.getElementById('book-notes').value = book.notes || '';
    
    // Load quotes
    loadQuotes(book.quotes || []);
}

// Load quotes for a book
function loadQuotes(quotes) {
    const quotesListElement = document.getElementById('quotes-list');
    quotesListElement.innerHTML = '';
    
    if (quotes.length === 0) {
        quotesListElement.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No quotes added yet.</p>';
        return;
    }
    
    quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.dataset.id = quote.id;
        
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <div class="quote-actions">
                <button class="delete-quote" title="Delete Quote"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Add delete quote functionality
        quoteElement.querySelector('.delete-quote').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteQuote(quote.id);
        });
        
        quotesListElement.appendChild(quoteElement);
    });
}

// Delete a quote
function deleteQuote(quoteId) {
    if (currentBookId) {
        const bookIndex = books.findIndex(book => book.id === currentBookId);
        if (bookIndex !== -1) {
            books[bookIndex].quotes = books[bookIndex].quotes.filter(quote => quote.id !== quoteId);
            saveBooks();
            loadQuotes(books[bookIndex].quotes);
            showToast('Quote deleted.');
        }
    }
}

// Update counters on dashboard
function updateCounters() {
    totalBooksCount.textContent = books.length;
    toReadCount.textContent = books.filter(book => book.status === 'to-read').length;
    readingCount.textContent = books.filter(book => book.status === 'reading').length;
    finishedCount.textContent = books.filter(book => book.status === 'finished').length;
}

// Save books to localStorage
function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}

// Helper function to format status
function formatStatus(status) {
    switch (status) {
        case 'to-read':
            return 'To Read';
        case 'reading':
            return 'Reading';
        case 'finished':
            return 'Finished';
        default:
            return status;
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show toast notification
function showToast(message) {
    const toastMessage = document.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the app on load
document.addEventListener('DOMContentLoaded', init);

// Sample data for testing - Uncomment to add sample books
/*
if (books.length === 0) {
    books = [
        {
            id: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            language: 'English',
            publicationDate: '1925-04-10',
            status: 'finished',
            totalPages: 180,
            currentPage: 180,
            coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop',
            description: 'Set in the Jazz Age, The Great Gatsby tells the story of eccentric millionaire Jay Gatsby, his obsession with the beautiful Daisy Buchanan, and lavish parties on Long Island.',
            dateAdded: '2023-05-15T10:30:00Z',
            notes: 'A masterpiece of American literature examining the American Dream.',
            quotes: [
                {
                    id: '101',
                    text: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
                    date: '2023-05-20T14:25:00Z'
                }
            ]
        },
        {
            id: '2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            language: 'English',
            publicationDate: '1960-07-11',
            status: 'reading',
            totalPages: 324,
            currentPage: 186,
            coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1374&auto=format&fit=crop',
            description: 'The story of young Scout Finch, her brother Jem, and their father Atticus, a lawyer who defends a black man accused of raping a white woman in the racially charged atmosphere of 1930s Alabama.',
            dateAdded: '2023-06-20T15:45:00Z',
            notes: 'Powerful exploration of racial injustice and loss of innocence.',
            quotes: []
        },
        {
            id: '3',
            title: 'Sapiens: A Brief History of Humankind',
            author: 'Yuval Noah Harari',
            language: 'English',
            publicationDate: '2011-02-10',
            status: 'to-read',
            totalPages: 443,
            currentPage: 0,
            coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1374&auto=format&fit=crop',
            description: 'A sweeping narrative of humanity\'s creation and evolution that explores how biology and history have defined us and enhanced our understanding of what it means to be "human."',
            dateAdded: '2023-07-05T09:15:00Z',
            notes: '',
            quotes: []
        }
    ];
    saveBooks();
}
*/
