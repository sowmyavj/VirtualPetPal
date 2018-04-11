const express = require('express');
const router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require("../data");
//const userData = data.users;
//const petData = data.pets;
const userData = require("../data/users.js");
const petData = require("../data/pets.js");
const userPetsData = require("../data/userPets.js");

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'effugio',
  api_key: '266718785839255',
  api_secret: 'YoIwSpXNsaiRXNNB1EDp_gGmhOs'
});
var setCookie = require('set-cookie-parser');
var xss = require("xss");

passport.use(new Strategy({
    usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password'
},
  async function(email, password, cb) {
      console.log("user: pass:"+email+" "+password);
      var user= await userData.getUserbyEmail(email);
      console.log(user);
      if(!user){
          return cb(null, false, { message: 'Unknown User'});
      }
      var isMatch = await userData.comparePassword(password, user.hashedPassword);
      if(isMatch){
        return cb(null, user);
      } else {
            return cb(null, false, { message: 'Invalid password'});
      }

}));

passport.serializeUser( function(user, cb) {
    cb(null, user._id);
  });
  
passport.deserializeUser(async function(id, cb) {
  var user = await userData.getUser(id);
  cb(null, user);
  
}); 


router.get('/login',
function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {      
    res.render('users/login', { message: req.flash('error') });    
    
  }else{
    res.redirect('/profile');  
  }
});
//NM - Declaring errors empty list variable and adding new parameters - errors, hasErrors, updSuccess to res.render
router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    let errors = [];

    try {

      res.render('users/profile', {
        errors: errors,
        hasErrors: false,
        updSuccess: false,
        user: req.user,
        profilePicID:req.user._id
      });
    }
    catch (e) {
      errors.push(e);
      res.render('users/profile', {
        errors: errors,
        hasErrors: true,
        updSuccess: false,
        user: req.user,
        profilePicID:req.user._id
      });
    }
  });

//NM - added a post method for My Profile page to send user profile updates to the database
router.post("/profile", multipartMiddleware,async (req, res) => {
    let updatedProfileData = req.body;
    
    
    updatedProfileData.email = xss(req.body.email, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.newPwd = xss(req.body.newPwd, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.newPwdConfirm = xss(req.body.newPwdConfirm, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });

  //console.log("body: %j", req.body);
  console.log("Updated Profile Info: ");
  console.log(updatedProfileData);

  let errors = [];

  if(updatedProfileData.email.length===0){
    let error_msg="Valid email not provided";
    errors.push(error_msg);
  }

  if ((updatedProfileData.newPwd) || (updatedProfileData.newPwdConfirm)){
    if (updatedProfileData.newPwd !== updatedProfileData.newPwdConfirm){
    //console.log("Coming into if");
    errors.push("New Password and Confirm New Password don't match");
    }
  } 

  /*
  if (!blogPostData.body) {
    errors.push("No body provided");
  }
*/

  if (errors.length > 0) {
    //console.log("Inside errors.length if");
    res.render('users/profile', {
      errors: errors,
      hasErrors: true,
      updSuccess: false,
      user: updatedProfileData,
      profilePicID:req.user._id
    });
    return;
  }

  try {
    //console.log("Inside try");

    let updatedUserProfile = await userData.updateUser(updatedProfileData);
    res.render('users/profile', {
      errors: errors,
      hasErrors: false,
      updSuccess: true,
      user: updatedProfileData,
      profilePicID:req.user._id
    });
    return;
  }
  catch (e) {
    //console.log("Inside catch");
    //res.status(500).json({ error: e });
    errors.push(e);
    res.render('users/profile', {
      errors: errors,
      hasErrors: true,
      updSuccess: false,
      user: updatedProfileData,
      profilePicID:req.user._id
    });
  }
});

router.get('/dashboard',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    let pets = await petData.getAllPets();
    console.log("Pets:"+pets);
    if(pets!=null){
      res.render('users/dashboard', {
        pets: pets,
        user: req.user,
        helpers: {
          getPetProfilePic: async function (id) { return await getPetProfilePicture(id); }
        }
      },);
    }
    
    
  /*   suggestedUsers = await userData.getSuggestedUsers(req.user);
    if (suggestedUsers != null) {
      //console.log("suggested users:: ");
      //console.log(suggestedUsers);

      res.render('users/dashboard', {
        users: suggestedUsers,
        user: req.user,
        helpers: {
          toage: function (dob) { return getAge(dob); }
        }
      },
      );
    } */
  });
  router.get('/mypetpage',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log(req.user._id);
    let pets = await userPetsData.getUserPets(req.user._id);
    console.log("Pets:"+pets);
    if(pets!=null){
      res.render('users/mypetpage', {
        pets: pets,
        user: req.user,
        helpers: {
          getPetProfilePic: async function (id) { return await getPetProfilePicture(id); }
        }
      },);
    }
  });

  router.get('/delete/:id',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log("id:: " + req.params.id);  
  removeUser = await userData.removeUser(req.params.id);

    name=req.user.name
    req.logout();
    res.render('users/deleted', {
      name: name, 
      
    });
  });

  
