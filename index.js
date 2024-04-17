const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
<<<<<<< HEAD
const mongoose = require("mongoose");
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/cf_movies", {
=======
const morgan = require ("morgan");
const mongoose = require("mongoose");
const Models = require("./models");


const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/moviedb", {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Middleware 

<<<<<<< HEAD
// Middleware 

=======
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//CREATE: Add a user

<<<<<<< HEAD
app.post("/users", async (req, res) => {
  await Users.findOne({
=======
app.post("/user", async (req, res) => {
  await User.findOne({
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
      Username: req.body.Username
    })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
<<<<<<< HEAD
        Users.create({
=======
        User.create({
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
<<<<<<< HEAD
          .then((user) => {
=======
          .then((Users) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Update: a user's info, by username

<<<<<<< HEAD
app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate({
=======
app.put("/user/:Username", async (req, res) => {
  await User.findOneAndUpdate({
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
      Username: req.params.Username
    }, {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    }, {
      new: true
    }) // ensures updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie to a user's list of favorites

<<<<<<< HEAD
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate({
=======
app.post("/user/:Username/movie/:MovieID", async (req, res) => {
  await User.findOneAndUpdate({
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
      Username: req.params.Username
    }, {
      $push: {
        FavoriteMovies: req.params.MovieID
      },
    }, {
      new: true
    }) // Ensures updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//delete a movie from favorites

<<<<<<< HEAD
app.delete("/users/:id/:movieTitle", (req, res) => {
=======
app.delete("/user/:id/:movieTitle", (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  const {
    id,
    movieTitle
  } = req.params;

<<<<<<< HEAD
  let user = users.find((user) => user.id == id);

  if (user) {
    user.favMovies = user.favMovies.filter((title) => title !== movieTitle);
=======
  let user = user.find((usesr) => user.id == id);

  if (user) {
    user.favMovies = users.favMovies.filter((title) => title !== movieTitle);
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("User not found");
  }
});

//delete user

<<<<<<< HEAD
app.delete("/users/:Username", (req, res) => {
=======
app.delete("/user/:Username", (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  Users.findOneAndRemove({
      Username: req.params.userName
    })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.userName + " was not found");
      } else {
        res.status(200).send(req.params.userName + " was deleted");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ

app.get("/", (req, res) => {
<<<<<<< HEAD
  res.send("Top Tem");
=======
  res.send("Welcome to MyFlix");
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
});

// Get all users

<<<<<<< HEAD
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
=======
app.get("/user", async (req, res) => {
  await User.find()
    .then((user) => {
      res.status(201).json(user);
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username

<<<<<<< HEAD
app.get("/users/:Username", async (req, res) => {
  await Users.findOne({
=======
app.get("/user/:Username", async (req, res) => {
  await User.findOne({
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
      Username: req.params.Username
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get movies

<<<<<<< HEAD
app.get("/movies", async (req, res) => {
=======
app.get("/movie", async (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// get by title

<<<<<<< HEAD
app.get("/movies/:Title", async (req, res) => {
=======
app.get("/movie/:Title", async (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  await Movies.findOne({
      Title: req.params.Title
    })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get genre

<<<<<<< HEAD
app.get("/movies/genres/:genreName", async (req, res) => {
=======
app.get("/movie/genre/:genreName", async (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  await Movies.findOne({
      "Genre.Name": req.params.genreName
    })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get director

<<<<<<< HEAD
app.get("/movies/directors/:directorName", async (req, res) => {
=======
app.get("/movie/director/:directorName", async (req, res) => {
>>>>>>> 0442b738861bbd18ea78fe896dde3ea00a6b1b55
  await Movies.findOne({
      "Director.Name": req.params.directorName
    })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", {
    root: __dirname
  });
});

app.get("/secreturl", (req, res) => {
  res.send("This is a secret URL with super top-secret content.");
});

// Listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});