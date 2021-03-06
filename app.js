const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const MongoClient = require('mongodb').MongoClient

const app = express()
const jsonParser = bodyParser.json()
const PORT = process.env.PORT || 3000
const uri_db = 'mongodb+srv://usersapirest:1w3r5y7i@cluster0.tcvb4.mongodb.net/users?retryWrites=true&w=majority' //usersapirest - 1w3r5y7i
// подключение к базе данных
const client = new MongoClient(uri_db,
   { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
   });

   
// ---- 1 option
// client.connect().then(result => {
//    const database = client.db('users_list')
//    const collection = database.collection('users')
   
//    // console.log('[Result]:', result)
// }, err => {
//    console.log(`[Err]: ${err}`)
// }).catch(err => console.log(`[ERROR Promise]: ${err}`))

// async function db(){
//    try {
//       await client.connect().catch(err => console.log('[ERROR while connecting to DB]:', err))
//       const database = client.db('users_list')
//       const collection = database.collection('users')
//       // console.log(typeof options.id);
//       // console.log(options.id);

//       // if (options.id === null){
//       //    const users = await collection.find({}).toArray()
//       //    return users
//       // }else if(options.id !== null){
//       //    if (options.all._) {
            
//       //    }
//       //    const user = await collection
//       // }

//       // const users = await collection.find({}).project({'_id':0}).toArray()  // for modification a responsed collection
//       // console.log(data.ops)
//       // const allUsers = await collection.find({})
//          // .project({'_id': 0, 'age': 1})
//       // const users = await (await allUsers.toArray()).filter(u => u.age == 45)
//       // const users = await allUsers.toArray()
//       // console.log('All users:', users)
//    } catch (e) {
//       console.log('ERROR: ', e)
//    }
//    client.close()
// }

(async ()=>{
   await client.connect()
      .then(() => console.log('[Connecting is successfully]'))
      .catch(e => console.log('[ERROR with connecting to DB]', e))
   app.locals.collection = client.db('users_list').collection('users')
   app.listen(PORT, () => {
      console.log(`[Server has been started on port ${PORT}...]`)
   })
})()

// подключение middelwear
app.use(jsonParser)

// получение всех данных
app.get('/api/users', async (req, res) =>{
   const collection = app.locals.collection
   const users = await collection.find({}).toArray()
   console.log(users);
   res.send(users)
})


// app.get('/api/users', async (req, res) =>{
//    const users = await db({id:2})
//    console.log('All users: ', users)
//    res.send(users)
//    // res.send()
// })

// подключение middelwear
// app.use(express.static(__dirname + '/public'))

// получение одного пользователя по id
app.get('/api/users/:id', async (req, res) => {
   const id = +req.params.id
   const collection = app.locals.collection
   const user = await collection.findOne({id: id})
   if (user) {
      res.send(user)
   } else {
      res.status(404).send('Such user is not found.')
   }
})

// получение отправленных данных
app.post('/api/users', async (req, res) => {
   if (!req.body) return res.status(400);
   let user = {
      name: req.body.name,
      age: req.body.age
   }
   let maxID = await app.locals.collection.find({}).project({'_id': 0, 'name': 0, 'age': 0, }).toArray()
   maxID = Math.max.apply(Math, maxID.map(e => e.id).filter(e => e != undefined))
   user.id = maxID + 1
   const result = await app.locals.collection.insertOne(user)
   console.log('result:', result.ops);
   res.status(200).send('OK')
})

// // получение отправленных данных
// app.post('/api/users', (req, res) => {
//    if(!req.body) return res.status(400)
//    let user = {
//       name: req.body.name,
//       age: req.body.age
//    }
//    let users = JSON.parse(fs.readFileSync('users.json', {encoding: 'utf-8'}))
//    const maxId = Math.max.apply(this, users.map(u => +u.id))
//    user.id = maxId + 1 
//    users.push(user)
//    let data = JSON.stringify(users)
//    fs.writeFileSync('users.json', data)
//    res.send(data)
// })

// удаление данных
app.delete('/api/users/:id', (req, res) => {
   if (!req.body) return res.status(400).send('No body.')
   const id = +req.params.id
   let users = fs.readFileSync('users.json', {encoding: 'utf-8'})
   users = JSON.parse(users)
   if (users.find(user => user.id === id)) {
      const remUser = users.filter(user => user.id != id)
      const data = JSON.stringify(remUser)
      fs.writeFileSync('users.json', data)
      res.send(data)
   } else {
      res.status(404).send('No such user.')
   }
})

// изменение данных
app.put('/api/users/:id', (req, res) =>{
   if(!req.body) return res.sendStatus(400).send('No body.')
   if (!req.body.name || !req.body.age) {
      res.sendStatus(400).send('False parameters.')
   }
   const id = +req.params.id
   const users = JSON.parse(fs.readFileSync('users.json', {encoding: 'utf-8'}))
   
   const idx = users.findIndex(user => user.id === id)
   if (idx + 1) {
      users[idx].name = req.body.name
      users[idx].age = req.body.age
      const data = JSON.stringify(users)
      fs.writeFileSync('users.json', data)
      res.send(users)
   } else {
      res.status(404).send('No such user.')
   }
})

// app.listen(3000, () => {
//    console.log('[Server has been started...]')
// })
