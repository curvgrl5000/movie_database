require('dotenv').config(); // the .config method reads the .env file each time you start the server 
const express = require('express');
const morgan =  require('morgan');
const cors = require('cors');
const helmet = require('helmet'); // hides info! https://github.com/helmetjs/helmet#how-it-works
const MOVIEDEX = require('./movies-data-small.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next){
 const authToken = req.get('Authorization');
 const apiToken = process.env.API_TOKEN;

	if( !authToken || authToken.split(' ')[1] !== apiToken){
		return res.status(401).json({ error: 'Sorry Unauthorized request'})
	}
	// if all works then move on to the next middleware
	next();
});

function handleGetMovies(req, res){
	let response =  MOVIEDEX;
	const { film_title, genre, country, avg_vote } = req.query;

	if(film_title) {
		response = response.filter( movie => 
			movie.film_title.toLowerCase().includes( film_title.toLowerCase() )
		)
	}

	if(genre) {
		response = response.filter( movie => 
			movie.genre.toLowerCase().includes( genre.toLowerCase() )
		)
	}

	if(country) {
		response = response.filter( movie => 
			movie.country.toLowerCase().includes( country.toLowerCase() )
		)
	}

	if(avg_vote) {
		response = response.filter( movie => 
			movie.avg_votes === Number( avg_vote)
    )
	}

  if(response.length === 0) {
   	 res.status(200).send('We didn\'t find your flicks!');
  }
	res.json(response);	

}

app.get('/movie', handleGetMovies);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`)
});
