import express, { Express, Response, Request } from "express";
import amqp from "amqplib";

const app: Express = express();

const PORT = 3001;

app.use(express.json());

var channel: any;
let connection;

const exchange_name = "test-exchange";
const exchange_type = "fanout";
const queue_name = "test-queue10";

connectToRabbitMQ();
async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://10.0.39.71:5672");
    channel = await connection.createChannel();

    connectToQueue();
  } catch (error) {
    console.log(error);
  }
}

async function connectToQueue() {
  // https://amqp-node.github.io/amqplib/channel_api.html#channel_assertExchange
  await channel.assertExchange(exchange_name, exchange_type, {
    durable: false,
  });

  const q = await channel.assertQueue(queue_name, { exclusive: true });

  console.log("Waiting for messages....");

  // binding the queue
  const binding_key = "";
  channel.bindQueue(q.queue, exchange_name, binding_key);

  console.log("consuming messages from queue: ", q.queue);
  channel.consume(q.queue, (msg: any) => {
    if (msg.content) console.log("Received message: ", msg.content.toString());
    channel.ack(msg);
  });
}

app.listen(PORT, () => {
  console.log(`💻[client1]: working at http://localhost:${PORT}`);
});
