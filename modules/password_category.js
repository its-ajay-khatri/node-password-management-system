const mongoose = require('mongoose');
//mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true});

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
