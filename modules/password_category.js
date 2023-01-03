const mongoose = require('mongoose');
//mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://mongoadmin5:64YfbrLoMxDlG6xK@cluster0.xmgxxz3.mongodb.net/pms?retryWrites=true&w=majority', {useNewUrlParser: true});

var conn = mongoose.connection;           //creating connection object

var passcatSchema =new mongoose.Schema({
    password_category :{
        type:String,
        required: true,
        index: {
            unique: true
        }
    },
    date :{
        type:Date,
        default: Date.now,
    }
});


var pascatModel = mongoose.model('password_categories', passcatSchema);           //users is the collectionname/tablename

module.exports = pascatModel;
