package com.kimtan.onlinebookstore.config;

import com.kimtan.onlinebookstore.entity.Author;
import com.kimtan.onlinebookstore.entity.Book;
import com.kimtan.onlinebookstore.entity.Category;
import com.kimtan.onlinebookstore.repository.AuthorRepository;
import com.kimtan.onlinebookstore.repository.BookRepository;
import com.kimtan.onlinebookstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.sql.Connection;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        repairBookForeignKeyIfNeeded("cart_items", "fk_cart_items_books");
        repairBookForeignKeyIfNeeded("order_items", "fk_order_items_books");
        if (bookRepository.count() > 0) {
            log.info("Skipping catalog seed because books already exist");
            return;
        }
        log.info("Seeding initial catalog data");
        seedCatalogData();
    }

    private void repairBookForeignKeyIfNeeded(String tableName, String expectedConstraintName) {
        if (!isMySql()) {
            return;
        }

        List<String> wrongConstraints = jdbcTemplate.queryForList("""
                SELECT CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = 'book_id'
                  AND REFERENCED_TABLE_NAME = 'book'
                """, String.class, tableName);

        for (String constraint : wrongConstraints) {
            log.info("Repairing {}.book_id FK: dropping {}", tableName, constraint);
            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY `" + constraint + "`");
        }

        Integer validConstraintCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = 'book_id'
                  AND REFERENCED_TABLE_NAME = 'books'
                """, Integer.class, tableName);

        if (validConstraintCount == null || validConstraintCount == 0) {
            log.info("Adding {}.book_id FK to books(id)", tableName);
            jdbcTemplate.execute("ALTER TABLE " + tableName +
                    " ADD CONSTRAINT " + expectedConstraintName +
                    " FOREIGN KEY (book_id) REFERENCES books(id)");
        }
    }

    private boolean isMySql() {
        if (jdbcTemplate.getDataSource() == null) {
            return false;
        }
        try (Connection connection = jdbcTemplate.getDataSource().getConnection()) {
            return connection.getMetaData().getDatabaseProductName().toLowerCase().contains("mysql");
        } catch (Exception ex) {
            log.warn("Unable to detect database product, using non-MySQL reset fallback", ex);
            return false;
        }
    }

    private void seedCatalogData() {
        Category fiction = categoryRepository.save(
                Category.builder().name("Fiction").build());
        Category programming = categoryRepository.save(
                Category.builder().name("Programming").build());
        Category fantasy = categoryRepository.save(
                Category.builder().name("Fantasy").build());
        Category dystopian = categoryRepository.save(
                Category.builder().name("Dystopian").build());
        Category sciFi = categoryRepository.save(
                Category.builder().name("Science Fiction").build());
        Category business = categoryRepository.save(
                Category.builder().name("Business").build());
        Category biography = categoryRepository.save(
                Category.builder().name("Biography").build());
        Category history = categoryRepository.save(
                Category.builder().name("History").build());
        Category romance = categoryRepository.save(
                Category.builder().name("Romance").build());

        Author rowling = authorRepository.save(
                Author.builder().name("J.K. Rowling").build());
        Author tolkien = authorRepository.save(
                Author.builder().name("J.R.R. Tolkien").build());
        Author austen = authorRepository.save(
                Author.builder().name("Jane Austen").build());
        Author fitzgerald = authorRepository.save(
                Author.builder().name("F. Scott Fitzgerald").build());
        Author orwell = authorRepository.save(
                Author.builder().name("George Orwell").build());
        Author huxley = authorRepository.save(
                Author.builder().name("Aldous Huxley").build());
        Author bloch = authorRepository.save(
                Author.builder().name("Joshua Bloch").build());
        Author walls = authorRepository.save(
                Author.builder().name("Jeannette Walls").build());
        Author knuth = authorRepository.save(
                Author.builder().name("Donald Knuth").build());
        Author duckett = authorRepository.save(
                Author.builder().name("Jon Duckett").build());
        Author clear = authorRepository.save(
                Author.builder().name("James Clear").build());
        Author isaacson = authorRepository.save(
                Author.builder().name("Walter Isaacson").build());
        Author sanderson = authorRepository.save(
                Author.builder().name("Brandon Sanderson").build());
        Author adams = authorRepository.save(
                Author.builder().name("Douglas Adams").build());
        Author martinFowler = authorRepository.save(
                Author.builder().name("Martin Fowler").build());
        Author cMartin = authorRepository.save(
                Author.builder().name("Robert C. Martin").build());
        Author erichGamma = authorRepository.save(
                Author.builder().name("Erich Gamma").build());
        Author andyWeir = authorRepository.save(
                Author.builder().name("Andy Weir").build());
        Author frankHerbert = authorRepository.save(
                Author.builder().name("Frank Herbert").build());
        Author ashleeVance = authorRepository.save(
                Author.builder().name("Ashlee Vance").build());
        Author calNewport = authorRepository.save(
                Author.builder().name("Cal Newport").build());
        Author ericRies = authorRepository.save(
                Author.builder().name("Eric Ries").build());
        Author peterThiel = authorRepository.save(
                Author.builder().name("Peter Thiel").build());
        Author harperLee = authorRepository.save(
                Author.builder().name("Harper Lee").build());
        Author yuval = authorRepository.save(
                Author.builder().name("Yuval Noah Harari").build());
        Author taraWestover = authorRepository.save(
                Author.builder().name("Tara Westover").build());
        Author michelleObama = authorRepository.save(
                Author.builder().name("Michelle Obama").build());
        Author anneFrank = authorRepository.save(
                Author.builder().name("Anne Frank").build());
        Author georgeClason = authorRepository.save(
                Author.builder().name("George S. Clason").build());
        Author napoleonHill = authorRepository.save(
                Author.builder().name("Napoleon Hill").build());
        Author dickens = authorRepository.save(
                Author.builder().name("Charles Dickens").build());

        bookRepository.saveAll(List.of(
                book("Harry Potter and the Sorcerer's Stone", "A young wizard discovers his destiny.", "19.99", 30, "book-01", rowling, fantasy),
                book("Harry Potter and the Chamber of Secrets", "Mystery unfolds at Hogwarts during second year.", "20.99", 28, "book-02", rowling, fantasy),
                book("The Hobbit", "Bilbo Baggins embarks on an unexpected quest.", "18.50", 22, "book-03", tolkien, fantasy),
                book("The Fellowship of the Ring", "The One Ring begins its long journey.", "21.00", 24, "book-04", tolkien, fantasy),
                book("The Two Towers", "The fellowship is broken but the quest continues.", "21.00", 24, "book-05", tolkien, fantasy),
                book("The Return of the King", "Final battle for Middle-earth.", "21.00", 24, "book-06", tolkien, fantasy),
                book("Pride and Prejudice", "Classic romance and social commentary.", "14.99", 35, "book-07", austen, romance),
                book("The Great Gatsby", "A portrait of ambition and illusion.", "13.99", 26, "book-08", fitzgerald, fiction),
                book("To Kill a Mockingbird", "Justice and empathy in the American South.", "15.99", 27, "book-09", harperLee, fiction),
                book("1984", "A chilling dystopian surveillance state.", "16.50", 20, "book-10", orwell, dystopian),
                book("Brave New World", "A futuristic society engineered for control.", "16.00", 20, "book-11", huxley, dystopian),
                book("Dune", "Epic science fiction of politics and prophecy.", "22.99", 18, "book-12", frankHerbert, sciFi),
                book("The Martian", "An astronaut fights to survive on Mars.", "19.50", 17, "book-13", andyWeir, sciFi),
                book("Project Hail Mary", "A lone mission to save humanity.", "23.99", 19, "book-14", andyWeir, sciFi),
                book("The Hitchhiker's Guide to the Galaxy", "Absurd and brilliant interstellar comedy.", "17.99", 21, "book-15", adams, sciFi),
                book("Clean Code", "Practical guide to writing maintainable code.", "29.99", 25, "book-16", cMartin, programming),
                book("Clean Architecture", "Principles for building long-lasting systems.", "31.99", 23, "book-17", cMartin, programming),
                book("Refactoring", "Improve existing code without changing behavior.", "34.99", 20, "book-18", martinFowler, programming),
                book("Effective Java", "Best practices for modern Java development.", "32.99", 22, "book-19", bloch, programming),
                book("Design Patterns", "Foundational object-oriented design patterns.", "33.50", 18, "book-20", erichGamma, programming),
                book("Atomic Habits", "Small habits that produce remarkable results.", "18.99", 32, "book-21", clear, business),
                book("Deep Work", "Focus strategies for high-value output.", "17.99", 31, "book-22", calNewport, business),
                book("The Lean Startup", "Validated learning for startups.", "20.99", 30, "book-23", ericRies, business),
                book("Zero to One", "Building companies that create new value.", "19.99", 30, "book-24", peterThiel, business),
                book("The Richest Man in Babylon", "Timeless lessons on personal finance.", "12.99", 34, "book-25", georgeClason, business),
                book("Think and Grow Rich", "Classic mindset and achievement principles.", "13.99", 33, "book-26", napoleonHill, business),
                book("Sapiens", "A brief history of humankind.", "24.99", 20, "book-27", yuval, history),
                book("Educated", "A memoir about resilience and learning.", "18.50", 22, "book-28", taraWestover, biography),
                book("Becoming", "Memoir of former First Lady Michelle Obama.", "21.50", 21, "book-29", michelleObama, biography),
                book("The Diary of a Young Girl", "Personal account of life during war.", "14.50", 25, "book-30", anneFrank, history),
                book("The Art of Computer Programming", "Comprehensive algorithms and programming analysis.", "89.99", 10, "book-31", knuth, programming),
                book("HTML and CSS: Design and Build Websites", "Visual guide to web fundamentals.", "25.99", 18, "book-32", duckett, programming),
                book("Mistborn: The Final Empire", "Heist-style fantasy with a unique magic system.", "18.99", 19, "book-33", sanderson, fantasy),
                book("Steve Jobs", "Biography of Apple's co-founder.", "22.99", 16, "book-34", isaacson, biography),
                book("Elon Musk", "Story of the entrepreneur behind Tesla and SpaceX.", "21.99", 16, "book-35", ashleeVance, biography),
                book("The Glass Castle", "Memoir of an unconventional upbringing.", "17.99", 15, "book-36", walls, biography),
                book("Animal Farm", "Political allegory on revolution and power.", "12.99", 28, "book-37", orwell, fiction),
                book("Fantastic Beasts and Where to Find Them", "Companion book from the wizarding world.", "16.99", 20, "book-38", rowling, fantasy),
                book("A Tale of Two Cities", "Historical novel set in London and Paris.", "13.99", 14, "book-39", dickens, fiction),
                book("Sense and Sensibility", "Austen's story of love, logic, and social pressure.", "14.25", 18, "book-40", austen, romance)
        ));
    }

    private Book book(String title,
                      String description,
                      String price,
                      int stock,
                      String imageSeed,
                      Author author,
                      Category category) {
        return Book.builder()
                .title(title)
                .description(description)
                .price(new BigDecimal(price))
                .stock(stock)
                .imageUrl("https://picsum.photos/seed/" + imageSeed + "/400/600")
                .author(author)
                .category(category)
                .build();
    }
}
