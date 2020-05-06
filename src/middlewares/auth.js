const jwt=require('jsonwebtoken');
const User=require('../modles/user');
const auth=async(req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })//hum dekhe ge ki ye token is still part of token array of that user?
        if (!user) {
            throw new Error();
        }
        req.token=token;
        req.user = user;
        next();
        } catch (e) {
            res.status(401).send("Please Authenticate User");
        }
}
module.exports=auth;