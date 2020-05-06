# task-manager-api
In this u can create a new user and that particular user can create particular tasks.
The user who created the task is allowed to delete, read or modifiy the particular tasks which are created by that particular user.
For Authentication of user I used here JSON WEB Tokens.
To run the application go to terminal and type "npm run dev".
Please set the environment variables of your own
To set the environment variables
1. Create a directory Config
2. Create a file under Config as dev.env
3. Set the environment variables there as key value pair as
PORT=3000
SENDGRID_API='YOUR SEND GRID API'
MONGODB_URL=mongodb://127.0.0.1:27017/task-manager-api
JWT_SECRET='YOUR APP SECRET KEY'
