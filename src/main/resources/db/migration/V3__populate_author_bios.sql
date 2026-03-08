UPDATE authors
SET bio = CASE name
    WHEN 'J.K. Rowling' THEN 'British author best known for the Harry Potter fantasy series.'
    WHEN 'J.R.R. Tolkien' THEN 'English writer and scholar, author of The Hobbit and The Lord of the Rings.'
    WHEN 'Jane Austen' THEN 'Classic English novelist known for social commentary and romance.'
    WHEN 'F. Scott Fitzgerald' THEN 'American novelist of the Jazz Age, author of The Great Gatsby.'
    WHEN 'George Orwell' THEN 'English novelist and essayist known for political fiction and satire.'
    WHEN 'Aldous Huxley' THEN 'English writer known for dystopian novel Brave New World.'
    WHEN 'Joshua Bloch' THEN 'Software engineer and author of Effective Java.'
    WHEN 'Jeannette Walls' THEN 'American author and journalist, best known for The Glass Castle.'
    WHEN 'Donald Knuth' THEN 'Computer scientist and author of The Art of Computer Programming.'
    WHEN 'Jon Duckett' THEN 'Author of popular beginner-friendly web development books.'
    WHEN 'James Clear' THEN 'Writer and speaker focused on habits, behavior, and performance.'
    WHEN 'Walter Isaacson' THEN 'Biographer known for works on Steve Jobs and other innovators.'
    WHEN 'Brandon Sanderson' THEN 'American fantasy and science fiction author, creator of Mistborn.'
    WHEN 'Douglas Adams' THEN 'English humorist and author of The Hitchhiker''s Guide to the Galaxy.'
    WHEN 'Martin Fowler' THEN 'Software architect and author known for Refactoring.'
    WHEN 'Robert C. Martin' THEN 'Software consultant and author known as Uncle Bob in clean code circles.'
    WHEN 'Erich Gamma' THEN 'Computer scientist and co-author of Design Patterns.'
    WHEN 'Andy Weir' THEN 'Science fiction novelist, author of The Martian and Project Hail Mary.'
    WHEN 'Frank Herbert' THEN 'American science fiction author best known for Dune.'
    WHEN 'Ashlee Vance' THEN 'Journalist and biographer, author of Elon Musk.'
    WHEN 'Cal Newport' THEN 'Computer science professor and author of Deep Work.'
    WHEN 'Eric Ries' THEN 'Entrepreneur and author of The Lean Startup.'
    WHEN 'Peter Thiel' THEN 'Entrepreneur, investor, and co-author of Zero to One.'
    WHEN 'Harper Lee' THEN 'American novelist best known for To Kill a Mockingbird.'
    WHEN 'Yuval Noah Harari' THEN 'Historian and author of Sapiens.'
    WHEN 'Tara Westover' THEN 'Memoirist and historian, author of Educated.'
    WHEN 'Michelle Obama' THEN 'Former First Lady of the United States and author of Becoming.'
    WHEN 'Anne Frank' THEN 'Jewish diarist whose writings document life during World War II.'
    WHEN 'George S. Clason' THEN 'Author of The Richest Man in Babylon, focused on financial wisdom.'
    WHEN 'Napoleon Hill' THEN 'Self-help author known for Think and Grow Rich.'
    WHEN 'Charles Dickens' THEN 'Victorian English novelist known for social realism and memorable characters.'
    ELSE bio
END
WHERE name IN (
    'J.K. Rowling',
    'J.R.R. Tolkien',
    'Jane Austen',
    'F. Scott Fitzgerald',
    'George Orwell',
    'Aldous Huxley',
    'Joshua Bloch',
    'Jeannette Walls',
    'Donald Knuth',
    'Jon Duckett',
    'James Clear',
    'Walter Isaacson',
    'Brandon Sanderson',
    'Douglas Adams',
    'Martin Fowler',
    'Robert C. Martin',
    'Erich Gamma',
    'Andy Weir',
    'Frank Herbert',
    'Ashlee Vance',
    'Cal Newport',
    'Eric Ries',
    'Peter Thiel',
    'Harper Lee',
    'Yuval Noah Harari',
    'Tara Westover',
    'Michelle Obama',
    'Anne Frank',
    'George S. Clason',
    'Napoleon Hill',
    'Charles Dickens'
);
