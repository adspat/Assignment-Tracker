import jwt from 'jsonwebtoken'
import config from '../config/config.js';
import express from 'express'

function userAuth(req,res,next){
    const {token} = req.cookies ;
    if(!token){
        return res.status(401).json({
            success : false ,
            message : "Not Authorized Login again"
        })
    }

    try {
        const decodedToken = jwt.verify(token,config.JWT_SECRET);

        if(decodedToken.id){
            req.userId = decodedToken.id;
        }else{
            return res.status(401).json({
            success : false ,
            message : "Not Authorized Login again"
        })
        }

        next();
    } 
    catch (error) {
        console.log(error);
        return res.status(401).json({
        success : false ,
        message : "Session expired or invalid. Please log in again."
        })
    }
}

export default userAuth ;