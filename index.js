const express = require('express'),
  morgan = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Models = require('./models.js');
uuid = require('uuid')
fs = require('fs');

const Movies = Models.Movie;
const Users = Models.User;

//mongodb+srv://laciereddick14:Scarlet-14@cluster0.75vcdly.mongodb.net/moviedb?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


app.use(bodyParser.json());

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://my-awesome-site123.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));
let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const {
  check,
  validationResult
} = require('express-validator');

// create a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a'
})
// setup the logger
app.use(morgan('combined', {
  stream: accessLogStream
}));

app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
   async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({
        Username: req.body.Username
      }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => {
              res.status(201).json(user)
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Update: a user's info, by username

app.put("/users/:Username",
  //input validation here
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', {
    session: false
  }), 
  async (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }
    //condition to check that username in request matches username in request params
    if (req.user.username !== req.params.username) {
      return res.status(400).send('Permission denied.');
    }
    //condition ends, finds user and updates their info
    await Users.findOneAndUpdate({
          Username: req.params.username
        }, {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        }, {
          new: true
        } //this line makes sure the updated document is returned
      )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  });
// Add and delete a movie to a user's list of favorites

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
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async  (req, res) => { //
  await Users.findOneAndUpdate({ 
    Username: req.params.Username 
  }, {
      $pull: { FavoriteMovies: req.params.MovieID
      },
    },{
       new: true 
      })
      .then((updatedUser) => {
          res.status(200).json(updatedUser)
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
      });
});

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
app.get("/movies", async (_req, res) => {
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
app.get('/movies/:MovieID', passport.authenticate('jwt', { session: false }),  async (req, res) => { // Gets movie by ID
  await Movies.findOne({ _id: req.params.MovieID })
  .then((movies) => {
      res.status(201).json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
  });
});

// GET genres from movies
app.get("/movies/genre/:genreName", async (req, res) => {
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

app.get("/movies/director/:directorName", async (req, res) => {
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

app.get("/documentation", (_req, res) => {
  res.sendFile("public/documentation.html", {
    root: __dirname
  });
});

app.get("/secreturl", (_req, res) => {
  res.send("secret url");
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});