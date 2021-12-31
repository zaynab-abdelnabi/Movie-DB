const express = require('express')
const app = express()
const port = 3000

const movies = [
    { title: 'Jaws', year: 1975, rating: 8 },
    { title: 'Avatar', year: 2009, rating: 7.8 },
    { title: 'Brazil', year: 1985, rating: 8 },
    { title: 'الإرهاب والكباب', year: 1992, rating: 6.2 }
]

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

app.get('/movies/create' , (req, res) => {

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
        let newMovie = {
            title: req.query.title,
            year: req.query.year,
            rating: `${req.query.rating || 4}`
        }
        movies.push(newMovie);
        res.status(200).send({status:200, data: movies})
    }
    
})

app.get('/movies/read' , (req, res) => {
    res.status(200).send({status:200, data: movies})
})

app.get('/movies/read/by-date' , (req, res) => {
    res.status(200).send({status:200, data: movies.sort((a,b) => b.year - a.year)})
})

app.get('/movies/read/by-rating' , (req, res) => {
    res.status(200).send({status:200, data: movies.sort((a,b) => b.rating - a.rating)})
})

app.get('/movies/read/by-title' , (req, res) => {
    res.status(200).send({status:200, data: movies.sort((a,b) => a.title.localeCompare(b.title))})
})

app.get(['/movies/read/id/:id','/movies/read/id/' ], (req, res) => {
    if(req.params.id){
        if(Number(req.params.id) >= 0 && req.params.id < movies.length){
            res.status(200).send({status:200, data: movies[req.params.id]})
        }
        else{
            res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`})
        }
    }
    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }
})

app.get(['/movies/update', '/movies/update/:id'] , (req, res) => {

    if(req.params.id){
        
        if(Number(req.params.id) >= 0 && req.params.id < movies.length){

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
                let editedMovie={
                    title : `${req.query.title || movies[req.params.id].title }`,
                    year : `${req.query.year || movies[req.params.id].year}`,
                    rating : `${req.query.rating || movies[req.params.id].rating}`
                }
                movies.splice(req.params.id, 1, editedMovie)
    
    
                res.status(200).send({status:200, data: movies[req.params.id]})
            
            }

        }
        else{
            res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`})
        }
    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }

})

app.get(['/movies/delete/:id','/movies/delete' ] , (req, res) => {
    if(req.params.id){

        if(Number(req.params.id) >= 0 && req.params.id < movies.length){
            movies.splice(req.params.id, 1);
            res.status(200).send({status:200, data: movies})
        }

        else{
            res.status(404).send({status:404, error:true, message:`The movie ${req.params.id} does not exist`})
        }
    }

    else{
        res.status(404).send({status:404, error:true, message:`Enter the id of the movie`})
    }

})

app.get("/", (req, res) => {
  res.status(200).send('Ok')
})

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`)
})