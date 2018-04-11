const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const usersList = mongoCollections.users;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));

let exportedMethods = {

    //Get the user based on user id - useful in login
    async  getUserbyEmail(emailId) {
        if (!emailId) throw "You must provide an email id to search for a user";

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ email: emailId }).limit(1).toArray();
        if (listOfUsers.length === 0) return null;

        return listOfUsers[0];
    },

    //Get the user based on uuid _id
    async  getUser(_id) {
        if (!_id) throw "You must provide an id to search for a user";

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ _id: _id }).limit(1).toArray();
        if (listOfUsers.length === 0) throw "Could not find user with username " + _id;

        return listOfUsers[0];


    },

    //Get all users in the system
    async getAllUsers() {

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find().toArray();


        allusers = [];
        oneUser = {};

        //NM - Corrected spelling of orientation, added email and contact_info attributes
        for (var val of listOfUsers) {
            oneUser = {};
            oneUser._id = val._id;
            oneUser.user_id = val.user_id;
            oneUser.name = val.name;
            oneUser.hashedPassword = val.hashedPassword;
            oneUser.email = val.email;
            oneUser.points = val.points;
            oneUser.pets = val.pets;

            allusers.push(oneUser);
        }

        return allusers;
    },
    async addUser(user, password) {

        const userCollection = await usersList();

        const newUser = {
            _id: uuidv1(),
            user_id: user.user_id,
            hashedPassword: "",
            name: user.name,
            email: user.email,
            points: user.points,
            pets: user.pets
        };


        const hash = await bcrypt.hashAsync(password, 16.5);

        newUser.hashedPassword = hash;


        //console.log(newUser);
        const newInsertInformation = await userCollection.insertOne(newUser);
        const newId = newInsertInformation.insertedId;
        //console.log("inserted: "+newId);
        return await this.getUser(newId);
    },
    async updateUser(user) {

        oldUser = await this.getUser(user._id);
        const updatedUser = {
            _id: oldUser._id,
            user_id: oldUser.user_id,
            name: oldUser.name,
            email: oldUser.email,
            hashedPassword: oldUser.hashedPassword,
            points: oldUser.points,
            pets: oldUser.pets,


        };
        if (user.name != null) {
            updatedUser.name = user.name;
        }

        if (user.email != null) {
            updatedUser.email = user.email;
        }
        
        //NM - Added update password functionality on My Profile page
    
        if ((user.newPwd !== null) && (user.newPwd.length>0)){
            //console.log("Inside data module updateUser method's Password Update check");
            const hash = await bcrypt.hashAsync(user.newPwd, 16.5);
            updatedUser.hashedPassword = hash;
        }


        const userCollection = await usersList();
        output = await userCollection.updateOne({ _id: updatedUser._id }, updatedUser);
        return await this.getUser(updatedUser._id);
    },

    //remove user
    async removeUser(id) {
        const userCollection = await usersList();
        const deletionInfo = await userCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
            return null;
        }
        return deletionInfo.deletedCount;
    },

    //compare the passwords
    async comparePassword(password, hash) {
        result = await bcrypt.compareAsync(password, hash);
        return result;
    }

}

module.exports = exportedMethods;