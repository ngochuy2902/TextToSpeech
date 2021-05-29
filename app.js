const express = require('express');
const fetch = require('node-fetch')
const path = require('path')
const gTTS = require('gtts')
const port = 3001;
const bodyParser = require('body-parser');
const app = express();
const BASE_AUDIO_PATH = "./public/audio/"

app.use(express.static(path.join(__dirname, 'public')))

// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.get('/', (request, response) => {
    response.send({
        message: 'Node.js and Express REST API'
    }
    );
});

app.post('/crawler', (request, response) => {
    response.send({
        message: 'Creating audio'
    });
    uuid = request.body.uuid;
    text = request.body.text;
    createAudio(uuid, text);
});

// Start the server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);

    console.log(`Server listening on port ${server.address().port}`);
});


function createAudio(uuid, text) {
    var gtts = new gTTS(text, 'vi');
    var path = BASE_AUDIO_PATH + uuid + ".mp3"
    gtts.save(path, function (err, result) {
        let msg;
        if (err) {
            msg = {"uuid": uuid, "status": "AUDIO_CRAWLING_FAILED"}
            throw new Error(err) 
        } else {
            msg = {"uuid": uuid, "status": "AUDIO_CRAWLING_SUCCESS"}
        }
        sendResult(msg);
        console.log('Created successfully: ' + uuid);
    });
}


function sendResult(message) {
    fetch('http://localhost:8080/api/internal/crawler/audio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
    })
        .then(response => {
            if (response.status != 200) {
                console.log('Request error code ' + response.status);
                return;
            }
        })
        .catch(err => {
            console.log('Error: ', err)
        });
}