const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const Database = require('./database.js');
const { time } = require('console');

// Creating an database object
const database = new Database.Database();

const app = express();
const port = 10000;

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Set view engine as EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', async (req, res) => {
    time = new Date();
    console.log("GET /" + time);
    try {
        const data = await database.getData();
        res.render('index.ejs', { title: 'Domain Pinger', data: data });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
};

app.get('/ping', async (req, res) => {
    try {
        //await 1 second before pinging
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = await database.getData();
        const promises = data.map(element => {
            return database.updateLastPost(element.id)
                .then(() => fetchWithTimeout(element.value))
                .catch(err => console.error(err));
        });
        await Promise.all(promises);
        res.send("Ping all domains");
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

app.get('/id/:id', (req, res) => {
    database.getDataById(req.params.id).then(async data => {
        const response = await fetch(data.value);
        //console.log(response);
        const body = await getBody(response);
        res.send(body);
    }).catch(err => {
        res.send(err);
    });
});

app.post('/id/:id', (req, res) => {
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
    console.log(`Server listening at http://0.0.0.0:${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 1772 });

// wss.on('connection', ws => {
//     console.log('Client connected');
//     setInterval(() => {
//         database.getData().then(data => {
//             ws.send(JSON.stringify(data));
//         }).catch(err => {
//             console.error(err);
//         });
//     }, 1000);
// });

async function getBody(response){
    let body;
    if (response.headers.get('content-type').includes('application/json')) {
        body = await response.json();
    } else {
        body = await response.text();
    }
    return body;
}