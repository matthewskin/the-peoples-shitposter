const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client();

const axios = require('axios').default;

const intervalChannels = {};

const bot_token = process.env.ENVIRONMENT === 'DEV' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

client.login(bot_token);

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	const channel = message.channel;

	if (isValidUser(message.author)) {
		if (message.content === '$ping') {
			switch (message.author.tag) {
				case process.env.MATT_TAG:
					channel.send('pong');
					break;
				case process.env.JESIKA_TAG:
					channel.send('No girls allowed.');
					break;
				case process.env.JARED_TAG:
					channel.send('poop');
					break;
				case process.env.NATHAN_TAG:
					channel.send('Wtf');
					break;
				case process.env.CHASE_TAG:
					channel.send('It\'s not gay if you\'re underway.');
					break;
				default:
					channel.send('What the fuck did you just fucking say about me, you little bitch? I\'ll have you know I graduated top of my class in the Navy Seals, and I\'ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I\'m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You\'re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that\'s just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little "clever" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn\'t, you didn\'t, and now you\'re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You\'re fucking dead, kiddo.');
			}
		}

		if (message.author.tag === process.env.NATHAN_TAG) {
			if (message.content.toLowerCase().includes('wtf')) {
				const wtf = require('./wtf.json').wtf;
				channel.send(wtf[Math.floor(Math.random() * wtf.length)]);
			}
		}

		if (message.content === '$ching') {
			channel.send('chong');
		}

		if (message.content === '$bing') {
			channel.send('bong');
		}

		if (message.content.includes('$weather')) {
			handleWeather(message);
		}

		if (message.content.includes('$conch')) {
			handleConch(message);
		}

		if (message.content === '$listen') {
			handleListen(message);
		}

		if (message.content === '$stop') {
			handleListenStop(message);
		}

		if (message.content === '$taylor') {
			handleTaylorQuote(message);
		}

		if (message.content === '$joke') {
			handleJoke(message);
		}

		if (message.content === '$pun') {
			handlePun(message);
		}
		
		if (message.content.toLowerCase().includes('$tendies')) {
			YOLOStatus(message);
		}
	}
});

function isValidUser(author) {
	return !author.bot;
}

function handleListen(message) {
	if (message.author.tag !== process.env.MATT_TAG) {
		message.channel.send('No.');
		return;
	}

	if (!intervalChannels[message.channel.id]) {
		intervalChannels[message.channel.id] = setInterval(() => {
			messageNathan(message.channel);
		}, 3000);
	}
}

function handleListenStop(message) {
	if (intervalChannels[message.channel.id]) {
		clearInterval(intervalChannels[message.channel.id]);
	}

	intervalChannels[message.channel.id] = null;
}

function messageNathan(channel) {
	const apiMessage = new Discord.APIMessage(channel, {
		content: '<@216453188847534081> Jarebear! Listen!',
		disableMentions: 'none',
	});
	channel.send(apiMessage);
}

async function handleWeather(message) {
	let query = message.content.replace('$weather', '');

	if (query.trim() === '') {
		switch (message.author.tag) {
			case process.env.MATT_TAG:
				query = 'chicago,il';
				break;
			case process.env.JESIKA_TAG:
				query = 'galesburg,il';
				break;
			case process.env.JARED_TAG:
				query = 'galesburg,il';
				break;
			case process.env.NATHAN_TAG:
				query = 'madison,wi';
				break;
			case process.env.CHASE_TAG:
				query = 'monterey,ca';
				break;
			case process.env.BAYLEIGH_TAG:
				query = 'colorado springs,co';
				break;
			case process.env.BEN_TAG:
				query = 'bartonville,il';
				break;
			default:
				query = '';
		}
	}

	const geocodeOptions = {
		method: 'GET',
		url: 'https://api.geocod.io/v1.6/geocode',
		params: { q: query, api_key: process.env.GEOCODIO_API_KEY, limit: 1 },
	};

	axios.request(geocodeOptions).then((geoRes) => {
		if (geoRes.status === 200 && geoRes.data.results.length > 0) {
			const location = geoRes.data.results[0].location;
			const city = geoRes.data.results[0].address_components.city;
			const state = geoRes.data.results[0].address_components.state;

			const options = {
				method: 'GET',
				url: 'https://community-open-weather-map.p.rapidapi.com/weather',
				params: { lat: location.lat, lon: location.lng, lang: 'en', units: 'imperial' },
				headers: {
					'x-rapidapi-key': process.env.WEATHER_API_KEY,
					'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
				},
			};

			axios.request(options).then((weatherRes) => {
				console.log(weatherRes.data.weather);
				switch (weatherRes.data.cod) {
					case 200:
						message.channel.send('It\'s ' + Math.round(weatherRes.data.main.temp) + '°F and ' + weatherRes.data.weather[0].description.toLowerCase() + ' in ' + (city ? city + ', ' : '') + state + ' mothafucka.');
						break;
					default:
						console.log(weatherRes);
						throw new Error('Unexpected response code.');
				}
			}).catch((error) => {
				message.channel.send('This shit\'s fuckin broken.');
				console.log(error);
			});
		}
		else {
			throw new Error('Invalid response from api');
		}
	}).catch((error) => {
		message.channel.send('Where the fuck??');
		console.log(error);
		return;
	});
}

