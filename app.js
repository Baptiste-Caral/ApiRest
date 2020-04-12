const {success, error, checkAndChange} = require('./assets/functions'); // success() & error() created at 'functions.js'
const express = require('express') // framework Back-end JS
// const expressOasGenerator = require('express-oas-generator') // Swagger documentation
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/swagger.json')
const mysql = require('promise-mysql')
const morgan = require('morgan')('dev') // debug tool
const config = require('./assets/config')

// CONNECT TO DATABASE

mysql.createConnection({
    host:config.db.localhost,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    port: config.db.port
}).then((db) => {
    
    console.log('Connected');
        
        const app = express()
        // expressOasGenerator.init(app, {})
        let MembersRouter = express.Router() // /api/v1/members
        let Members = require('./assets/classes/members-class')(db, config)
        app.use(morgan) // debug tool => requests displaying in console (dev only)
        app.use(express.json()) // for parsing application/json https://expressjs.com/fr/4x/api.html#req.body:
        app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
        app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)) // documentation

        MembersRouter.route('/:id')

            // GET A MEMBER WITH IS ID - READ
            .get(async (req, res) => {                
                let member = await Members.getById(req.params.id)
                res.json(checkAndChange(member))                
            })
            // MODIFY A MEMBER - UPDATE

            .put(async(req,res) => {
                let updateMember = await Members.update(req.params.id, req.body.name)
                res.json(checkAndChange(updateMember))
            })

            // DELETE A MEMBER - DELETE

            .delete(async (req, res) => {

                let deleteMemebers = await Members.delete(req.params.id)
                res.json(checkAndChange(deleteMemebers))
            })

        MembersRouter.route('/') // => /api/v1/members
        
            // GET ALL MEMBERS - READ
            .get(async (req, res) => {
                let allMembers = await Members.getAll(req.query.max)
                res.json(checkAndChange(allMembers))
            })

            // ADD A NEW MEMBER - CREATE
            .post(async (req, res) => {
                // req.body.name = nom inseré par l'user
                let addMember =  await Members.add(req.body.name)
                res.json(checkAndChange(addMember))
            })

        // CREATION ROUTE MEMBERS
        // rootAPI is in config.json file
        app.use(config.rootAPI+'members', MembersRouter) // MembersRouter = /api/v1/members    

        // APP WORKS ON PORT 8080
        app.listen(config.port, () => {
            console.log('Started on port '+config.port);  
        })

}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
