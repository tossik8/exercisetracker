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
  let isPresent = false;
  for(let record of usersLog){
    if(record._id === id){
      isPresent = true;
      break;
    }
  }
  if(isPresent){
    if(date === "") date = new Date(Date.now());
    else{
      date = new Date(date);
    }
    let username;
    for(let log of usersLog){
      if(log._id === id){
        log.log.push({"description": description, "duration": duration, "date": date});
        username = log.username;
        ++log.count;
        console.log(log);
        break;
      }
    }
    res.json({"_id": id, "username": username, "date": date, "duration": duration, "description": description});
  }
  else{
    res.send("Could not find a user with id: " + id)
  }

})