async function handleConch(message) {
	const questionWords = [
		'am', 'are', 'is', 'isnt', 'was', 'wasnt', 'were', 'werent', 'has', 'hasnt', 'have', 'havent', 'do', 'does', 'dont', 'doesnt', 'did', 'didnt', 'can', 'cant', 'could', 'couldnt', 'will', 'wont', 'would', 'wouldnt', 'should', 'shouldnt', 'shall',
	];
	const responses = [
		'Maybe someday.', 'I don\'t think so.', 'No.', 'When hell freezes over.', 'Yes.', 'Absolutely.',
	];

	const question = message.content.replace('$conch', '').replace(/[^a-zA-Z\s:]/g, '').trim().toLowerCase().split(' ');

	if ((question.length >= 3) && questionWords.includes(question[0])) {
		// Random between 2 and 5 seconds
		const timeout = (Math.floor(Math.random() * (6 - 2)) + 2) * 1000;

		setTimeout(() => {
			message.channel.send(responses[Math.floor(Math.random() * responses.length)]);
		}, timeout);
	}
	else {
		message.channel.send('Ask a yes or no question.');
	}
}

async function handleTaylorQuote(message) {
	const options = {
		method: 'GET',
		url: 'https://api.taylor.rest/',
	};
	if(Math.floor(Math.random() * 1001) === 420) message.channel.send('“The victor will never be asked if he told the truth. ” - Taylor Swift?');
	else
	{
		axios.request(options).then((res) => {
			message.channel.send('"' + res.data.quote + '"' + ' - ' + res.data.author);
		}).catch((error) => {
			message.channel.send('"This bot sucks." - Taylor Swift');
			console.log(error);
		});
	}
}

async function handleJoke(message) {
	const options = {
		method: 'GET',
		url: 'https://v2.jokeapi.dev/joke/Dark',
	};

	axios.request(options).then((res) => {
		if (res.data.type === 'twopart') {
			message.channel.send(res.data.setup + '...');
			setTimeout(() => {
				message.channel.send(res.data.delivery);
			}, 5000);
		} else {
			setTimeout(() => {
				message.channel.send(res.data.joke);
			}, 2000);
		}
	}).catch((error) => {
		message.channel.send('The joke is that this API doesn\'t work.');
		console.log(error);
	});
}

async function handlePun(message) {
	const options = {
		method: 'GET',
		url: 'https://v2.jokeapi.dev/joke/Pun',
	};

	axios.request(options).then((res) => {
		if (res.data.type === 'twopart') {
			message.channel.send(res.data.setup + '...');
			setTimeout(() => {
				message.channel.send(res.data.delivery);
			}, 5000);
		} else {
			setTimeout(() => {
				message.channel.send(res.data.joke);
			}, 2000);
		}
	}).catch((error) => {
		message.channel.send('The joke is that this API doesn\'t work.');
		console.log(error);
	});
}
	async function YOLOStatus(message) {

		var companyName = message.content.substring(9);
		console.log(companyName);
		const options = {
			method: 'GET',
			url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete',
			params: {q: companyName, region: 'US'},
			headers: {
			  'x-rapidapi-key': '04bb91df96msha592e3d34f03a0fp16f797jsn2007a5707a51',
			  'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
			}
		  };
		  
		  axios.request(options).then(function (response) {
			console.log(response.data); 
			message.channel.send(response.data);
		  }).catch(function (error) {
			message.channel.send('Buggering Bears Buggered Bot');
			  console.error(error);
		  });
}