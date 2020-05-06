const express=require('express');
require('./db/mongoose');

const app=express();


app.use(express.json());
const port=process.env.PORT;

const userRouters = require('./Routers/user');
const taskRouters = require('./Routers/task');

app.use(userRouters);
app.use(taskRouters);

app.listen(port,()=>{
    console.log('Server is listening on port '+port);
})
