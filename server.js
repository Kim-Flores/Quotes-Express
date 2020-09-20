const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
var multer = require('multer');
var ObjectId = require('mongodb').ObjectID;

var db, collection;

const url = "mongodb+srv://quote:quote@cluster0.psjws.mongodb.net/quotes?retryWrites=true&w=majority";
const dbName = "quote";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {quotes: result})
  })
})

app.put('/heart', (req, res) => {
  db.collection('quotes')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $inc: {
      heart: 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})
app.put('/thumbDown', (req, res) => {
  db.collection('quotes')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $inc: {
      heart: - 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/quotes', (req, res) => {
  console.log(req.body.name,"name")
  db.collection('quotes').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
});
var upload = multer({storage: storage});
// app.post('/up', upload.single('file-to-upload'), (req, res, next) => {
//   insertDocuments(db, req, 'images/uploads/' + req.file.filename, () => {
//       //db.close();
//       //res.json({'message': 'File uploaded successfully'});
//       res.redirect('/profile')
//   });
// });

app.post('/quotes', upload.single('file-to-upload'), (req, res) => {
  console.log(req.body.name, 'body nm')
  console.log(req.body.msg, 'body msg')
  db.collection('quotes').insertOne({name: req.body.name, msg: req.body.msg, heart: 0, img: "img/" + req.file.filename}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})