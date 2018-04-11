const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const petsList = mongoCollections.pets;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));

let exportedMethods = {

    //Get the user based on user id - useful in login
    async  getPetbyPetId(pet_id) {
        if (!pet_id) throw "You must provide an id to search for a user";

        const petCollection = await petsList();
        const listOfPets = await petCollection.find({ pet_id: pet_id }).limit(1).toArray();
        if (listOfPets.length === 0) return null;

        return listOfPets[0];
    },
    async getPetProfilePic(pet_id){
        const petCollection = await petsList();
        const listOfPets = await petCollection.find({ pet_id: pet_id }).limit(1).toArray();
        if (listOfPets.length === 0) return null;

        //console.log(listOfPets[0].photoIds[0]);

        return(listOfPets[0].photoIds[0]);

    },
    async getAllPets(){
        const petCollection = await petsList();
        const listOfAllPets = await petCollection.find().toArray();
        console.log("listOfAllPets "+listOfAllPets);
        return listOfAllPets;
    }
}

module.exports = exportedMethods;