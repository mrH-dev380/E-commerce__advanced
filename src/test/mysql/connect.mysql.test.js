const mysql = require('mysql2')

// create connection to pool server
const pool = mysql.createPool({
  host: 'localhost',
  port: '8811',
  user: 'devH',
  password: '012435',
  database: 'shopDEV',
})

const batchSize = 10000 // adjust batch size
const totalSize = 10_000_000 // adjust total size

console.time('::::::TIMER::::::')

let currentId = 1
const insertBatch = async () => {
  const values = []
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const name = `Name-${currentId}`
    const age = currentId
    const address = `Address-${currentId}`
    values.push([currentId, name, age, address])
    currentId += 1
  }

  if (!values.length) {
    console.timeEnd('::::::TIMER::::::')
    pool.end((err) => {
      if (err) {
        console.log('error occurred while running')
      } else {
        console.log(`Connection pool close successfully`)
      }
    })
    return
  }

  const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`

  pool.query(sql, [values], async function (err, results) {
    if (err) throw err

    console.log(`Inserted ${results.affectedRows} records`)
    await insertBatch()
  })
}

insertBatch().catch(console.error)

// perform a sample operation
// pool.query('SELECT * FROM users', function (err, results) {
//   if (err) throw err

//   console.log(`query result::`, results)
//   // close pool connection
//   pool.end((err) => {
//     if (err) throw err
//     console.log('connection closed!')
//   })
// })

// connect master slave docker

// CHANGE MASTER TO
// MASTER_HOST='172.20.0.2',
// MASTER_PORT=3306,
// MASTER_USER='root',
// MASTER_PASSWORD='012435',
// master_log_file='mysql-bin.000003',
// master_log_pos=157,
// master_connect_retry=60,
// GET_MASTER_PUBLIC_KEY=1;
