const {success, error} = require('./functions'); // success() & error() created at 'functions.js'
const express = require('express'); // framework Back-end JS
const mysql = require('mysql')
const morgan = require('morgan'); // debug tool
const config = require('./config')

// CONNECT TO DATABASE

const db = mysql.createConnection({
    host:'localhost',
    database: 'nodejs',
    user: 'root',
    password: 'root',
    port: '8889'
})

db.connect((err) => {

    if (err) 
        console.log(err.message);
    
    else {
        console.log('Connected');
        
        const app = express();
        let MembersRouter = express.Router() // /api/v1/members
        app.use(morgan('dev')) // debug tool => requests displaying in console (dev only)
        app.use(express.json()) // for parsing application/json https://expressjs.com/fr/4x/api.html#req.body:
        app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

        MembersRouter.route('/:id')

            // GET A MEMBER WITH IS ID - READ
            .get((req, res) => {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {

                        if (result[0] != undefined) {
                            res.json(success(result[0])) 
                        } else {
                            res.json(error("l'id " + req.params.id+ " n'existe pas"))
                        }
                        
                    }
                })
            })
            // MODIFY A MEMBER - UPDATE

            .put((req,res) => {

                if (req.body.name) {

                    db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                        if (err) {
                            res.json(error(err.message))
                        } else {    
                            // si l'id existe (result[0])
                            if (result[0] != undefined) { 
                                // On teste si le est déjà pris                              
                                db.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                                    if (err) {
                                        // on verifie si il y a une erreur par securité
                                        res.json(error(err.message))
                                    } else {                                        
                                        if (result[0] != undefined) {
                                            res.json(error('same name'))
                                        } else {
                                            // On modifie le nom
                                            db.query('UPDATE members SET name = ? WHERE id =?', [req.body.name, req.params.id], (err, result) => {
                                                if (err) {
                                                    res.json(error(err.message))
                                                } else {
                                                    res.json(success(true))
                                                }  
                                            })
                                        }
                                    }
                                })
                            } else {
                                res.json(error("l'id " + req.params.id+ " n'existe pas"))
                            }                            
                        }
                    })

                } else {
                    res.json(error('no name value'))
                }
            })

            // DELETE A MEMBER - DELETE

            .delete((req, res) => {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {

                        if (result[0] != undefined) {
                            db.query('DELETE FROM members Where id = ?', [req.params.id], (err, result) => {
                                if (err) {
                                    res.json(error(err.message))
                                } else {
                                    res.json(success(true))
                                }                                
                            })
                        } else {
                            res.json(error("l'id " + req.params.id+ " n'existe pas"))
                        }                        
                    }
                })
            })

        MembersRouter.route('/') // => /api/v1/members
        
            // GET ALL MEMBERS - READ
            .get((req, res) => {
                // affiche le nombre de membre demandé dans l'url avec le param ?max=
                // /api/v1/members?max=2 affiche les 2 premiers membres 
                if (req.query.max != undefined && req.query.max > 0) {

                    db.query('SELECT * FROM members LIMIT 0, ?', [req.query.max], (err, result) => {
                        if (err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(result))
                        }
                    })
                } else if (req.query.max != undefined) {
                    res.json(error('Wrong max value'))
                
                } else {
                    db.query('SELECT * FROM members', (err, result) => {
                        if (err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(result))
                        }

                    })
                }
            })

            // ADD A NEW MEMBER - CREATE
            .post((req, res) => {
                // req.body.name = nom inseré par l'user

                if (req.body.name) {

                    // Verifie si le nom existe
                    db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {

                        
                        if (err) {
                            res.json(error(err.message))
                        } else {
                            if (result[0] != undefined) {
                                res.json(error('name already taken'))
                            } else {
                                // ajoute le name dans la bdd
                                db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {

                                    if (err) {
                                    res.json(error(err.message))
                                    } else {
                                        // traitement de la response
                                        // on recupere son id et on renvoi en réponse un success avec l'id + le name
                                        db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {

                                            res.json(success({
                                                id: result[0].id,
                                                name: result[0].name
                                            }))
                                        } )
                                    }
                                })
                            }
                        }
                    })
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
            }          
})