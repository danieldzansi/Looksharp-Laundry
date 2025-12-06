


export const admin=pgTable('admin',{
    email :text ("email").notNull().unique(),
    password:text("password").notNull().unique(),
});
