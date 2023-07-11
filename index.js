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

const nodemailer = require('nodemailer')

// getting all users information
app.get('/', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let users = await db.collection('All_Users').find().toArray()
        if (users.length !== 0) {
            res.status(200).send(users)
        }
        else {
            res.send({ message: 'No users found' })
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

// creating new account
app.post('/signup', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Password_Reset_Flow')
        let user = await db.collection('All_Users').aggregate([{ $match: { email: req.body.email } }]).toArray()
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
        let user = await db.collection('All_Users').aggregate([{ $match: { email: req.params.email, password: req.params.password } }]).toArray()
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
        let user = await db.collection('All_Users').aggregate([{ $match: { email: req.params.email } }]).toArray()
        if (user.length !== 0) {
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
        let user = await db.collection('All_Users').aggregate([{ $match: { email: req.params.email } }]).toArray()
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
        let randomString = await db.collection('All_Users').updateOne({ email: req.params.email }, { $set: req.body })
        res.status(200).send({ message: 'Random string saved successfully', data: randomString })
    }
    catch (error) {
        res.status(400).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// send email
app.post('/sendEmail', async (req, res) => {
    const emailInfo={
        text:`You password reset code: ${req.body.verificationRandomString}`,
        userEmail:req.body.userEmail
    }
    // let config = {
    //     service: "gmail",
    //     auth: {
    //         user: 'rpujari1144@gmail.com',
    //         pass: 'roaklhqwpybvxjzi'
    //     }
    // }
    const transporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'rpujari1144@gmail.com',
            pass: 'roaklhqwpybvxjzi'
        }
    });

    let info = await transporter.sendMail({
        from: '"Password Reset Flow Team" <password.reset@gmail.com>', // sender address
        to:emailInfo.userEmail, // list of receivers
        subject: "Password Reset Code", // Subject line
        text: emailInfo.text, // plain text body
        html: `<b>${emailInfo.text}</b><br/><b>${emailInfo.text}</b><br/><b>Valid for 5 minutes</b>`, // html body
    })

    console.log("Message sent: %s", info.messageId);
    res.json(info)
})

app.listen(port, () => { console.log(`App listening on ${port}`) })
