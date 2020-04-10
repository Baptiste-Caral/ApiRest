require('babel-register')
const mysql = require('mysql')


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
        db.query('SELECT * FROM members', (err, result) => {
            if (err)
                console.log(err.message);
            else {
                console.log(result[0].name);
                
            }

            
        })
    }
        
    
})