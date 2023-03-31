const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

// Home route should redirect to the /books route.
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

// Shows the full list of books.
router.get('/books', async (req, res, next) => {
  try {
    const books = await Book.findAll({ order: [['title', 'ASC']] });
    res.render('index', {
      title: 'Books',
      books
    });
  } catch (err) {
    next(err);
  }
});

// Shows the create new book form.
router.get('/books/new', (req, res, next) => {
  res.render('new-book', { title: 'New Book' });
});

// Posts a new book to the database
router.post('/books/new', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.redirect('/books');
  } catch (err) {
    // Handles validation errors and displays them to the user in the new-book view
    if (err.name === 'SequelizeValidationError') {
      res.render('new-book', {
        title: 'New Book',
        book: Book.build(req.body),
        errors: err.errors
      });
    } else {
      throw err;
    }
  }
});

// Shows book detail form.
router.get('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('update-book', { title: 'Update Book', book });
    } else {
      const err = new Error('Book Not Found');
      err.status = 404;
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

// Updates book info in the database.
router.post('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      const err = new Error('Book Not Found');
      err.status = 404;
      next(err);
    }
  } catch (err) {
    // Handles validation errors and displays them to the user in the update-book view
    if (err.name === 'SequelizeValidationError') {
      const book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', {
        title: 'Update Book',
        book,
        errors: err.errors
      });
    } else {
      throw err;
    }
  }
});

// Deletes a book.
router.post('/books/:id/delete', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect('/books');
    } else {
      const err = new Error('Book Not Found');
      err.status = 404;
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
