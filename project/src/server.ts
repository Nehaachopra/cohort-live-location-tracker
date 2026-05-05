import http from "http";

import app from "./app.js";
import { Server } from "socket.io";
import {kafkaClient} from "./kafka-client.js";
import 'dotenv/config';
import connectDB from "./db.js";

const PORT = process.env.PORT || 3000;

async function main() {
  const server = http.createServer(app);
  
  await connectDB();

  const io = new Server(server);
  const kafkaProducer = kafkaClient.producer();
  await kafkaProducer.connect();

  const kafkaConsumer = kafkaClient.consumer({
    groupId: `socket-server-${PORT}`
  });
  await kafkaConsumer.connect();
  
  await kafkaConsumer.subscribe({
    topics: ["location-updates"],
    fromBeginning: true 
  });
  kafkaConsumer.run({
    eachMessage: async({topic, message, partition, heartbeat}) => {
      const data = JSON.parse(message.value?.toString()!);
      io.emit("server:location:update", data);
      console.log(`Kafka consumer data received: `,data);
      await heartbeat();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connection established with ID ${socket.id}`);

    socket.on("client:location:update", async (data) => {
      const {latitude, longitude} = data;
      await kafkaProducer.send({topic: 'location-updates', messages: [
        {
          key: socket.id,
          value: JSON.stringify({id: socket.id, latitude, longitude})
        }
      ]})
    })
  })

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
