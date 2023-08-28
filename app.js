const express = require('express');
const app = express();
app.get("/",(req,res)=>{
    res.send("hiiiii");
});

const PORT = 3000;
app.listen(PORT,()=>{
    console.log("call port");
})