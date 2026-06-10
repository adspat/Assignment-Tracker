import dotenv from 'dotenv';

dotenv.config();
if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI not found in environment variables');
}
if(!process.env.JWT_SECRET){
        throw new Error('JWT_SECRET not found in environment variables');
}

if(!process.env.SMTP_USER){
        throw new Error('SMTP USER is not found');
}
if(!process.env.SMTP_PASS){
        throw new Error('SMTP PASS is not found');
}
if(!process.env.SENDER_EMAIL){
        throw new Error('Sender email is not found');
}
const config = {
        MONGO_URI : process.env.MONGO_URI,
        JWT_SECRET : process.env.JWT_SECRET,
        SMTP_USER : process.env.SMTP_USER,
        SMTP_PASS : process.env.SMTP_PASS,
        SENDER_EMAIL : process.env.SENDER_EMAIL,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
}

export default config ;
