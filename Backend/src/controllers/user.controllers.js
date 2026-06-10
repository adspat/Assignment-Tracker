import userModel from '../model/user.model.js'
export async function getUser(req,res){
    const userId = req.userId ;
    if(!userId){
        return res.status(401).json({
            success : false,
            message : "UserId not found"
        })
    }
    try {
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User not found"
            })
        }
        res.status(200).json({
            success : true ,
            userData : {
                name : user.username ,
                email : user.email,
                role: user.role || 'faculty',
                isAccountVerified : user.isAccountVerified,
                isLoggedIn : user.isLoggedIn,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false ,
            message : "there is an error while getting the user data"
        })
    }
}