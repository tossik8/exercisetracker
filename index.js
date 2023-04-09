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

const usersLogs = new Map();
const users = [];

app.route("/api/users").post((req, res) => {
  const id = uuid.v4();
  const user = {"_id": id, "username": req.body.username};
  usersLogs.set(id, []);
  users.push(user);
  res.json(user);
}).get((req, res) => {
  res.send(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const log = findRecord(req.params._id);
  if(log !== null){
    let {description, duration, date} = req.body;
    const username = findUsername(req.params._id);
    date = setDate(date);
    log.push({"description": description, "duration": +duration, "date": date});
    res.json({"_id": req.params._id, "username": username, "date": date, "duration": +duration, "description": description});
  }
  else{
    res.send("Could not find a person with id: " + req.params._id );
  }
});
app.get("/api/users/:_id/logs", (req, res) => {
  let log = findRecord(req.params._id);
  if(log !== null){
    const username = findUsername(req.params._id);
    res.json({"_id": req.params._id, "username": username, "count": log.length, "log": log });
  }
  else{
    res.send("Could not find a person with id: " + req.params._id );
  }
});

function applyFilters(from, log, to, limit, record){
  if(from && !isNaN(Date.parse(from))){
    from = new Date(from).toDateString();
    record.from = from;
    log = log.filter(exercise => new Date(exercise.date).getTime() >= new Date(from).getTime());
  }
  if(to && !isNaN(Date.parse(to))){
    to = new Date(to).toDateString();
    record.to = to;
    log = log.filter(exercise => new Date(exercise.date).getTime() <= new Date(to).getTime());
  }
  if(limit && limit > 0){
    const exercises = log.slice(0, limit);
    record.count = exercises.length;
    record.log = exercises;
  }
  else{
    record.count = log.length;
    record.log = log;
  }
  return record;
}
function setDate(date){
  if(date === "") return new Date(Date.now()).toDateString();
  date = new Date(date);
  return isNaN(date.getTime())? new Date(Date.now()).toDateString() : date.toDateString();
}
function findRecord(id){
  for(let [key, value] of usersLogs){
    if(key === id){
      return value;
    }
  }
  return null;
}
function findUsername(id){
  for(let user of users){
    if(user._id === id) return user.username;
  }
  return null;
}
