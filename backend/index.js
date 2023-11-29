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

// Example read from json file
app.get('/read', (req, res) => {
    fs.readFile('public/turtle/files.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error while reading the file:', err);
            return;
        }
        try {
            const parsed = JSON.parse(data);
            res.send(parsed);
        } catch (err) {
            console.error('Error while parsing JSON data:', err);
        }
    })
})

// Example write to json file
app.get('/write', (req, res, next) => {
    fs.readFile('public/turtle/files.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error while reading the file:', err);
            res.send(err);
            return;
        }
        try {
            let parsed = JSON.parse(data);

            parsed.fileNames.push('test.ttl');

            let json = JSON.stringify(parsed);
            fs.writeFile('public/turtle/files.json', json, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error while writing to file:', err);
                    res.send(err);
                }
                res.send('Writing to file was succesfull!');
                ;
            } )

        } catch (err) {
            console.error('Error while parsing JSON data:', err);
            res.send(err);
        }
    })
})

app.post('/upload', (req, res) => {
    let body = req.body;
    let data = body.data.split(',')[1];
    let result = atob(data);
    console.log(body.name);
    console.log(result);
    res.send('Data Received succesfully');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})