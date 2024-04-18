import express, { Express, Request, Response } from "express";
import { connect as mqConnection } from "amqplib";

const app: Express = express();

const PORT = 3000;

app.use(express.json());

app.post("/send-message", (req: Request, res: Response) => {
  const message = req.body.message;

  sendMessageToQueue(message);

  console.log("Message sent to the exchange");

  res.send("Message Sent");
});

app.listen(PORT, () => {
  console.log("⚡[server]: listening at http://localhost:" + PORT);
});

let channel: any;
let connection;
const exchangeName = "test-exchange";
const exchangeType = "fanout";
const connectQueue = async () => {
  try {
    connection = await mqConnection("amqp://10.0.39.71:5672");
    channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, exchangeType, {
      durable: false,
    });
  } catch (e) {
    console.error(e);
  }
};

connectQueue();

const sendMessageToQueue = async (message: any) => {
  const queue_name = "test-queue10";
  await channel.publish(exchangeName, queue_name, Buffer.from(message));
};
