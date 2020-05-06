const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const Task=require('./task');
const userSchema=new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique:true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid Email address');
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value != 0 && value < 18) {
                    throw new Error('Age must be a positive integer');
                }
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("password can not be the password");
                }
            }
        },
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }],
        avatar:{
            type:Buffer
        }
    },{
        timestamps:true
    }
)

userSchema.virtual('myTasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:"owner"
})

userSchema.methods.toJSON=function(){
    const user=this;
    const userObject=user.toObject();
    delete userObject.tokens;
    delete userObject.password;
    return userObject;
}

userSchema.methods.generateAuthToken=async function(){
    const user=this;
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
    // user.tokens=user.tokens.concat({token:token});
    user.tokens = user.tokens.concat({token});

    await user.save();
    return token;
}

userSchema.statics.checkCredentials = async(email, password)=>{
    const getUser=await User.findOne({email});
    console.log(getUser);
    if(!getUser){
        throw new Error("User didn't founded");
    }

    const PassOK =await bcrypt.compare(password, getUser.password);

    if(!PassOK){
        throw new Error("Password didn't match");
    }
    return getUser;
}

userSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
})
userSchema.pre('remove',async function(next){
    const user=this;
    await Task.deleteMany({ owner:user._id});
    next();
})
const User = mongoose.model('User', userSchema);


module.exports = User;

