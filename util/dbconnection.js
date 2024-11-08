const pg=require('pg');
const env = require('dotenv');
module.exports=new pg.Client({
    host:env.PG_HOST,
    database:env.PG_DB,
    password:env.PG_PASSWORD,
    port:env.PG_PORT,
    user:'postgres'
})


