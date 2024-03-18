const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');
const app = express();

let movies = [
  {
  'id': '1',
  'title': 'The Godfather',
  'director': 'Francis Ford Coppola',
  'releaseYear': '1972',
  'genre': 'drama',
  'phase': '1'
}, 
{
  'id': '2',
  'title': 'The Godfather Part II',
  'director': 'Francis Ford Coppola',
  'releaseYear': '1974',
  'genre': 'drama',
  'phase': '1'
}, 
{
  'id': '3',
  'title': 'Shawshank Redemption',
  'director': 'Frank Darabont',
  'releaseYear': '1994',
  'genre': 'drama',
  'phase': '1'
}, 
{
  'id': '4',
  'title': 'Dark Knight',
  'director': 'Christopher Nolan',
  'releaseYear': '2008',
  'genre': 'action',
  'phase': '1'
}, 
{
  'id': '5',
  'title': '12 Angry Men',
  'director': 'Sidney Lumet',
  'releaseYear': '1957',
  'genre': 'action',
  'phase': '1'
}, 
{
  'id': '6',
  'title': 'Pulp Fiction',
  'director': 'Quentin Tarantino',
  'releaseYear': '1994',
  'genre': 'action',
  'phase': '1'
}, 
{
  'id': '7',
  'title': 'The Lord of the Rings: The Fellowship of the Ring',
  'director': 'Peter Jackson',
  'releaseYear': '2001',
  'genre': 'Fantasy',
  'phase': '2'
}, 
{
  'id': '8',
  'title': 'The Lord of the Rings: The Return of the King',
  'director': 'Peter Jackson',
  'releaseYear': '2003',
  'genre': 'Fantasy',
  'phase': '2'
}, 
]

const log = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

app.listen(8080, () => {
  console.log('Server listening on port 8080.');
  app.get('/movies', (req, res) => {
    res.json(movies);
    res.status(200).send('Movies array');
  });
  
  app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movie) => {
      return movie.title === req.params.title;
    }));
  });
 
  app.get('/movies/id/:id', (req, res) => {
    res.json(movies.filter((movie) => {
      return movie.id === req.params.id;
    }));
  });
  
  app.get('/movies/genres/:genre', (req, res) => {
    res.json(movies.filter((movie) => {
      return movie.genre === req.params.genre;
    }));
  });
  
  app.get('/movies/releaseYear/:releaseYear', (req, res) => {
    res.json(movies.filter((movie) => {
      return movie.releaseYear === req.params.releaseYear;
    }));
  });
  
  app.get('/movies/phases/:phase', (req, res) => {
    res.json(movies.filter((movie) => {
      return movie.phase === req.params.phase;
    }));
  });
 
  app.get('/movies/directors/:director', (req, res) => {
    res.json(movies.filter((movie) => {
      return movie.director === req.params.director;
    }));
  });
  
  app.use(morgan('combined', {
    stream: log
  }));
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", {
      root: __dirname
    });
  });
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
  });
});
