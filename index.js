const express = require('express');
const cors = require('cors');
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

async function run() {
	try {
		await client.connect();
		const serviceCollection = client.db('geniusCar').collection('services');
		const orderCollection = client.db('geniusCar').collection('orders');

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

		app.get('/orders', async (req, res) => {
			const email = req.query.email;
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
