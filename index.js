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
const users = [];

app.route("/api/users").post((req, res) => {
  const id = uuid.v4();
  usersLog.push({"_id": id, "username": req.body.username, "count": 0, "log":[]});
  users.push({"_id": id, "username": req.body.username});
  res.json({"username": req.body.username, "_id": id});
}).get((req, res) => {
  res.send(users);
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
    let { from, to, limit } = req.query;
    let { _id, username, log } = usersLog[i];
    let record = {
      _id,
      username
    };
    record = applyFilters(from, log, to, +limit, record);
    res.json(record);
  }
  else{
    res.send("Could not find a user with id: " + req.params.id)
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
  for(let i = 0; i < usersLog.length; ++i){
    if(usersLog[i]._id === id){
      return i;
    }
  }
  return -1;
}
