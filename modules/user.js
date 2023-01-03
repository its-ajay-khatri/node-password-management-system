const mongoose = require('mongoose');
//mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://mongoadmin5:64YfbrLoMxDlG6xK@cluster0.xmgxxz3.mongodb.net/pms?retryWrites=true&w=majority', {useNewUrlParser: true});
var conn = mongoose.connection;           //creating connection object

var userSchema =new mongoose.Schema({
    username :{
        type:String,
        required: true,
        index: {
            unique: true
        }
    },
    email :{
        type:String,
        required: true,
        index: {
            unique: true
        }
    },
    password :{
        type:String,
        required: true,
    },
    date :{
        type:Date,
        default: Date.now,
    }
});


var userModel = mongoose.model('users', userSchema);           //users is the collectionname/tablename

module.exports = userModel;
