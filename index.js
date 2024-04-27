const express = require("express");
const bodyParser = require("body-parser");
uuid = require("uuid");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models");

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongoimport --uri mongodb+srv://laciereddick14:Scarlet14@moviedb.dcdfl.mongodb.net/mymoviedb --collection movies --type json --file ../exported_collections/movies.json", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// Middleware 

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const {
  check,
  validationResult
} = require('express-validator');
// CREATE: Handle POST request to add/Create a new user

/* We'll expect JSON in this format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
app.post("/users", [
  check('Username', 'Username is required').isLength({
    min: 7
  }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {

  //check validation object for errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    });
  }
  let hashPassword = Users.hashPassword(req.body.Password);
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
//UPDATE: Handle PUT request to update user information
/* We'll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date,
  FavoriteMovies: []
}
*/

app.put('/users/:Username', [
    //input validation
    check('Username', 'Username is required').isLength({
      min: 7
    }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', {
    session: false
  }), async (req, res) => {

    //check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    // condition to check username matches username in request params
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // condition ends, find user and update info
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

app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});