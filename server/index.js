const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());


const { Pool } = require('pg');

const pgClient = new Pool({
    port: keys.pgPort,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    user: keys.pgUser
});


pgClient.on('error', () => console.log("Lost PG connection"));


pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => {
        console.log(err);
    })

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send('HI');
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.json(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
})

app.post('/values', (req, res) => {
    let index = req.body.index;

    if (index > 40) {
        return res.status(422).send('Index too high, max is 40');
    }

    redisClient.hset('values', index, 'Nothing yet!');

    redisPublisher.publish('insert', index);

    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({
        inserted: true
    });
})


app.listen(5000, err => {
    console.log("Listening");
})