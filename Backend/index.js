import "dotenv/config";
import express from "express"
const server = express();

//=====Middelwares=====
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/server",(req,res)=>{
    res.send("hello Namdev")
})
const port = process.env.PORT;
server.listen(port,()=>{
    console.log(`server is live on port ${port}`);
})