'use strict'

const amqp = require('amqplib')

async function consumerOrderedMessage() {
  const connection = await amqp.connect(
    'amqps://vksrxsxk:aHvJ8AD3lsX2FnCiCwNjd92J_tg3nkzE@armadillo.rmq.cloudamqp.com/vksrxsxk'
  )
  const channel = await connection.createChannel()

  const queueName = 'ordered-queued-message'
  await channel.assertQueue(queueName, {
    durable: true,
  })

  for (let i = 0; i < 10; i++) {
    const message = `ordered-queued-message::${i}`
    console.log('message::', message)
    const queueName = 'ordered-queued-message'
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    })
  }

  setTimeout(() => {
    connection.close()
  }, 1000)
}

consumerOrderedMessage().catch((err) => console.error(err))
