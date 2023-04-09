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
  const user = {"_id": id, "username": req.body.username};
  usersLog.push({user, "count": 0, "log":[]});
  users.push(user);
  res.json(user);
}).get((req, res) => {
  res.send(users);
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
