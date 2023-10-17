'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _SECONDS = 5000

// count connect
const countConnections = () => {
  const numConnections = mongoose.connections.length
  console.log(`Number of connections: ${numConnections}`)
}

// check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    // Example maximum number connection of core
    const maxConnections = numCores * 5

    console.log(`Active connection: ${numConnections}`)
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

    if (numConnections > maxConnections) {
      console.log('Connection overload detected!')
    }
  }, _SECONDS)
}

module.exports = {
  countConnections,
  checkOverload,
}
