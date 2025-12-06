import {defineConfig} from 'drizzle-kit'

import * as dotenv from 'dotenv'

dotenv.config({path:path.resolve(__dirname,'.env')})

export default defineConfig({
    dialect:'postgressql',
    schema:['./db/index.js',''],
    out:'./drizzle',
    dbCredentials:{
        url:process.env.DATABASE_URL
    },
});