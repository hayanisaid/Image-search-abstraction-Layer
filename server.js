// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const mongoose=require('mongoose')
const router=express.Router();
const path=require('path')
const axios=require('axios');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// connect to mlab tadabase
let dbUrl=process.env.DBURL;
mongoose.connect(dbUrl,(err,db)=>{
  if(err){
  console.log('faild to connect')}
   console.log('connection etablishe')
})

const schema=mongoose.Schema({
   query:String,
   when:String
})
let Query=mongoose.model('query',schema)
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res,next) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/api/search',(req,res)=>{
  
  let offset=req.query.offset||1;
  let apikey=process.env.APIKEY;
  let cx=process.env.CX
  let query=req.query.q;
  let date=new Date();
  const dbdata={
   query:query,
   when:date 
  }
  // save query to database
  savetoDatabase(dbdata);
  
  let url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${query}&searchType=image&start=${offset}&fields=items(link,snippet,image/thumbnailLink,image/contextLink)`;
  let url2=`http://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${query}`;
  // &cx=${cx}
  

  
  // make a get request using axios
  
  axios.get(url)
  .then(result=>{
    
    let items=result.data.items;
    //console.log(items)
    let mydata=sendata(items);
    res.send(mydata)    
  } )
  .catch(err=> console.log('request faild=>>>>>'))
 
})


// get related search from db

app.get('/api/recent',(req,res)=>{
 
  mongoose.connect(dbUrl,(err,db)=>{
   if(err) throw err;
    let collection=db.collection('queries');
    
     collection.find().toArray((err,doc)=>{
     
       if(err) throw err;
     let items = doc.map(result=>{
          return{
           Query:result.query,
           Date:result.when 
          }
       
       });
       
       res.send(items)
       
     
     })
  
  })

})


/// function save data to db

const savetoDatabase=(data)=>{

let dbsave=new Query(data);
     dbsave.save((err,doc)=>{
      if(err){
      console.log('unable to save tada')
      }
       //insert successed
       console.log('succesfully inserted')
       
     })
}

/// const return data to the client 
const sendata=(data)=>{
return data.map(data=>{
      return {
      "link":data.link,
      "image":data.image ,
      "snippet": data.snippet,
      "contextLink":data.contexLink,
      "thumbnailLink" :data.thumbnailLink
      }
     })

}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
