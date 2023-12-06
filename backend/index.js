const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post('/upload', (req, res) => {
    let body = req.body;
    let data = body.data.split(',')[1];
    let result = atob(data);

    fs.writeFile('public/turtle/' + body.name, result, 'utf8', (err, data) => {
        if (err) {
            console.error('Error while writing to file:', err);
            res.send(err);
        }
        res.send('Data written succesfully');
        ;
    } )
})

app.post('/upload2', (req, res) => {
    // Do nothing really ...
    res.send('Data received succesfully again');
})

app.get('/files', (req, res) => {
    fs.readdir('public/turtle', (err, response) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        let data = {fileNames: response};
        res.send(data);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})