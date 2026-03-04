const fetch = require('node-fetch');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function proxyTMDB(path, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'TMDB API key is not configured on the server.' });
    }

    const separator = path.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${path}${separator}api_key=${apiKey}&language=en-US`;

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('TMDB request failed', response.status, response.statusText, text);
      return res
        .status(response.status)
        .json({ message: 'Failed to fetch data from TMDB.' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('TMDB proxy error', err);
    return res.status(500).json({ message: 'An error occurred while talking to TMDB.' });
  }
}

async function getTrending(req, res) {
  return proxyTMDB('/trending/all/week', res);
}

async function getTopRated(req, res) {
  return proxyTMDB('/movie/top_rated', res);
}

async function getActionMovies(req, res) {
  return proxyTMDB('/discover/movie?with_genres=28', res);
}

async function getComedyMovies(req, res) {
  return proxyTMDB('/discover/movie?with_genres=35', res);
}

module.exports = {
  getTrending,
  getTopRated,
  getActionMovies,
  getComedyMovies,
};

