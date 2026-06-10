import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username : {
        type:String,
        required : [true,'username must be required'],
        unique : [true,'username must be unique ']
    },
    email : {
        type:String,
        required : [true,'email must be required'],
        unique : [true,'email must be unique ']       
    },
    password : {
        type : String ,
        required : [true,'password is required']
    },
    role: {
        type: String,
        enum: ['faculty', 'admin'],
        default: 'faculty',
    },
    verifyOtp:{type:String,default:''},
    verifyOtpExpireAt:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOtp:{type:String,default:''},
    resetOtpExpireAt:{type:Number,default:0},
    isLoggedIn : {type:Boolean,default:false},
})

const userModel = mongoose.model('users',userSchema);

export default userModel ;
