var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');                //importing db schema and model
var passCatModel = require('../modules/password_category')
var passModel = require('../modules/add_password')
var bcrypt = require('bcryptjs');                           //used for password encryption while storing into db
var salt = bcrypt.genSaltSync(10);                          //storing 10 in salt means encrypt password upto 10 characters
var jwt = require('jsonwebtoken');                            //importing token library
const { check, validationResult } = require('express-validator');       //empty category submit validation
//var getpassCat = passCatModel.find({});                           // finding if any data is there in password_category table/collection
var checkLoginUser = (req, res, next) => {               //this function will help to match and veryfy token, if the token is verified, then an only then user will be redirected to dashboard
  try {
    var userToken = localStorage.getItem('userToken');
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/')
  }
  next();
}


if (typeof localStorage === "undefined" || localStorage === null) {       //creating localstorage
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var checkEmail = (req, res, next) => {
  var email = req.body.email;
  var checkexitemail = userModule.findOne({email: email});
  checkexitemail.exec((err, data) => {
    if(err) { console.log(err.message); }
    if(data) {
      return res.render('signup', { title: 'Password Management System', success:"Email already exists" });
    }
    next();
  })
}

var checkUsername = (req, res, next) => {
  var uname = req.body.uname;
  var checkexituname = userModule.findOne({username: uname});
  checkexituname.exec((err, data) => {
    if(err) { console.log(err.message); }
    if(data) {
      return res.render('signup', { title: 'Password Management System', success:"Username already exists" });
    }
    next();
  })
}


/* GET home page. */
router.get('/', function(req, res, next) {                                //index/login
  var loginUser = localStorage.getItem('loginUser'); 
  // if(loginUser){
  //   res.redirect('./dashboard');
  // }
  // else{
    res.render('index', { title: 'Password Management System', success:"" });
  //}
});

router.post('/', function(req, res, next) {                               //index/login

  var username = req.body.uname;
  var password = req.body.password;
  var checkUser = userModule.findOne({username: username})
  
  checkUser.exec((err, data) => {
    if(err) { console.log(err.message); }

      var getUserId = data._id;
      var getPassword = data.password;
      if(bcrypt.compareSync(password, getPassword))  {             //comparing user entered password with encrypted password stored in db
        
        var token = jwt.sign({ userId: getUserId }, 'loginToken');      //generating/creating a token with name "logintoken"
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', username);                    //set token


        res.redirect('/dashboard');                             //if user successfully loggedin, then redirect to dashboard
      }
      else{
        res.render('index', { title: 'Password Management System', success:"Invalid Username or password" });
      }
    next();
  })
  
});

router.get('/dashboard',checkLoginUser, function(req, res, next) {    //if the token is verified, then an only then user will be redirected to dashboard
  var loginUser = localStorage.getItem('loginUser');                  //get token(setted in post ('/)/login)
  res.render('dashboard', { title: 'Dashboard', loginUser: loginUser, success: '' });
});


router.get('/signup', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  // if(loginUser){
  //   res.redirect('./dashboard');
  // }
  // else{
    res.render('signup', { title: 'Password Management System', success:"" });
  //}
});

router.post('/signup',checkUsername, checkEmail, function(req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;

  //console.log(username, email, password, confpassword)

  if(password != confpassword){
    return res.render('signup', { title: 'Password Management System', success:"Password and Confirm password does not match!" });
  }
  else{
    password = bcrypt.hashSync(req.body.password, salt);                 //user entered password is encrypted upto 10 characters 
    var userDetails = new userModule({
      username: username,
      email: email,
      password: password
    });
    // userDetails.save((err,doc) => {
    //   if(err) { console.log(err); }
    //   else{
    //     res.render('signup', { title: 'Password Management System', success: "User Registered Successfully" });
    //   }
    // })
  
    userDetails.save(function(err,req1){           //insert data into Database
      if(err) {console.log(err.message); }
      userModule.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
        if (!err) {
          res.render('signup', { title: 'Password Management System', success: "User Registered Successfully" });
          res.redirect('/dashboard');
        } else {
            throw err;
        }
    }).clone().catch(function(err){ console.log(err)})
    });  
  }
});


router.get('/passwordcategory',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  // getpassCat.exec((err, data) => {                            //fetching and executing all the data present in password_category table/collection
  //   if(err){ console.log(err.message); }
  //   res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
  //   });



    passCatModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
      if (!err) {
        res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
      } else {
          throw err.message;
      }
  }).clone().catch(function(err){ console.log(err)})


});

