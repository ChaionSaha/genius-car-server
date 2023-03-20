const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3q6inbg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const verifyJWT = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: 'unauthorized access' });
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.status(403).send({ message: 'forbidden' });
		req.decoded = decoded;
		next();
	});
};

async function run() {
	try {
		await client.connect();
		const serviceCollection = client.db('geniusCar').collection('services');
		const orderCollection = client.db('geniusCar').collection('orders');

		app.post('/login', async (req, res) => {
			const user = req.body;
			const accessToken = await jwt.sign(
				user,
				process.env.ACCESS_TOKEN_SECRET,
				{
					expiresIn: '1d',
				}
			);

			res.send(accessToken);
		});

		////////////////////////////////////
		// Services Section
		app.get('/services', async (req, res) => {
			const query = {};
			const cursor = serviceCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});

		app.get('/service/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const services = await serviceCollection.findOne(query);
			res.send(services);
		});

		app.post('/service', async (req, res) => {
			const service = req.body;
			const result = await serviceCollection.insertOne(service);

			res.send(result);
		});

		app.delete('/service/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await serviceCollection.deleteOne(query);
			res.send(result);
		});

		///////////////////////////////////////////////////
		// Orders section

		app.post('/order', async (req, res) => {
			const order = req.body;
			const result = await orderCollection.insertOne(order);
			res.send(result);
		});

		app.get('/orders', verifyJWT, async (req, res) => {
			const decodedEmail = req.decoded.email;
			const email = req.query.email;
			if (email !== decodedEmail)
				return res.status(403).send({ message: 'forbidden access' });
			const query = { email: email };
			const cursor = orderCollection.find(query);
			const orders = await cursor.toArray();
			res.send(orders);
		});
	} finally {
	}
}

run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Server is running');
});

app.listen(port, () => {
	console.log(`server is running at port ${port}`);
});
