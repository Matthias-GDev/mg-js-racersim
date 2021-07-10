// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	tracks:{},
	player_id: undefined,
	players:{},
	race_id: undefined,
}

const updateStore = (newstore) => {

	store = {
		...store,
		...newstore
	}

	return store
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log('Problem getting tracks and racers ::', error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event
		const trackId = target.getAttribute('rcid');
		const driverId = target.getAttribute('driverid');

		// Race track form field
		if(trackId && trackId>0 && trackId<=6){
			handleSelectTrack(trackId)
		}

		// Podracer form field
		if(driverId && driverId>0 && driverId<=6){
			handleSelectPodRacer(driverId)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log('an error shouldn\'t be possible here')
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView(store.tracks[store.track_id-1],store.players))

	// TODO - Get player_id and track_id from the store
	const player_id = store.player_id
	const trackid = store.track_id

	// const race = TODO - invoke the API call to create the race, then save the result
	try
	{
		// TODO - update the store with the race id
		const newRace = await createRace(player_id,trackid)
		const raceId = newRace.ID-1
		//const raceId = newRace.ID

		updateStore({
			race_id: parseInt(raceId)
		});

		// The race has been created, now start the countdown
		// TODO - call the async function runCountdown
		await runCountdown()

		// TODO - call the async function startRace
		await startRace(raceId)

		// TODO - call the async function runRace
		await runRace(raceId)

		
	}catch(error){
		console.log('Error creating new race')
		console.log(error)
	}
}

function runRace(raceID) {
	return new Promise(resolve => {
		// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const runRaceIntervalId = setInterval(async () => {
			await getRace(raceID)
				.then((res) => {
				/* 
					TODO - if the race info statuss property is "in-progress", update the leaderboard by calling:
					renderAt('#leaderBoard', raceProgress(res.positions))
				*/
				if (res.status === 'in-progress') {
             		renderAt('#leaderBoard', raceProgress(res.positions));
				}
				
				//TODO - if the race info status property is "finished", run the following:
				/* 
					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					reslove(res) // resolve the promise
				*/
				if (res.status === 'finished') {
					clearInterval(runRaceIntervalId);
					renderAt('#race', resultsView(res.positions));
					resolve();
				}
			})
			.catch((error) => {
				console.log('error: ' + error)
			})
		},500)
	})
	// remember to add error handling for the Promise
	.catch(error => {
		console.log('Error running the race.')
		console.log(error)
	})
	
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const intervalId = setInterval(() => {

				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer

				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if(timer===0){
					clearInterval(intervalId)
					resolve()
					return;
				}

			},1000)
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(driverId) {
	console.log('selected a pod', driverId)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .racerselected')
	if(selected) {
		selected.classList.remove('racerselected')
	}

	// add class selected to current target
	const targetCard = document.getElementById('racercard'+driverId)
	targetCard.classList.add('racerselected')

	// TODO - save the selected racer to the store
	updateStore({
		player_id: parseInt(driverId)
	});
}

function handleSelectTrack(trackId) {
	console.log('selected a track', trackId)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	const targetCard = document.getElementById('trackcard'+trackId)
	targetCard.classList.add('selected')

	// TODO - save the selected track id to the store
	updateStore({
		track_id: parseInt(trackId)
	});
	
}

function handleAccelerate() {
	console.log('accelerate button clicked')
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
	<div class='row'>
		${results}
	</div>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	const imgName=driver_name.toLowerCase();

	return `
		<div class='col' id='racer${id}'>
			<div id='racercard${id}' class='card' style='width: 11rem;min-height:12rem;margin:5px;'>
				<img driverid='${id}' src='assets/images/${imgName}.jpg' class='card-img-top' alt='${name}'>
				<div driverid='${id}' class='card-body'>
					<p driverid='${id}' class='card-text' '><b>${driver_name}</b></p>
					<p driverid='${id}' class='card-text' '>Speed: ${top_speed}</p>
					<p driverid='${id}' class='card-text' '>Acceleration: ${acceleration}</p>
					<p driverid='${id}' class='card-text' '>Handeling: ${handling}</p>
				</div>
			</div>
		</div>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
	<div class='row'>
		${results}
	</div>
	`
}

