const amqp = require('amqplib')
const messages = 'new product xxx added'

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:012435@localhost')
    const channel = await connection.createChannel()

    const queueName = 'test-topic'
    // tao hang doi queueName truyen thong bao
    await channel.assertQueue(queueName, {
      durable: true, // khi redis server bi loi, sau khi khoi dong lai tiep tuc thuc hien thao tac chua hoan tat
    })

    // create queue and send messages to consumer channel
    channel.sendToQueue(queueName, Buffer.from(messages))
    console.log(`message sent::`, messages)

    setTimeout(() => {
      connection.close()
      process.exit()
    }, 500)
  } catch (error) {
    console.error(error)
  }
}

runProducer().catch(console.error)
