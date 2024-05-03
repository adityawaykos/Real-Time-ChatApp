// This code belongs to Aditya Waykos
// Import the 'kafka-node' module to interact with Apache Kafka.
const kafka = require('kafka-node');

// Initialize a Kafka client connected to a Kafka broker.
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

// Create a Kafka producer attached to the Kafka client to send messages to topics.
const kafkaMessageProducer = new kafka.Producer(kafkaClient);

// Create a Kafka consumer attached to the Kafka client to receive messages from specified topics.
const kafkaMessageConsumer = new kafka.Consumer(
    kafkaClient,
    [{ topic: 'messages' }],  			// List of topics to subscribe to.
    { groupId: 'message-group' } 	    // Consumer group ID for coordination and load balancing among multiple consumers.
);

// Set up an event listener for the Kafka producer to log when it is ready to send messages.
kafkaMessageProducer.on('ready', () => {
    console.log('Kafka Producer is ready');
});

// Set up an event listener to log any errors that occur during the operation of the Kafka producer.
kafkaMessageProducer.on('error', (error) => {
    console.error('Error initializing Kafka producer:', error);
});

// Set up an event listener for the Kafka consumer to handle incoming messages.
kafkaMessageConsumer.on('message', (message) => {
    try {
        const messageData = JSON.parse(message.value);  	// Parse the incoming message as JSON.
        console.log('Received message:', messageData);

        // Call function to process the message data.
        processReceivedMessage(messageData);
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Define a function to process and display message data received by the consumer.
function processReceivedMessage(messageData) {
    console.log(`Delivering message to user ${messageData.receiverId}: ${messageData.messageContent}`);
}

// Set up an event listener to log any errors that occur during the operation of the Kafka consumer.
kafkaMessageConsumer.on('error', (error) => {
    console.error('Error in Kafka consumer:', error);
});

// Export the Kafka producer to enable its use in other parts of the application.
module.exports = { kafkaMessageProducer };
