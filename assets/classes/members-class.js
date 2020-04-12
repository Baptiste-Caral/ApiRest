
let db, config

module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Members
}

let Members = class {
    
    static getById(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM members WHERE id = ?', [id])
            .then((result) => {
                if (result[0] != undefined) {
                    next(result[0]) 
                } else {
                    next(new Error(config.errors.wrongID))
                }
            })
            .catch((err) => next(err))
        })        
    }
    static getAll(max) {

        return new Promise((next) => {

                
                if (max != undefined && max > 0) {
                // affiche le nombre de membre demandé dans l'url avec le param ?max=
                // /api/v1/members?max=2 affiche les 2 premiers membres 

                    db.query('SELECT * FROM members LIMIT 0, ?',[parseInt(max)])
                        .then((result) => next(result))
                        .catch((err) => next(err))

                } else if (max != undefined) {
                    next(new Error(config.errors.wrongMaxValue))
                
                } else {                    
                    db.query('SELECT * FROM members')
                        .then((result) => next(result))
                        .catch((err) => next(err))
                }
        })
    }
    static add(name) {

        return new Promise((next) => {

              // name = nom inseré par l'user
              // trim() pour supprimer les espaces
              if (name != undefined && name.trim() != '') {
                name = name.trim()
                // Verifie si le nom existe
                db.query('SELECT * FROM members WHERE name = ?', [name])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            // ajoute le nouveau name dans la bdd
                           return db.query('INSERT INTO members(name) VALUES(?)', [name])                            
                        }
                    })
                    .then(() => {
                        // Récupere le membre pour le renvoyer dans la response                     
                        return db.query('SELECT * FROM members WHERE name = ?', [name])
                    })
                    .then((result) => {
                    // traitement de la response
                    // on recupere son id et on renvoi en réponse un success avec l'id + le name
                        next({
                            id: result[0].id,
                            name: result[0].name
                        })                        
                    })
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))// renvoi une erreur si 'name' est false / champs name vide
            }
        })
    }
    static update(id, name) {
        return new Promise((next) => {

            if (name != undefined && name.trim() != '') {
                name = name.trim()
                db.query('SELECT * FROM members WHERE id = ?', [id])
                .then((result) => {

                    // si l'id existe (result[0])
                    if (result[0] != undefined) { 
                        // On teste si le nom est déjà pris 
                        return db.query('SELECT * FROM members WHERE name = ? AND id != ?', [name, id])
                        
                    } else {
                        next((new Error(config.errors.wrongID)))
                    }
                })
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            // On modifie le nom
                            return db.query('UPDATE members SET name = ? WHERE id =?', [name, id])
                        }
                    })
                    .then(() => {
                        next(true)
                    })
                    .catch((err) => next(err))

                db.query('SELECT * FROM members WHERE id = ?', [id], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {    
                                           
                    }
                })

            } else {
                next(new Error(config.errors.noNameValue))
            }
        })
    }
    static delete(id) {
        return new Promise ((next) => {

            db.query('SELECT * FROM members WHERE id = ?', [id])
            .then((result) => {
                if (result[0] != undefined) {
                    return db.query('DELETE FROM members Where id = ?', [id])
                } else {
                    next(new Error(config.errors.wrongID))
                }     
            })
            .then(() => {
                next(true)
            })
            .catch((err) => next(err))
        })
    }
}