function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function getPetProfilePicture(petId){
  let pet_url = await petData.getPetProfilePic(petId);
  console.log("pet_url"+pet_url);
  return pet_url;
}


router.post('/login',
  passport.authenticate('local', { successRedirect: '/mypetpage', failureRedirect: '/login', failureFlash: true }),
  function (req, res) {
    //console.log(req.body);
    console.log('You are authenticated');
    res.redirect('/profile');
  });

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
// Register
router.get('/register', async function (req, res) {

  try {
    let locations = await travelData.getAllTravel();
    let budgetranges = budgetData.getAllBudget();

    res.render('users/register', { locations: locations, budgetranges: budgetranges });
  }
  catch (e) {
    response.status(500).json({ error: e });
  }
	
});
// Register User
router.post('/register', multipartMiddleware, async function(req, res){

	// Validation
    req.checkBody('name', 'Name is required').notEmpty();
  	req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('dob', 'Date of birth is required and should be a date').notEmpty();
	  //req.checkBody('user_id', 'Username is required').notEmpty();
	  req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    
  var errors = req.validationErrors();
  //console.log(errors.length);
 // console.log(typeof(errors));
  
  //console.log("Filename :"+req.body.uploadPicture);
  var imageFile = req.files.uploadPicture.path;
  var imageFileName = xss(req.files.uploadPicture.name, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  });
 
if(!imageFileName) {
  let error_msg={"msg" :"Please select a profile picture for upload",
                 "param":"uploadPicture" };
    if(!errors){
      errors=[];
      errors.push(error_msg);
      //console.log(typeof(errors));
    }else{
      errors.push(error_msg);
    }
    console.log("no file selected!!");
  }else{

   // let ext = (imageFileName.split("."))[1];
    var ext = imageFileName.split(".").pop().toLowerCase();
    if(ext != "png" && ext !="jpg" ){
      let error_msg={"msg" :"Profile picture must be a .png or .jpg file",
      "param":"uploadPictureext" };
      if(!errors){
        errors=[];
        errors.push(error_msg);
        //console.log(typeof(errors));
      }else{
        errors.push(error_msg);
      }
    }
    console.log("ext is "+ext);

  }

  if(xss(req.body.user_id, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  })){
    user=await userData.getUserbyUserId(xss(req.body.user_id, {
      whiteList:          [],        // empty, means filter out all tags
      stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
      stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                     // to filter out its content
    }));
    if(user){
        console.log("Username "+user.name+" already exists");
        //let errorMessage="Username already exists";
        let error_msg={"msg" :"Username already exists",
        "param":"user_id" };
        if(!errors){
          errors=[];
          errors.push(error_msg);
          //console.log(typeof(errors));
        }else{
          errors.push(error_msg);
        }
    }
}

const newUser = {
  user_id: xss(req.body.user_id, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  }),
  hashedPassword: "",
  password: xss(req.body.password, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script']
  }),
  name: xss(req.body.name, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script'] 
  }),
  dob: xss(req.body.dob, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script'] 
  }),
  email: xss(req.body.email, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  }),
};

if(newUser.user_id.length===0){
  let error_msg={"msg" :"Valid username not provided",
  "param":"user_id" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.password.length===0){
  let error_msg={"msg" :"Valid password not provided",
  "param":"password" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.name.length===0){
  let error_msg={"msg" :"Valid name not provided",
  "param":"name" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.dob.length===0){
  let error_msg={"msg" :"Valid date of birth not provided",
  "param":"dob" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}


if(newUser.email.length===0){
  let error_msg={"msg" :"Valid email not provided",
  "param":"email" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}

	if(errors){

    var errors_user={
      name:xss(req.body.name, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }) ,
      user_id:xss(req.body.user_id, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      password:xss(req.body.password, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      password2:xss(req.body.password2, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      dob:xss(req.body.dob, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      email:xss(req.body.email, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      })
    };

    res.render('users/register', {errors:errors,user:errors_user} );

  } else {
    
    addedUser=await userData.addUser(newUser,newUser.password);
    console.log("added new user");
    console.log(addedUser);
    if(imageFileName){
      //let result=await cloudinary.api.resource(imageFile); 
      console.log("imageFile :"+imageFile);
      var addedUserid=addedUser._id;
      var result =await cloudinary.uploader.upload(imageFile,{public_id:addedUserid});
      //console.log("Result :"+result); 
      console.log("Result :"+result.url); 
    
    } 
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');  
    
	}
});


router.get('/checkPetProfile/:pet_id',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    let errors = [];

    try {
      console.log("id:: " + req.params.pet_id);
      checkPet = await petData.getPetbyPetId(req.params.pet_id);

      res.render('users/checkPetProfile', {
        errors: errors,
        hasErrors: false,
        updSuccess: false,
        user: req.user,
        pet:checkPet
      });
    }
    catch (e) {
      errors.push(e);
      res.render('users/profile', {
        errors: errors,
        hasErrors: true,
        updSuccess: false,
        user: req.user,
        locations: alllocationprefs,
        budgetranges: budgetranges,
        profilePicID:req.user._id
      });
    }
  });
module.exports = router;