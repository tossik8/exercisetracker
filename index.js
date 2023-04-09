const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const uuid = require("uuid");


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.urlencoded({extended: false}));





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const usersLog = [];

app.post("/api/users", (req, res) => {
  const id = uuid.v4();
  usersLog.push({"_id": id, "username": req.body.username, "count": 0, "log":[]});
  res.json({"username": req.body.username, "_id": id});
})
