const http=require('http');
const slice=Array.prototype.slice;

class Express{
    constructor(){
        this.routes={
            all:[],
            get:[],
            post:[],
        }
    }
    //收集路径信息 和 中间件信息
    register(path){
        const info={} //存放中间件对象
        if(typeof path ==='string') //如果第一个参数存放的是路径
        {
            //如果第一个参数是路径
            info.path=path
            //stack存放所有中间件 
            info.stack=slice.call(arguments,1)  //取其他所有的参数 放到stack数组中
        }
        else{ 
            info.path='/'
            info.stack=slice.call(arguments,0) //如果参数当中没有给定路径 则默认设置为根路径
        }
        return info
    }

    use(){
        const info=this.register.apply(this,arguments)
        this.routes.all.push(info)  //使用了 use方法 则将路由信息info放到 all数组中
    }
    get(){
        const info=this.register.apply(this,arguments)
        this.routes.get.push(info)
    }
    post(){
        const info=this.register.apply(this,arguments)
        this.routes.post.push(info)
    }
    //匹配哪些路由需要执行哪些不需要
    match(method,url)
    {
        console.log('----------->>>>>>>>>..')
        let stack=[]
        if (url==='/favicon.ico'){ //如果路径信息是这个 则跳过
            return stack
        }   
        //获取routes
        let curRoutes=[]
        curRoutes=curRoutes.concat(this.routes.all) 
        curRoutes=curRoutes.concat(this.routes[method])//this.routes.get or post
         console.log('curRoutes:',curRoutes)
        curRoutes.forEach(routeInfo=>{ 
            if(url.indexOf(routeInfo.path)===0){
                stack=stack.concat(routeInfo.stack)
            }
        })
        return stack
    }

    //实现next机制
    handle(rq,rs,stack){
        console.log('--->')
        const next= ()=>{
            //拿到第一个匹配的中间件
            const middleware=stack.shift()
            if(middleware){
                //执行中间件
                middleware.call(rq,rs,next())
            }
        }
        next()
    }
    callback(){
        //callback函数执行成功 
        //call函数调用有问题 这个函数似乎不会被调用
        return (rq,rs)=>{
            rs.json=(data)=>{
                // express 默认不接受json
                rs.setHeader('Content-type','application/json')
                rs.end(
                    JSON.stringify(data)
                    )
            } 
            // 识别哪些中间件执行
            const url=rq.url
            const method=rq.method.toLowerCase()
            //识别出需要执行的中间件
            const resultList=this.match(method,url)
            console.log(resultList)
            this.handle(rq,rs,resultList)
        }
    }
    listen(...args){
          const server=http.createServer(
            function(rq,rs){
                console.log(rq,rs)
                rs.json=(data)=>{
                    // express 默认不接受json
                    rs.setHeader('Content-type','application/json')
                    rs.end(
                        JSON.stringify(data)
                        )
                } 
                // 识别哪些中间件执行
                const url=rq.url
                const method=rq.method.toLowerCase()
                //识别出需要执行的中间件
                const resultList=this.match(method,url)
                console.log(resultList)
                this.handle(rq,rs,resultList)
            }  

          )
          server.listen(...args)
    }
}


module.exports=()=>{
    return new Express()
}