import pg from "pg"
const {Pool} =pg 
import {drizzle} from 'drizzle-orm/node-postgres'
import {
    pgTable,
    text,
    numeric,
    timestamp,

}from 'drizzle-orm/pg-core';


const connectionString =process.env.DATABASE_URL;
if (!connectionString){
    console.warn('DATABASE_URL is not set. Postgres connection will not be established');
}

pg.types.setTypeParser(1016, val =>val);
pg.types.setTypeParser(1009, val =>val);

export const pool =new Pool({
    connectionString,
    ssl:connectionString ?{
        rejectUnauthorized:false
    }:undefined
});

export const db=drizzle(pool);


export const testConnection =async ()=>{
    try {
        const client =await pool.connect()
        client.release();
        console.log("postgres pool connected")
    } catch (error) {
        console.warn('postgres connection test failed:' , error ?.message || error)
    }
}
