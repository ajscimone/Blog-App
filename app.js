var bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose"),
    express         = require("express"),
    expressSanitizer= require("express-sanitizer"),
    app             = express();


// APP CONFIG
mongoose.connect("mongodb://localhost/blog_app", {useMongoClient: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
  res.redirect("/blogs"); 
});


//INDEX Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if (err){
            console.log(err);
        }
        else{
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW Route
app.get("/blogs/new", function(req, res){
            res.render("new");
});

//CREATE Route
app.post("/blogs", function(req, res){
    
        //sanitizing the body will allow for users to enter HTML but prevent them from using a script tag
        req.body.blog.body = req.sanitize(req.body.blog.body); 
           Blog.create(req.body.blog, function(err, newBlog){
               if(err){
                   res.render("new");
               }
               else{
                   res.redirect("blogs");
               }
           });
});

//SHOW Route
app.get("/blogs/:id", function(req, res){
    
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/");
        }
        else{
            res.render("show", {blog:foundBlog});
        }
    })
});

//EDIT route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + blog._id;
         res.redirect(showUrl);
       }
   });
});

//DESTROY
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
           console.log(err);
       } else {
         res.redirect("/blogs");
       }
   });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is Listening");
})