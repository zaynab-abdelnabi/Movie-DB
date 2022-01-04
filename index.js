const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config()

const port = 3000 

// Mongoose

const movieSchema = new mongoose.Schema({
    title: String,
    year: Number, 
    rating: Number
});

const Movie = mongoose.model("Movie", movieSchema);

const users = [
    {
        username: "Admin",
        password: "123456"
    },
    {
        username: "Zaynab",
        password: "123456"
    },
    {
        username: "Ahmad",
        password: "123456"
    }
]

mongoose.connect(`${process.env.DB_URL}`, {useNewUrlParser:true}, err => {
    if (err) throw err;
    console.log("connected successfully");
})

/*
Movie.create({
    title: "Jaws",
    year: 1975,
    rating: 8
})
.then()
.catch(err => console.log(err));

Movie.create({
    title: "Avatar",
    year: 2009,
    rating: 7.8
})
.then()
.catch(err => console.log(err));

Movie.create({
    title: "Brazil",
    year: 1985,
    rating: 8
})
.then()
.catch(err => err => console.log(err));

Movie.create({
    title: 'الإرهاب والكباب',
    year: 1992,
    rating: 6.2
})
.then()
.catch(err => err => console.log(err));
*/


app.get('/test' , (req, res) => {
    res.status(200).status(200).send({status:200,message:"Ok"})
})

app.get('/time' , (req, res) => {
    let date = new Date();
    res.status(200).send({status:200,message:`${date.getHours()}:${date.getMinutes()}`})
})


app.get(['/hello', '/hello/:id'] , (req, res) => {
    res.status(200).send({status:200,message:`Hello, ${req.params.id || "Unknown"}`})
})

app.get('/search' , (req, res) => {
    if(req.query.s){
        res.status(200).send({status:200, message:"ok", data:`${req.query.s}`})
    }
    else{
        res.status(500).send({status:500, error:true, message:"you have to provide a search"} )
    }
})

app.post('/movies/create' , (req, res) => {

    if(!req.query.title){
        if(!req.query.year){
            res.status(403).send({status:403, error:true, message:'you cannot create a movie without providing a title and a year'})
        }
        else{
            res.status(403).send({status:403, error:true, message:'you cannot create a movie without providing a title'})
        }
    }
    
    else if(!req.query.year) {
        res.status(403).send({status:403, error:true, message:'you cannot create a movie without providing a year'})
    }
    
    else if(req.query.year.length != 4 || isNaN(req.query.year)){
        if(isNaN(req.query.year)){
            res.status(403).send({status:403, error:true, message:'The year provided is not a number'})
        }
        else{
            res.status(403).send({status:403, error:true, message:'The year provided is not of 4 digits'})
        }
    }

    else if(req.query.year > new Date().getFullYear() || req.query.year < 1895 ){
        res.status(403).send({status:403, error:true, message:'The year provided is not valid'})
    }
    
    else if(req.query.rating && (req.query.rating > 10 || req.query.rating < 0) ){
        res.status(403).send({status:403, error:true, message:'The rating provided is not valid'})
    }
    
    else {
        Movie.create({
            title: req.query.title,
            year: req.query.year,
            rating: `${req.query.rating || 4}`
        })
        .then(movie => {
            res.status(200).send({status:200, data: movie})
        })
        .catch(err => res.status(422).send(err));
    }
    
})

app.get('/movies/read' , (req, res) => {
    Movie.find()
    .then(movies => {
        res.status(200).send({status:200, data: movies})
    })
    .catch(err => {
        res.status(422).send(err);
    })
})

app.get('/movies/read/by-date' , (req, res) => {
    Movie.find()
    .then(movies => {
        res.status(200).send({status:200, data: movies.sort((a,b) => b.year - a.year)})
    })
    .catch(err => {
        res.status(422).send(err);
    })
})

app.get('/movies/read/by-rating' , (req, res) => {
    Movie.find()
    .then(movies => {
        res.status(200).send({status:200, data: movies.sort((a,b) => b.rating - a.rating)})
    })
    .catch(err => {
        res.status(422).send(err);
    })
})

app.get('/movies/read/by-title' , (req, res) => {
    Movie.find()
    .then(movies => {
        res.status(200).send({status:200, data: movies.sort((a,b) => a.title.localeCompare(b.title))})
    })
    .catch(err => {
        res.status(422).send(err);
    })
})

