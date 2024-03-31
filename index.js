const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const Database = require('./database.js');

// Creating an database object
const database = new Database.Database();

const app = express();
const port = 2210;

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'Domain Pinger' });
});

app.get('/:id', (req, res) => {
    database.getDataById(req.params.id).then(async data => {
        const response = await fetch(data.value);
        //console.log(response);
        let body;
        if (response.headers.get('content-type').includes('application/json')) {
            body = await response.json();
        } else {
            body = await response.text();
        }
        res.send(body);
    }).catch(err => {
        res.send(err);
    });
});

app.post('/:id', (req, res) => {
    const query = req.query;
    if (query.hasOwnProperty('type')) {
        if (query.type === 'update' && query.hasOwnProperty('value')){
            database.updateData(req.params.id, query.value).then(() => {
                res.send(`Updated ${req.params.id} with ${query.value}`);
            }).catch(err => {
                res.send(err);
            });
        }
        else if (query.type === 'delete'){
            database.deleteData(req.params.id).then(() => {
                res.send(`Deleted ${req.params.id}`);
            }).catch(err => {
                res.send(err);
            });
        }
        else if (query.type === 'get'){
            database.getDataById(req.params.id).then(data => {
                res.send(data);
            }).catch(err => {
                res.send(err);
            });
        }

        else if (query.type === 'insert' && query.hasOwnProperty('value')){
            database.insertData(req.params.id, query.value).then(() => {
                res.send(`Inserted ${req.params.id} with ${query.value}`);
            }).catch(err => {
                res.send(err);
            });
        }

        else{
            res.send(`Invalid query type: ${query.type}`);
        }
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 1772 });

wss.on('connection', ws => {
    console.log('Client connected');
    setInterval(() => {
        database.getData().then(data => {
            ws.send(JSON.stringify(data));
        }).catch(err => {
            console.error(err);
        });
    }, 1000);
});