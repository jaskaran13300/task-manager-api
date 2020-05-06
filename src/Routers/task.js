const express = require('express');
const task = require('../modles/task');
const router = new express.Router();
const auth=require('../middlewares/auth');
const User=require('../modles/user');

router.post('/tasks',auth, async (req, res) => {
    const taskk=new task({
        ...req.body,
        owner:req.user._id
    });
    try {
        await taskk.save();
        console.log("Task added SucessfulllYY");
        return res.status(201).send(taskk);
    }
    catch (error) {
        res.status(400);
        return res.send(error.message);
    }
})
//  /tasks?sortBy=name:asc
// server side pagination
router.get('/tasks',auth, async (req, res) => {
    const match={}
    let sort={};
    let parts=[]
    if(req.query.sortBy){
        parts = req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1;
    }

    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    try {
        await req.user.populate({
            path:'myTasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.myTasks);
    }
    catch (error) {
        console.log(error);
        res.status(500);
        return res.send();
    }
})

router.get('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const particularTask = await task.findOne({_id,owner:req.user._id});
        if (!particularTask) {
            return res.status(404).send();
        }
        console.log(particularTask);
        return res.send(particularTask);
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
})


router.patch('/tasks/:id',auth, async (req, res) => {
    const allowedUpdates = ['completed', 'description'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((upd) => {
        return allowedUpdates.includes(upd);
    })
    if (!isValidOperation) {
        return res.status(400).send('Error! Invalid Updates!!');
    }
    const _id = req.params.id;
    try {
        const getTask = await task.findOne({_id,owner:req.user._id});
        if (!getTask) {
            return res.status(404).send('No task with this id');
        }
        updates.forEach((update)=>{
            getTask[update]=req.body[update];
        }) 
        await getTask.save();
        // const updated = await task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        return res.send(getTask);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

router.delete('/tasks/:id',auth, async (req, res) => {
    try {
        try{
            const deleted = await task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
            return res.send(deleted);
        }
        catch(e){
            return res.send(e);
        }
    }
    catch (error) {
        return res.status(500).send(error);
    }
})


module.exports=router;