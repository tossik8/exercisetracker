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
});
app.post("/api/users/:id/exercises", (req, res) => {
  let {description, duration, date } = req.body;
  const id = req.body[":_id"];
  const i = findRecord(id);
  if(i !== -1){
    date = setDate(date);
    usersLog[i].log.push({"description": description, "duration": +duration, "date": date});
    ++usersLog[i].count;
    res.json({"_id": id, "username": usersLog[i].username, "date": date, "duration": +duration, "description": description});
  }
  else{
    res.send("Could not find a user with id: " + id)
  }
});

app.get("/api/users/:id/logs", (req, res) => {
  const i = findRecord(req.params.id);
  if(i !== -1){
    res.json(usersLog[i]);
  }
  else{
    res.send("Could not find a user with id: " + req.params.id)
  }
})

function setDate(date){
  if(date === "") return new Date(Date.now()).toDateString();
  return new Date(date).toDateString();
}
function findRecord(id){
  for(let i = 0; i < usersLog.length; ++i){
    if(usersLog[i]._id === id){
      return i;
    }
  }
  return -1;
}
