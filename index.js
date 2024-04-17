const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/cf_movies", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware 

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//CREATE: Add a user

app.post("/users", async (req, res) => {
  await Users.findOne({
      Username: req.body.Username
    })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
          .then((user) => {
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

app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate({
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

app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate({
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

app.delete("/users/:id/:movieTitle", (req, res) => {
  const {
    id,
    movieTitle
  } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favMovies = user.favMovies.filter((title) => title !== movieTitle);
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("User not found");
  }
});

//delete user

app.delete("/users/:Username", (req, res) => {
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
  res.send("Top Tem");
});

// Get all users

app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username

app.get("/users/:Username", async (req, res) => {
  await Users.findOne({
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

app.get("/movies", async (req, res) => {
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

app.get("/movies/:Title", async (req, res) => {
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

app.get("/movies/genres/:genreName", async (req, res) => {
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

app.get("/movies/directors/:directorName", async (req, res) => {
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