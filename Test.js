// const express=require('./express-like/express')
var express = require('express');
const app=express()
app.use((rq,rs,next)=>{
    console.log("请求开始",rq.method,rq.url)
    next()
})
app.use((rq,rs,next)=>{
    console.log("处理cookie")
    rq.cookie={
        userId:"123"
    }
    next()
})
app.use("/api",(rq,rs,next)=>{
    console.log("处理/api")
    next()
})
app.get("/api",(rq,rs,next)=>{
    console.log("GET/api")
    next()
})
function Login(rq,rs,next){
    setTimeout(()=>{
        console.log("登陆成功")
        next()
    })
}
app.get("/api/get-cookie",Login,(rq,rs,next)=>{
    console.log("GET/api/get-cookie")
    rs.json({
        errno:0,
        data:rq.cookie
    })
})
app.listen(8000,()=>{
    console.log("端口打开成功")
})