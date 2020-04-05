const {success, error} = require('./functions'); // success() & error() created at 'functions.js'
const express = require('express'); // framework Back-end JS
const morgan = require('morgan'); // debug tool
const app = express();
const config = require('./config')

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
let MembersRouter = express.Router() // /api/v1/members


app.use(morgan('dev')) // debug tool => requests displaying in console (dev only)
app.use(express.json()) // for parsing application/json https://expressjs.com/fr/4x/api.html#req.body:
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

MembersRouter.route('/:id')

    // GET A MEMBER WITH IS ID - READ
    .get((req, res) => {

        let index = getIndex(req.params.id) // getIndex(id) sert à voir si l'ID existe

        if (typeof(index) == 'string') { // si c'est une string (Wrong Id) -> l'id n'existe pas
            res.json(error(index))
        } else {
            res.json(success(members[index])) // renvoi le membre en fonction de son id 'req.params.id'
        }
        
    })
    // MODIFY A MEMBER - UPDATE

    .put((req,res) => {

        // -- On teste si l'id existe:

        let index = getIndex(req.params.id) // getIndex(id) sert à récuperer l'ID

        if (typeof(index) == 'string') { // si c'est une string (Wrong Id) -> l'id n'existe pas
            res.json(error(index))

        
        } else {
            // -- On teste si le non (name) n'est pas déjà utilisé

            let same = false

            for (let i = 0; i < members.length; i++) {
                if (req.body.name == members[i].name && req.params.id != members[i].id ) {// nom dejà utilisé && même id=>(pour éviter bug si on remplace par le meme nom actuel)   

                    same = true //l'erreur dans le if ci-dessous
                    break
                }
            }
            if (same) {

                res.json(error('same name'))
    
            } else {

            // -- On modifie le nom  
                members[index].name = req.body.name
                res.json(success(true)) // renvoi status: success lorsque le nom a bien été modifié
            }
        }
    })

    // DELETE A MEMBER - DELETE

    .delete((req, res) => {
        
        let index = getIndex(req.params.id);

        if (typeof(index) == 'string') {
            res.json(error(index))
        } else {
            members.splice(index, 1)
            res.json(success(members))
        }
    })

MembersRouter.route('/') // => /api/v1/members
 
    // GET ALL MEMBERS - READ
    .get((req, res) => {
        // affiche le nombre de membre demandé dans l'url avec le param ?max=
        // /api/v1/members?max=2 affiche les 2 premiers membres 
        if (req.query.max != undefined && req.query.max > 0) {
            res.json(success(members.slice(0, req.query.max)))

        } else if (req.query.max != undefined) {
            res.json(error('Wrong max value'))
          
        } else {
           // affiche TOUS les Membres
                res.json(success(members)) //  success() => functions.js folder
            }
    })

    // ADD A NEW MEMBER - CREATE

    .post((req, res) => {
        // req.body.name = nom inseré par l'user

        if (req.body.name) {

            let sameName = false // on initialise sameName à false
            // Vérify
            // on verifie d'abord avec le for si le nom existe, si oui =>  on passe sameName à true
            for (let i =0; i < members.length; i++) {
                if (members[i].name == req.body.name) {
                    sameName = true // sameName devient true, ça va servir plus bas pour renvoyer l 'erreur
                    break
                }
            }
            // Error
            if (sameName) {// si sameName = true (c'est le cas si dans la boucle au dessus name existe dèjà)
                res.json(error('name already taken')) // alors on renvoi une erreur
                
            } else{
            // ADD
                
                let member = {
                    id: createId(), 
                    name: req.body.name
                }
                members.push(member) // ajoute l'objet member (id+name) dans le tableau members
                res.json(success(member)) // renvoi en réponse le nouveau membre 'member'
                
            }
        } else {
            res.json(error('no name value')) // renvoi une erreur si 'req.body.name' est false
        }
    })

// CREATION ROUTE MEMBERS
// rootAPI is in config.json file
app.use(config.rootAPI+'members', MembersRouter) // MembersRouter = /api/v1/members    

// APP WORKS ON PORT 8080

app.listen(config.port, () => {
    console.log('Started on port '+config.port);  
})

function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id) {
            return i
        }   
    }
    return 'Wrong id'
}
// Crée une Id en fonction du dernier membre ayant l'id le plus elevé + 1
// (au cas ou un membre aurait été supprimé)
function createId() {
    
    return members[members.length-1].id + 1 
}