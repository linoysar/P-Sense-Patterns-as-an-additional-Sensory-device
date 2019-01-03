var express = require('express');
var path= require('path');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var Users = require('./server/moduls/Users'); // get our users model
var Tests = require('./server/moduls/Tests');
var Questions = require('./server/moduls/Questions');
var DButilsAzure = require('./server/DButil');
var morgan= require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'app')));
const secret='ilanaKarin';

var port = 3000;
//-------------------------------------------------------------------------------------------------------------------

app.use('/reg', function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){

        jwt.verify(token, secret, function(err, decoded){
            if(err){
                return res.json({success:false, massage:"failed to authenticate"});
            } else{
                var decoded = jwt.decode(token,{complete:true});
                req.decoded=decoded;
                next();
            }
        });
    } 
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

app.use('/Users', Users)
app.use('/Tests', Tests)
app.use('/Questions', Questions)
app.set('port', process.env.PORT || 3000)

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})

module.exports= app