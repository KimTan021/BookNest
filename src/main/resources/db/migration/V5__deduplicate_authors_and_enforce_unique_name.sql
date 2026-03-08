UPDATE books b
JOIN authors a ON b.author_id = a.id
JOIN (
    SELECT name, MIN(id) AS canonical_id
    FROM authors
    GROUP BY name
) c ON a.name = c.name
SET b.author_id = c.canonical_id
WHERE b.author_id <> c.canonical_id;

DELETE a1
FROM authors a1
JOIN authors a2
  ON a1.name = a2.name
 AND a1.id > a2.id;

ALTER TABLE authors
ADD CONSTRAINT uq_authors_name UNIQUE (name);
