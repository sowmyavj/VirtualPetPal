const MongoClient = require("mongodb").MongoClient;
const uuidv1 = require('uuid/v4');
const users = "usersDataColl";
const pets = "petsDataColl";
const userPets = "userPetsDataColl";


const settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "effugio"
    }
};

//NM - added email
var makeDoc = function (user_id, name, hashedPassword, email, points, pets) {
    return {
        //_id: uuidv1(),
        user_id: user_id,
        name: name,
        hashedPassword: hashedPassword,
        email: email,
        points: points,
        pets: pets

    }
};

var makePetDoc = function ( name, typeOfPet, gender, noOfTimesToFeed,noOfTimesToWalk, photoIds,testimonials){
    return {
        pet_id: uuidv1(),
        name: name,
        typeOfPet : typeOfPet,
        gender : gender,
        noOfTimesToFeed:noOfTimesToFeed,
        noOfTimesToWalk: noOfTimesToWalk,
        photoIds:photoIds,
        testimonials:testimonials
    }
};
var makeUserPetDoc = function ( user_id, pet_id, noOfTimesFed,noOfTimesWalked, happinessLevel, currentDate){
    return {
        user_id: user_id,
        pet_id: pet_id,
        noOfTimesFed:noOfTimesFed,
        noOfTimesWalked: noOfTimesWalked,
        happinessLevel:happinessLevel,
        currentDate: currentDate
    }
};

let fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;


async function runSetup1() {

    // create db connection
    const db = await MongoClient.connect(fullMongoUrl);

    await db.dropDatabase();

    userCollection = await db.createCollection(users);
    petCollection = await db.createCollection(pets);
    userPetCollection = await db.createCollection(userPets);

    var userJack = makeDoc("jack_d", "Jack Dawson", "","jack_d@gmail.com", 100, []);
    userJack.hashedPassword = "$2a$16$mEbkQxGZt3a/qidjcCb6O..ah9yyDlGRj2lWpSK/ebQJJjSp1ISmS";
    userJack._id ="245b3e48-f959-464b-9615-b07d187d78a8";
    
    //password: password

    var userRose = makeDoc("rose_d", "Rose Dewitt", "","rose_d@gmail.com",
     200, []);
    userRose.hashedPassword = "$2a$16$biOzgZ.pj1lMO.sRg5MFZuAXLm5FCiWIuDu3hBO6.QXlEwrImJ28W";
    userRose._id="fc650072-441c-43f0-b50d-d681294488c5";    
    //password: password2

    userlily = makeDoc("lilly", "Lilly Evans", "","lilly_evans123@gmail.com",
     100, []);
    userlily._id="ea8cbd84-3e7f-48e6-a728-9fa314e943a1";
    userlily.hashedPassword = "$2a$16$KJmxifBk6RayA7SmsXyhcuKqQNv.uaxwy/krRtuUODQ6VhqhV1biC";
    //password: password5

    usermartina = makeDoc("martina", "Martina Navratilova", "","martina_nav123@gmail.com", 250, []);
   // usermartina.hashedPassword = "$2a$16$KJmxifBk6RayA7SmsXyhcuKqQNv.uaxwy/krRtuUODQ6VhqhV1biC";
    usermartina._id="03aad18c-f71d-4593-945b-56a878264504";
    

    usermary = makeDoc("mary", "Mary Morgan", "",
        "mary657@gmail.com", 120, []);
    usermary._id="33aad18c-f41d-4593-945b-56a378264504";
        

    /* userjamesdean = makeDoc("jamesd", "James Dean", "", "11/27/1989","james_dean@gmail.com", 300, []);
    userjamesdean.hashedPassword = "$2a$16$QIKZ.4E5fQ/SMViy2R4YpOtdd1OG.oWboEa8eYGwdkS1coFUJ/GRS";
    userjamesdean._id="97bya930-167d-453a-9513-b6da678c2c9b"; */
    
    //password: password3

        

   /*  userthomas = makeDoc("thomas", "Tom Marvolo", "", "11/27/1989",
        "tom.riddle@gmail.com", 220, []);
    userthomas.hashedPassword = "$2a$16$Gyci2gGIPlr3lsAAuel.hOEK97aLjCqFaYE56RDURWdspHRiEUdTO";
    userthomas._id="9de813e6-fc51-422f-98e2-49b4316d2788"; */
    
    //password: password4


    usersList = [];
    usersList.push(userJack);
    usersList.push(userRose);
    usersList.push(userlily);
    usersList.push(usermary);
    usersList.push(usermartina);
   // usersList.push(userjamesdean);
   // usersList.push(userthomas);
  

    res = await userCollection.insertMany(usersList);
    usersins = await userCollection.find().toArray();

    //Pet collection
    var pet1 = makePetDoc('Tom', "Cat","M", 3,0,["4.jpg"],[])
    var pet2 = makePetDoc('Pluto', "Dog","M", 5,1,["1.jpg"],[])
    var pet3 = makePetDoc('Comet', "Dog","M", 5,1,["2.jpg"],[])

    var pet4 = makePetDoc('Charm', "Dog","F", 3,2,["3.jpg"],[])
    var pet5 = makePetDoc('Hero', "Cat","M", 4,0,["5.jpg"],[])
    var pet6 = makePetDoc('Felicity', "Cat","F", 3,0,["6.jpg"],[])

    petsList = [];
    petsList.push(pet1);
    petsList.push(pet2);
    petsList.push(pet3);

    petsList.push(pet4);
    petsList.push(pet5);
    petsList.push(pet6);

    res2 = await petCollection.insertMany(petsList);
    pets_res = await petCollection.find().toArray();
    console.log(pets_res);

    //makeUserPetDoc( user_id, pet_id, noOfTimesFed,noOfTimesWalked, happinessLevel, currentDate)

    var user1Pet1= await makeUserPetDoc(userJack._id, pet1.pet_id, 2, 0, 10, new Date() );
    var user1Pet2= await makeUserPetDoc(userJack._id, pet2.pet_id, 3, 1, 50, new Date() );
    var user2Pet1= await makeUserPetDoc(userRose._id, pet1.pet_id, 2, 0, 10, new Date() );
    var user3Pet1= await makeUserPetDoc(userlily._id, pet1.pet_id, 0, 0, 10, new Date() );

    userPetList=[];

    userPetList.push(user1Pet1);
    userPetList.push(user1Pet2);
    userPetList.push(user2Pet1);
    userPetList.push(user3Pet1);
    console.log(userPetList);

    return usersins;

}


var exports = module.exports = runSetup1;