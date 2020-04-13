// Modules
const express = require('express') // framework Back-end JS
const bodyParser = require('body-parser')
const morgan = require('morgan')('dev') // debug tool
const twig = require('twig')
const axios = require('axios')
// variables globales

const app = express()
const port = 8081
const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
  });  

// Middlewares

app.use(morgan) // debug tool => requests displaying in console (dev only)
app.use(express.json()) // for parsing application/json https://expressjs.com/fr/4x/api.html#req.body:
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

console.log(__dirname)


// Routes

// Page D'acceuil:
app.get('/', (req, res) => {
    res.redirect('/members')
})
// Page qui récupére TOUS les membres:
app.get('/members', (req, res) => {
    fetch.get('/members')
    .then((response) => {
        if (response.data.status == 'success') {
            res.render('members.twig', {
                members: response.data.result
            })

        } else {
            renderError(res, response.data.message)
        }

    })
    .catch((err) => {
        renderError(res, err.message)
        
    })
})
// Page qui récupére un membre avec son id:
app.get('/members/:id', (req, res) => {
    fetch.get('/members/'+req.params.id)
    .then((response) => {
        if (response.data.status == 'success') {
            res.render('member.twig', {
                member: response.data.result
            }) 
        } else {
                renderError(res, response.data.message)
            }
    })
    .catch((err) => renderError(res, err.message))
})
// Page qui modifie un membre: 
app.get('/edit/:id',(req, res) => {
    fetch.get('/members/'+req.params.id)
    .then((response) => {
        if (response.data.status == 'success') {
            res.render('edit.twig', {
                member: response.data.result
            }) 
        } else {
                renderError(res, response.data.message)
            }
    })
    .catch((err) => renderError(res, err.message))
})
// Méthode qui modifie un membre
app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'put', {
        name: req.body.name,        
    }, res, () => {
        res.redirect('/members')
    })
})
// Méthode pour supprimer un membre

app.post('/delete', (req, res) => {
    apiCall('/members/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/members')
    })
})

// Page pour ajouter un membre

app.get('/insert', (req, res) => {
    res.render('insert.twig') 
})
// Méthode pour ajouter un membre

app.post('/insert', (req, res) => {
    apiCall('/members', 'post', {name: req.body.name}, res, (result) => {
        res.redirect('/members')
    })
})
// Lancement de l'application
app.listen(port, () => console.log('Started on port: ' + port))


// Fonctions

function renderError(res, errMsg) {
    res.render('error.twig', {
        errorMsg: errMsg
    })
}
function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    }).then((response) => {
        if (response.data.status == 'success') {
            next(response.data.result)
        } else {
            renderError(res, response.data.message)
        }
    })
    .catch((err) => renderError(res, err.message))
}