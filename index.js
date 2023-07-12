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
            res.send({ message: "User Not Found" })
        }
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
    var verificationString
    randomStringGenerator()
    async function randomStringGenerator() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        function generateString(length) {
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        verificationString = await generateString(10);

        const emailInfo = {
            text: `You password reset code: ${verificationString}`
        }
        const transporter = await nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'rpujari1144@gmail.com',
                pass: 'roaklhqwpybvxjzi'
            }
        });

        let info = await transporter.sendMail({
            from: '"Password Reset Flow Team" <password.reset@gmail.com>', // sender address
            to: req.body.userEmail, // list of receivers
            subject: "Password Reset Code", // Subject line
            // text: `You password reset code: ${verificationString}`, // plain text body
            html: `<b>${emailInfo.text}</b><br/><b>Valid for 5 minutes</b>`, // html body
        })

        console.log("Message sent: %s", info.messageId);
        res.json(info)

        const client = await MongoClient.connect(dbUrl)
        try {
            const db = await client.db('Password_Reset_Flow')
            const passwordResetString = {
                randomString: verificationString
            }
            let randomString = await db.collection('All_Users').updateOne({ email: req.body.userEmail }, { $set: passwordResetString })
            res.status(200).send({ message: 'Random string saved successfully', data: randomString })
        }
        catch (error) {
            res.status(400).send({ message: 'Internal server error', error })
        }
        finally {
            client.close()
        }
    }


})

app.listen(port, () => { console.log(`App listening on ${port}`) })
