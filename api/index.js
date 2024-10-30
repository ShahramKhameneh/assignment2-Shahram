// Import the Express module
var express = require('express');

// Import the path module for handling and transforming file paths
var path = require('path');
// index.js
// Create an instance of an Express application
var app = express();

// Import the express-handlebars module to set up Handlebars as the template engine
const exphbs = require('express-handlebars');

// Define the port on which the server will listen
const port = process.env.PORT || 3000;

// Set up a static file directory at 'public' for serving static assets like CSS.
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load JSON data
const jsonData = require('./movieData.json'); // Use the correct relative path

// Configure Handlebars with custom helpers
app.engine('hbs', exphbs({
  extname: '.hbs',
  helpers: {
    hasWebsite: function(website) {
      return website && website.trim() !== 'N/A'; // Checks if Website has content
    },
    highlightRow: function(website) {
      return !website || website.trim() === '' || website === 'N/A'; // Highlights rows with blank or N/A Website
    },
    not: function(value) {
      return !value; // Negates the value
    },
    or: function(value1, value2) {
      return value1 || value2; // Returns true if either value1 or value2 is true
    },
    and: function(value1, value2) {
      return value1 && value2; // Returns true only if both values are true
    }
  }
}));

// Set 'hbs' as the default view engine for rendering .hbs files in the views folder
app.set('view engine', 'hbs');

// Define the root route ('/') and render 'index.hbs' 
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//******Step6*********

// Search by ID (GET request to render the form)
app.get('/data', (req, res) => {
  res.render('data', { title: 'Data Loaded', jsonData });
});

// Search by ID (POST request to handle form submission)
app.get('/data/search/id', (req, res) => {
  const movieId = parseInt(req.query.movieId, 10); // Convert movieId to integer
  console.log('Searching for Movie ID:', movieId);

  const movie = jsonData.find(item => item.Movie_ID === movieId); // Compare as integer
  console.log('Movie found:', movie);

  if (movie) {
      res.render('searchById', { title: 'Search by ID', movie });
  } else {
      res.render('searchById', { title: 'Search by ID', error: 'Movie not found' });
  }
});
app.get('/data/search/title', (req, res) => {
  // Extract and normalize movieTitle from query parameter
  const movieTitle = req.query.movieTitle ? req.query.movieTitle.toLowerCase() : '';
 

  // Search for movies with partial match (case-insensitive)
  const movies = jsonData.filter(item => item.Title.toLowerCase().includes(movieTitle));
 
  // Render results based on search outcome
  if (movies.length > 0) {
      res.render('searchByTitle', { title: 'Search by Title', movies });
  } else {
      res.render('searchByTitle', { title: 'Search by Title', error: 'No movies found' });
  }
});



//**********Step7 ********
// Route to show all records, without filtering or highlighting
app.get('/viewData', (req, res) => {
  res.render('viewData', { title: 'All Sales Info', movies: jsonData, filter: false, highlight: false });
});

//**********Step8 ********

// Route to show only records with non-blank Website
app.get('/filteredData', (req, res) => {
  const filteredMovies = jsonData.filter(movie => movie.Website && movie.Website.trim() !== '' && movie.Website.trim() !== 'N/A');
  res.render('viewData', { title: 'Filtered Sales Info', movies: filteredMovies, filter: true, highlight: false });
});
//**********Step9 ********
// Route to show all records and highlight rows with blank or "N/A" Website
app.get('/highlightData', (req, res) => {
  res.render('viewData', { title: 'Highlighted Sales Info', movies: jsonData, filter: false, highlight: true });
});




// Define a '/users' route that responds with plain text
app.get('/users', function(req, res) {

  res.send('respond with a resource');
});

// Error handling for non-existent routes
app.use((req, res) => {
  res.status(404).render('error', { title: 'Error', message: 'Page Not Found' });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
