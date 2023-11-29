const redis = require('redis')

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient()
    this.publisher = redis.createClient()
  }

  publish(channel, message) {
    console.log(channel, message)
    return new Promise((resolve, reject) => {
      // Đảm bảo kết nối đã được mở
      if (!this.publisher) {
        this.connect()
      }

      // Gửi tin nhắn đến một kênh cụ thể
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err)
        } else {
          resolve(reply)
        }
      })
    })
  }

  subscribe(channel, callback) {
    // Đảm bảo kết nối đã được mở
    if (!this.subscriber) {
      this.connect()
    }

    // Đăng ký lắng nghe cho một kênh cụ thể
    this.subscriber.subscribe(channel)
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(subscriberChannel, message)
      }
    })
  }

  // Đóng kết nối Redis khi cần thiết
  close() {
    if (this.subscriber) {
      this.subscriber.quit()
    }

    if (this.publisher) {
      this.publisher.quit()
    }
  }
}

module.exports = new RedisPubSubService()