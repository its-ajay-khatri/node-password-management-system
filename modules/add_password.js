const mongoose = require('mongoose');
//mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true});

var conn = mongoose.connection;           //creating connection object

var passSchema =new mongoose.Schema({
    password_category :{
        type:String,
        required: true
    },
    project_name :{
        type:String,
        required: true
    },

    password_detail :{
        type:String,
        required: true
    },
    date :{
        type:Date,
        default: Date.now,
    }
});


var pasModel = mongoose.model('password_details', passSchema);           //users is the collectionname/tablename

module.exports = pasModel;
