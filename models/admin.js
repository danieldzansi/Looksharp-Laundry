import {pgTable,text} from "drizzle-orm/pg-core"

const admin=pgTable('admin',{
    email :text ("email").notNull().unique(),
    password:text("password").notNull().unique(),
});


export default admin