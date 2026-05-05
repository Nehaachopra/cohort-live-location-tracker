import { Kafka } from "kafkajs";

export const kafkaClient = new Kafka({
  clientId: 'chaicode',
  brokers: ['host.docker.internal:9092'],
});