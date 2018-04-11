const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const userPetsList = mongoCollections.userPets;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));
let exportedMethods = {

    async  addPetToUser(pet_id,user_id) {
        const userPetCollection = await userPetsList();
        const newPetUser = {
            user_id: user_id,
            pet_id: pet_id,
            noOfTimesFed:0,
            noOfTimesWalked: 0,
            happinessLevel:0,
            currentDate: new Date()
        };
        const newInsertInformation = await userPetCollection.insertOne(newPetUser);
        const newId = newInsertInformation.insertedId;
        //console.log("inserted: "+newId);
        return await this.getUserPetById(newId);

    },
    async getUserPet(pet_id,user_id){
        if(!pet_id)
        throw "pet_id is null!"

        if(!user_id)
        throw "user_id is null!"

        const userPetCollection = await userPetsList();

        const listOfUserPet = await userPetCollection.find({ 
            $and: [{user_id: user_id},{pet_id:pet_id}]}).limit(1).toArray();
        if (listOfUserPet.length === 0) return null;

        return listOfUserPet[0];
    },
    async getUserPetById(_id){
        if(!_id)
        throw "_id is null!"

        const userPetCollection = await userPetsList();

        const listOfUserPet = await userPetCollection.find({ _id: _id}).limit(1).toArray();
        if (listOfUserPet.length === 0) return null;

        return listOfUserPet[0];
    },
    async getUserPets(user_id){
        if(!user_id)
        throw "user_id is null!"

        const userPetCollection = await userPetsList();
        const listOfUserPet = await userPetCollection.find({ user_id: user_id}).toArray();
        return listOfUserPet;
    },
    async resetData(){
        const userPetCollection = await userPetsList();
        const listOfUserPet = await userPetCollection.find({ user_id: user_id}).toArray();

    }

}

module.exports = exportedMethods;