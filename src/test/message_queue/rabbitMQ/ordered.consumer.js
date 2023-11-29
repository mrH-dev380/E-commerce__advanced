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

  // Set prefetch
  channel.prefetch(1) // mỗi consumer chỉ được xử lý 1 tác vụ cùng lúc

  channel.consume(queueName, (msg) => {
    const message = msg.content.toString()

    setTimeout(() => {
      console.log('processed::', message)
      channel.ack(msg)
    }, Math.random() * 1000)
  })
}

consumerOrderedMessage().catch((err) => console.error(err))
