const express = require("express");
const app = express();
const bodyParser = require("body-parser");
uuid = require("uuid");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/moviedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Middleware 

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.post("/users", async (req, res) => {
  await Users.findOne({
      Username: req.body.Username
    })
    .then((users) => {
      if (users) {
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

app.put('/users/:Username', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  await Users.findOneAndUpdate({
      Username: req.params.Username
    }, {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    }, {
      new: true
    }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ` + err);
    })

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
app.delete("/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", {
    session: false
  }),
  async (req, res) => {
    await Users.findOneAndUpdate({
        UserName: req.params.username
      }, {
        $pull: {
          FavoriteMovies: req.params.MovieID
        },
      }, {
        new: true
      })
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete a user by username
app.delete("/users/:Username", passport.authenticate("jwt", {
    session: false
  }),
  async (req, res) => {
    Users.findOneAndDelete({
        Username: req.params.Username
      })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//READ

app.get("/", (req, res) => {
  res.send("Welcome to MyFlix");
});

// Get all users
app.get('/users', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
  await Users.findOne({
      Username: req.params.Username
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get movies
app.get('/movies', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// get by title

app.get("/movies/:Title", passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
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

// GET genres from movies
app.get("/movies/genre/:genreName", passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
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

app.get("/movies/director/:directorName", passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
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