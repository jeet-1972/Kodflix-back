const express = require('express');
const {
  getTrending,
  getTopRated,
  getActionMovies,
  getComedyMovies,
} = require('../controllers/tmdbController');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/top-rated', getTopRated);
router.get('/action', getActionMovies);
router.get('/comedy', getComedyMovies);

module.exports = router;