app.get(['/movies/read/id/:id','/movies/read/id/'], (req, res) => {
    if(req.params.id){
        Movie.findById(req.params.id)
            .then(movie => {
                res.status(200).send({status:200, data: movie})
            })
            .catch(err => {
                res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`})
            })
        
    }
    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }
})

app.put(['/movies/update', '/movies/update/:id'] , (req, res) => {

    if(req.params.id){

        let id = req.params.id;

        if(!req.query.title && !req.query.year && !req.query.rating){
            res.status(404).send({status:404, error:true, message:`Enter the data you want to update`})
        }

        else if(req.query.year && ( req.query.year > new Date().getFullYear() || req.query.year < 1895 || req.query.year.length != 4 || isNaN(req.query.year) )){
            res.status(403).send({status:403, error:true, message:'The year provided is not valid'})
        }
        
        else if(req.query.rating && (isNaN(req.query.rating) || req.query.rating >10 || req.query.rating < 0)){
            res.status(403).send({status:403, error:true, message:'The rating provided is not valid'})
        }

        else{

            Movie.findById(id)
            .then(movie => {

                Movie.findOneAndReplace({_id: id}, {
                    title : `${req.query.title || movie.title}`,
                    year : `${req.query.year || movie.year}`,
                    rating : `${req.query.rating || movie.rating}`
                })

                    .then(updatedMovie => {
                        if(!updatedMovie) return res.status(404).send();
                        
                        Movie.find()
                            .then(movies =>{
                                res.status(200).send({status:200, data: movies})
                            })
                            .catch(err => {
                                res.status(422).send(err);
                            })

                    })

                    .catch(err => {
                        res.status(422).send(err);
                    })

            })
            .catch(err => {
                res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`})
            })
            
        }
    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }

})

app.delete(['/movies/delete/:id','/movies/delete'] , (req, res) => {
    if(req.params.id){
        Movie.findOneAndDelete({_id: req.params.id})
            .then(deletedMovie => {
                if(!deletedMovie) return res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`});
                Movie.find()
                    .then(movies => {
                        res.status(200).send({status:200, data: movies})
                    })
                    .catch(err => {
                        res.status(422).send(err);
                    })
            })
            .catch(err => {
                res.status(422).send(err);
            })
    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }

})

// User CRUD app

app.get('/users/read' , (req, res) => {
    res.status(200).send({status:200, data: users.map(user => {
        return user.username;
    })})
})

app.post('/users/create' , (req, res) => {

    if(!req.query.username){
        if(!req.query.password){
            res.status(403).send({status:403, error:true, message: 'you cannot create a new user without providing a username and password'})
        }
        else{
            res.status(403).send({status:403, error:true, message: 'you cannot create a new user without providing a username'})
        }
    }
    
    else if(!req.query.password) {
        res.status(403).send({status:403, error:true, message: 'you cannot create a new user without providing a password'})
    }
    
    else if(users.map(user => user.username).includes(req.query.username)){
        res.status(403).send({status:403, error:true, message: 'username is already exist'})
    }

    else {

        let user = {
            username: req.query.username,
            password: req.query.password
        }

        users.push(user)

        res.status(200).send({status:200, data: users.map(user => {
            return user.username;
        })})

    }
    
})

app.delete(['/users/delete/:username/:password','/users/delete'], (req, res) => {
    
    
    if(req.params.username && req.params.password){
        let nbOfUsers = users.length
        users.map(( user , index ) => {
            if(user.username === req.params.username){
                if(user.password === req.params.password){
                    users.splice(index, 1)
                    res.status(200).send({status:200, data: users.map(user => {
                        return user.username;
                    })})
                }
                else {
                    res.status(404).send({status:404, error:true, message:`username and password are not matching`})
                    nbOfUsers--
                }
                
            }
        })
        if(nbOfUsers === users.length){
            res.status(404).send({status:404, error:true, message:`The user doesn't exist`})
        }

    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the username and the password of the user you want to delete`})
    }

})

app.put(['/users/update','/users/update/:username','/users/update/:password', '/users/update/:username/:password'] , (req, res) => {

    if(req.params.username && req.params.password){


        if(!req.query.newusername && !req.query.newpassword){
            res.status(404).send({status:404, error:true, message:`Enter the new data you want to update`})
        }

        else{

            let newUser = {
                username : `${req.query.newusername || req.params.username}`,
                password : `${req.query.newpassword || req.params.password}`
            }

            let changed = false

            users.map(( user , index ) => {
                if(user.username === req.params.username){
                    if(user.password === req.params.password){
                        users.splice(index, 1, newUser)
                        res.status(200).send({status:200, data: newUser})
                        changed = true
                    }
                    else {
                        res.status(404).send({status:404, error:true, message:`username and password are not matching`})
                    }
                    
                }
            })
            if(!changed){
                res.status(404).send({status:404, error:true, message:`couldn't find username`})
            }
            
        }
    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the username and password of the user you want to update`})
    }

})


app.get("/", (req, res) => {
  res.status(200).send('Ok')
})

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`)
})