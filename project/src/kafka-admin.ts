import {kafkaClient} from "./kafka-client.js";

async function setup() {
  const admin = kafkaClient.admin();
   await new Promise(res => setTimeout(res, 5000));
  try {
    console.log("Kafka admin connecting");
    await admin.connect();
    console.log("Kafka admin connected"); 

    await admin.createTopics({
      topics:[
        {topic: 'location-updates', numPartitions: 2}
      ] 
    })
  }
   catch (err) {
    console.error("ERROR:", err);
  } finally {
    await admin.disconnect();
  }
}

setup();