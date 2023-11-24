const amqp = require('amqplib')

const log = console.log

console.log = function () {
  log.apply(console, [new Date()].concat(arguments))
}

const runProducer = async () => {
  try {
    const connection = await amqp.connect(
      'amqps://vksrxsxk:aHvJ8AD3lsX2FnCiCwNjd92J_tg3nkzE@armadillo.rmq.cloudamqp.com/vksrxsxk'
    )
    const channel = await connection.createChannel()

    const notificationExchange = 'notificationEx' // notificationEx direct
    const notifiQueue = 'notificationQueueProcess' // assertQueue
    const notificationExchangeDLX = 'notificationExDLX' // notificationEx direct
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX' // assert

    // 1. create Exchange
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true,
    })

    // 2. create Queue
    const queueResult = await channel.assertQueue(notifiQueue, {
      exclusive: false,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
      // khi thông báo đẩy đến lỗi hoặc hết hạn thì sẽ được gửi đến deadLetterExchange
      // bằng khóa định tuyến deadLetterRoutingKey
    })

    // 3. bindQueue
    await channel.bindQueue(queueResult.queue, notificationExchange)

    // 4. send message
    const msg = 'product xxx added'
    console.log('product msg::', msg)
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '1000',
    })
    setTimeout(() => {
      connection.close()
      process.exit()
    }, 500)
  } catch (error) {
    console.error(error)
  }
}

runProducer().catch(console.error)