const translateTrackName = (trackname) =>{
	
	trackname = trackname.replace(' ','').toLowerCase()

	switch(trackname){
		case 'track1': return 'Water'
		case 'track2': return 'Stone'
		case 'track3': return 'Canyon'
		case 'track4': return 'Hay'
		case 'track5': return 'Mountain'
		case 'track6': return 'Stick'
	}
}

function renderTrackCard(track) {
	const { id, name } = track
	const imgName=name.replace(' ','').toLowerCase();
	const newTrackName = translateTrackName(name)

	return `
		<div class='col' id='${id}'>
			<div id='trackcard${id}' rcid='${id}' class='card' style='width: 11rem;min-height:12rem;margin:5px;'>
				<img id='trackc-img${id}' rcid='${id}' src='assets/images/${imgName}.jpg' class='card-img-top' alt='${name}'>
				<div id='trackc-body${id}' rcid='${id}' class='card-body'>
					<p id='trackc-text${id}' rcid='${id}' class='card-text'>${newTrackName}</p>
				</div>
			</div>
		</div>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id='big-numbers'>${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${translateTrackName(track.name)}</h1>
		</header>
		
		<main id='two-columns'>
			<section id='leaderBoard'>
				${renderCountdown(3)}
			</section>

			<section id='accelerate'>
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id='gas-peddle'><span style='color:white;font-size:1.5rem;'>Click Me To Win!</span></button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a class='btn btn-primary' href='/race'>Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += ' (you)'

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		const newName = changePlayerName(p.driver_name);
		if(newName.includes('(you)')){
			return `
			<tr>
				<td>
					<h3 style='color:red'>${count++} - ${newName}</h3>
					<img src='assets/images/${newName.replace(' (you)','')}.jpg' alt='name' />
				</td>
			</tr>
			`
		}
		else
		{
			return `
			<tr>
				<td>
					<h3>${count++} - ${newName}</h3>
					<img src='assets/images/${newName}.jpg' alt='name' />
				</td>
			</tr>
			`
		}
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id='leaderBoard'>
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)
	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------
const SERVER = 'http://localhost:8000'
function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`,{
		...defaultFetchOpts(),
		method:'GET',
		dataType:'json',
	})
	.then((response) => {
		return response.json()
	})
	.then((data) => {
		updateStore({
			tracks: data
		});

		return data
	})
	.catch(error => {
		console.log('Error - getting Tracks from Server')
		console.log(error)
	})
}

const changePlayerName = (name) => {

	let oldname=name.replace(' ','').toLowerCase()
	let namewithyou=false

	if(oldname.includes('(you)')){
		oldname = oldname.replace('(you)','').replace(' ','')
		namewithyou=true
	}

	switch(oldname){
		case 'racer1': oldname='Jay';break;
		case 'racer2': oldname='Pie';break;
		case 'racer3': oldname='Tom';break;
		case 'racer4': oldname='Sara';break;
		case 'racer5': oldname='Storm';break;
		default: oldname='affe'
	}

	if(namewithyou)
	{
		oldname = oldname+' (you)'
	}

	return oldname
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`,{
		...defaultFetchOpts(),
		method:'GET',
		dataType:'json',
	})
	.then((response) => {
		return response.json()
	})
	.then((data) =>{
		data.map(item => {
			item.driver_name = changePlayerName(item.driver_name)
		})
		return data
	})
	.then((data) => {
		updateStore({
			players: data
		});

		return data
	})
	.catch(error => {
		console.log('Error - getting Racers from Server')
		console.log(error)
	})
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log('Problem with createRace request:'+ err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		dataType:'json',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log('Problem with getRace request:'+err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res)
	.catch(err => console.log('Problem with getRace request:'+err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	}).catch((error) => {
		console.log('Error while accelerating')
		console.log(error)
	})
}
