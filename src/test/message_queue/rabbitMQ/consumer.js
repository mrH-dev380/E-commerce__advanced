const amqp = require('amqplib')

const runConsumer = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:012435@localhost')
    const channel = await connection.createChannel()

    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true, // khi redis server bi loi, sau khi khoi dong lai tiep tuc thuc hien thao tac chua hoan tat
    })

    // received message from producer
    channel.consume(
      queueName,
      (messages) => {
        console.log(`Received ${messages.content.toString()}`)
      },
      {
        noAck: true, // khi du lieu da duoc gui thi ko gui lai nua
      }
    )
  } catch (error) {
    console.error(error)
  }
}

runConsumer().catch(console.error)
