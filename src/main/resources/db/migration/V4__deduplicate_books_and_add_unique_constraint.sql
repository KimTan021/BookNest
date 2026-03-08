DELETE b1
FROM books b1
JOIN books b2
  ON b1.title = b2.title
 AND b1.author_id = b2.author_id
 AND b1.category_id = b2.category_id
 AND b1.id > b2.id;

ALTER TABLE books
ADD CONSTRAINT uq_books_title_author_category
UNIQUE (title, author_id, category_id);
