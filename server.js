'use strict';

// Application Dependencies

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const bp = require('body-parser')

// Application Setup

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// API endpoints

app.get('/api/v1/books', (req,res) => {
  client.query(`SELECT * FROM books;`)
    .then(result => res.send(result.rows))
    .catch(console.error);
})

app.get('/api/v1/books/:book_id', (req, res) => {
  client.query(
    `SELECT book_id, title, author, image_url, description FROM books
    WHERE book_id=$1;`, [req.params.book_id])
    .then(result => res.send(result.rows))
})

app.post('/api/v1/books', (req, res) => {
  client.query(
    `INSERT INTO books(title, author, image_url, isbn, description)
    VALUES($1, $2, $3, $4, $5)`,
    [ req.body.title,
      req.body.author,
      req.body.image_url,
      req.body.isbn,
      req.body.description],
    function(err) {if (err) console.error(err)}
  ).then(res.send('Insert complete'))
    .catch(console.error)
})

app.delete('/api/v1/books/:book_id', (request, response) => {
  client.query(
    `DELETE FROM books WHERE book_id=$1`, [request.params.book_id]
  )
    .then(() => response.send('Delete complete'))
    .catch(console.error);
});

app.put('/api/v1/books/:book_id', (request, response) => {
  client.query(
    `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5 WHERE book_id=$6;`, [
      request.body.title,
      request.body.author,
      request.body.isbn,
      request.body.image_url,
      request.body.description,
      request.params.book_id]
  )
  .then(() => {
    response.send('update complete')
  })
  .catch(err => {
    console.error(err);
  });
});

// This app.get will need a lot more fleshing out once the database is operational
app.get('*', (req, res) => res.redirect(CLIENT_URL));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));