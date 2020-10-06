const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express')

const app = express()
const jsonParser = bodyParser.json()

app.use(express.static(__dirname + '/public'))

// получение списка данных
app.get('/api/users', (req, res) => {
   const content = fs.readFileSync('users.json', 'utf-8')
   const users = JSON.parse(content)
   res.send(users)
   // res.send('API done!')
})

// получение одного пользователя по id
app.get('/api/users/:id', (req, res) => {
   const id = +req.params.id
   const content = fs.readFileSync('users.json', {encoding: 'utf-8'})
   const users = JSON.parse(content)
   const user = users.find(person => person.id === id)
   if (user) {
      res.send(user)
   } else {
      res.status(404).send('Such user is not found.')
   }
})

// получение отправленных данных
app.use(jsonParser)
app.post('/api/users', (req, res) => {
   // console.log('Body:', req.body)
   if(!req.body) return res.status(400)
   let user = {
      name: req.body.name,
      age: req.body.age
   }
   let users = JSON.parse(fs.readFileSync('users.json', {encoding: 'utf-8'}))
   const maxId = Math.max.apply(this, users.map(u => +u.id))
   user.id = maxId + 1 
   users.push(user)
   let data = JSON.stringify(users)
   // console.log('Post user: ', user)
   fs.writeFileSync('users.json', data)
   res.send(data)
})

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

app.listen(3000, () => {
   console.log('[Server has been started...]')
})