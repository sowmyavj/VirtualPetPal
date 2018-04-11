const userRoutes = require("./users");

const constructorMethod = (app) => {
    app.use("/users", userRoutes);

    app.use("/",ensureAuthenticated, (req, res) => {
        res.redirect("/users/mypetpage");
	});
	app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//console.log('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}
module.exports = constructorMethod;

