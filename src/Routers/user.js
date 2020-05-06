const express=require('express');
const auth=require('../middlewares/auth');
const router=new express.Router();
const User = require('../modles/user');
const bcrypt=require('bcryptjs');
const multer=require('multer');
const{SendWelcome,sendCancel}=require('../emails/account');

router.post('/users', async (req, res) => {
    // Sign Up Req.
    const user = new User(req.body);
    try {
        await user.save();
        
        const token = await user.generateAuthToken();
        SendWelcome(user.email, user.name);
        res.status(201).send({user,token});
    }
    catch (error) {
        console.log(error);
        res.status(400).send();
    }

})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.post('/users/login', async (req,res)=>{
    try{
        const loggedIn=await User.checkCredentials(req.body.email, req.body.password);
        const token=await loggedIn.generateAuthToken();
        res.send({loggedIn,token});
    }
    catch(error){
        console.log(error);
        res.status(400).send();
    }
    
})

router.patch('/users/me',auth, async (req, res) => {
    const allowedUpdates = ['name', 'password', 'email', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValidOperation) {
        return res.status(400).send('Error! Invalid Updates!!');
    }
    try {
        updates.forEach((update)=>{
            req.user[update]=req.body[update];
        })
        await req.user.save();
        res.send(req.user);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})

router.post('/user/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.status(200).send("User is loged out of all other devices");
    } catch(e){
        res.status(500).send("Unable to Logout user from all other devices");
    }
})

router.post('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.status(200).send("User Logged Out successssfullly");
    } catch(e){
        res.status(500).send("User is unable to logged out");
    }
    
})

router.delete('/users/me',auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancel(req.user.email,req.user.name);
        res.send(req.user);
    }
    catch (error) {
        res.status(500).send(error);
    }
})
const upload=multer({
    // dest: 'avatars',
    limit:{
        fileSize:10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('File Should be an image'));
        }
        cb(undefined,true);
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    req.user.avatar=req.file.buffer;
    await req.user.save()
    res.send('Image Uploaded');
},(error,req,res,next)=>{
    res.send({error:error.message});
})
router.delete('/users/me/avatar',auth,async(req,res)=>{
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send("Image deleted");
    } catch(e){
        res.status(400).send(e.message);
    }
})
router.get('/users/:id/avatar',async(req,res)=>{
    const id=req.params.id;
    try{
        const user = await User.findById(id);
        if(!user || !user.avatar){
            throw new Error("User di photo haini");
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    } catch(e){
        res.status(404).send();
    } 
})
module.exports=router;