router.get('/passwordcategory/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var passcat_id = req.params.id;
  var passdelete = passCatModel.findByIdAndDelete(passcat_id);
  // passdelete.exec((err, data) => {                            //fetching and executing all the data present in password_category table/collection
  //   if(err){ console.log(err.message); }
  //   res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
  // });


  passdelete.exec(function(err){
    if(err) { console.log(err.message) };
    passCatModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
      if (!err) {
        res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
      } else {
          throw err.message;
      }
  }).clone().catch(function(err){ console.log(err)})
      });

});

router.get('/passwordcategory/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var passcat_id = req.params.id;
  var getpassCategory = passCatModel.findById(passcat_id);
  getpassCategory.exec((err, data) => {                            //fetching and executing all the data present in password_category table/collection
    if(err){ console.log(err.message); }
    res.render('edit_pass_category', { title: 'Password Management System', loginUser: loginUser,errors:'', success:'', records: data, id: passcat_id });            //rendering the fetched data
  });

});


router.post('/passwordcategory/edit/',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var passcat_id = req.body.id;
  var passwordCategory = req.body.passwordCategory;

  var update_passCat = passCatModel.findByIdAndUpdate(passcat_id, {password_category: passwordCategory})

  update_passCat.exec((err, doc) => {                            //fetching and executing all the data present in password_category table/collection
    if(err){ console.log(err.message); }
      res.redirect('/passwordcategory/')
  });

});



router.get('/add-new-category',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  
    res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors:'', success:'' });
});

router.post('/add-new-category',checkLoginUser, [check('passwordCategory', 'Enter Password Category name').isLength({ min: 5 })],function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.mapped());
    res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors: errors.mapped(), success:'' });
  }
  else{
    var passCatName = req.body.passwordCategory;
    var passcatDetails = new passCatModel({
      password_category: passCatName
    });

    passcatDetails.save((err, doc) => {
      if(err) { console.log(err.message); }
      res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors: '', success:'Password category inserted successfully!!!!' });
    })
  }
});

router.get('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  passCatModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
    if (!err) {
      res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success:'' });            //rendering the fetched data
    } else {
        throw err.message;
    }
}).clone().catch(function(err){ console.log(err)})
});

router.post('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var pass_cat = req.body.pass_cat;
  var pass_details = req.body.pass_details;
  var project_name = req.body.project_name
  var password_details = new passModel({
    password_category: pass_cat,
    password_detail: pass_details,
    project_name: project_name
  })

  password_details.save((err, doc) => {
    passModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
    if (!err) {
        res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success: 'Password Details inserted Successfully' });            //rendering the fetched data
      
    } else {
        throw err.message;
    }
}).clone().catch(function(err){ console.log(err)})
});
});

router.get('/view-all-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  passModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
    if (!err) {
      res.render('view-all-password', { title: 'Password Management System', loginUser: loginUser, records: data });

      
    } else {
        throw err.message;
    }
}).clone().catch(function(err){ console.log(err)})
});

router.get('/view-all-password/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.params.id;
  var passdelete = passModel.findByIdAndDelete(passcat_id);
  // passdelete.exec((err, data) => {                            //fetching and executing all the data present in password_category table/collection
  //   if(err){ console.log(err.message); }
  //   res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
  // });


  passdelete.exec(function(err){
    if(err) { console.log(err.message) };
    passModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
      if (!err) {
        res.render('view-all-password', { title: 'Password Management System', loginUser: loginUser, records: data });            //rendering the fetched data
      } else {
          throw err.message;
      }
    }).clone().catch(function(err){ console.log(err)})
  });
});


router.get('/edit-password/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var pass_id = req.params.id;
  var getCategory = passModel.findById(pass_id);


  passCatModel.find({}, function (err, data) { //find({}) will find all the datas from database and store it in employee
    if (!err) {
      //res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success:'' });            //rendering the fetched data
      
      getCategory.exec((err, data1) => {                            //fetching and executing all the data present in password_category table/collection
        if(err){ console.log(err.message); }
        res.render('edit_password', { title: 'Password Management System', loginUser: loginUser, records: data, records1: data1, id: pass_id });            //rendering the fetched data
      });

    } else {
        throw err.message;
    }
  }).clone().catch(function(err){ console.log(err)})
});


router.post('/edit-password/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var pass_id = req.params.id;
  var passwordCategory = req.body.pass_cat;
  var project_name = req.body.project_name;
  var pass_details = req.body.pass_details
  console.log(passwordCategory);
  var update_Pass = passModel.findByIdAndUpdate(pass_id, {password_category: passwordCategory, project_name: project_name, password_detail: pass_details})

  update_Pass.exec((err, doc) => {                            //fetching and executing all the data present in password_category table/collection
    if(err){ console.log(err.message); }
      res.redirect('/view-all-password/')
  });

});


router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginuser');
  res.redirect('/');
});

module.exports = router;
