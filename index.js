const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const mongodb = require('mongodb')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const dbUrl = 'mongodb+srv://rohit10231:rohitkaranpujari@cluster0.kjynvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(dbUrl)
const port = 5000

// getting All_Users information
app.get('/', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let users = await db.collection('All_Users').find().toArray()
        res.status(200).send(users)
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// creating new account
app.post('/signup', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let user = await db.collection('All_Users').findOne({ email: req.body.email })
        if (user.length === 0) {
            await db.collection('All_Users').insertOne(req.body)
            res.status(201).send({ message: 'New account created', data: req.body })
        }
        else {
            res.send({ message: 'Email Id already exist' })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// user login
app.get('/login/:email/:password', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let user = await db.collection('All_Users').findOne({ email: req.params.email, password: req.params.password })
        if (user.length !== 0) {
            res.status(200).send({ message: 'Login successful', data: user })
        }
        else {
            res.send({ message: "Invalid Credentials" })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// finding user for forgot password section
app.get('/getUser/:email', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let user = await db.collection('All_Users').findOne({ email: req.params.email })
        if (user) {
            res.status(200).send({ message: 'user found', data: user })
        }
        else {
            res.send({ message: "user not found" })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// chnage user password
app.put('/changePassword/:email', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let user = await db.collection('All_Users').findOne({ email: req.params.email })
        if (user.length !== 0) {
            let user = await db.collection('All_Users').updateOne({ email: req.params.email }, { $set: req.body })
            res.status(200).send({ message: 'Password changed' })
        }
        else {
            res.status(404).send({ message: "User Not Found" })
        }
    }
    catch (error) {
        res.status(400).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// storing random string
app.put('/storeRandomString/:email', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        // let user = await db.collection('All_Users').findOne({ email: req.params.email })
        // if (user) {
        let randomString = await db.collection('All_Users').updateOne({ email: req.params.email }, { $set: req.body })
        res.status(200).send({ message: 'Random string saved successfully', data: randomString })
        // }
        // else {
        //     res.status(404).send({ message: "User Not Found" })
        // }
    }
    catch (error) {
        res.status(400).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

app.listen(port, () => { console.log(`App listening on ${port}`) })