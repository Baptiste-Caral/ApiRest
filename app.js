const {success, error} = require('./functions'); // success() & error() created at 'functions.js'
const express = require('express'); // framework Back-end JS
const morgan = require('morgan'); // debug tool
const app = express();

// Tableau des membres (Provisoire)
const members = [
    {
        id: 1,
        name: 'John'
    },
    {
        id: 2,
        name: 'Jack'
    },
    {
        id: 3,
        name: 'Flash'
    },
]

app.use(morgan('dev')) // debug tool => requests displaying in console (dev only)
app.use(express.json()) // for parsing application/json https://expressjs.com/fr/4x/api.html#req.body:
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// RECUPERE UN MEMBRE AVEC SON ID - READ
app.get('/api/v1/members/:id', (req, res) => {

    let index = getIndex(req.params.id) // getIndex(id) sert à voir si l'ID existe

    if (typeof(index) == 'string') { // si c'est une string (Wrong Id) -> l'id n'existe pas
        res.json(error(index))
    } else {
        res.json(success(members[index])) // renvoi le membre en fonction de son id 'req.params.id'
    }
    
})
// RECUPERE TOUS LES MEMBRES - READ
app.get('/api/v1/members/', (req, res) => {
    // affiche le nombre de membre demandé dans l'url avec le param ?max=
    // /api/v1/members?max=2 affiche les 2 premiers membres 
    if (req.query.max != undefined && req.query.max > 0) {
        res.json(success(members.slice(0, req.query.max)))

    }
    else if (req.query.max != undefined) {
        res.json(error('Wrong max value'))

    }
    // sinon => affiche TOUS les Membres
        else {
            res.json(success(members)) //  success() créee dans functions.js
        }
    
    
    res.send(members)
})
// MODIFICATION D'UN MEMBRE - UPDATE

// AJOUT D'UN NOUVEAU MEMBRE - CREATE
app.post('/api/v1/members', (req, res) => {
    // req.body.name = nom inseré par l'user

    if (req.body.name) {

        let sameName = false // on initialise sameName à false
        // VERIFICATION
        // on verifie d'abord avec le for si le nom existe, si oui =>  on passe sameName à true
        for (let i =0; i < members.length; i++) {
            if (members[i].name == req.body.name) {
                sameName = true // sameName devient true, ça va servir plus bas pour renvoyer l 'erreur
                break
            }
        }
        // ERREUR
        if (sameName) {// si sameName = true (c'est le cas si dans la boucle au dessus name existe dèjà)
            res.json(error('name already taken')) // alors on renvoi une erreur
            
        } else{
        // AJOUT
            
            let member = {
                id: members.length+1,
                name: req.body.name
            }
            members.push(member) // ajoute l'objet member (id+name) dans le tableau members
            res.json(success(member)) // renvoi en réponse le nouveau membre 'member'
        }
    } else {
        res.json(error('no name value')) // renvoi une erreur si 'req.body.name' est false
    }
})
// APP WORKS ON PORT 8080
app.listen(8080, () => {
    console.log('Started on port 8080');  
})
// 
function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id) {
            return i
        }   
    }
    return 'Wrong id'
}