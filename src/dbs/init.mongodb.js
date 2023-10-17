'use strict'

const mongoose = require('mongoose')
const {
  db: { host, name, port },
} = require('../config/config.mongodb')
const { countConnections } = require('../helpers/check.connect')

const connectString = `mongodb://${host}:${port}/${name}`

console.log(`Connect String : ${connectString}`)
class Database {
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    mongoose
      .connect(connectString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 50,
      })
      .then(() => {
        console.log('Connect to MongoDB successful!', countConnections())
      })
      .catch((err) => console.error(err))
  }

  static getInstance() {
    if (!Database.instance) {
      // Check database exits
      Database.instance = new Database()
    }

    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
