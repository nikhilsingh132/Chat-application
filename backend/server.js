const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Chat = require("./models/chatModel");
const User=require("./models/userModel")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const path = require("path");
const {chats}=require('./data/data')
dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 5000;
const server=app.listen(port,console.log('server started'))
const cors = require("cors")

//enable cors
app.use(cors());

app.use(express.json()); // to accept json data
 app.get("/", (req, res) => {
   res.send("API Running!");
 });
 app.get("/api/chat", async(req, res) => {
  console.log('hello',req.body._id)
  // const fullChat = await Chat.find({ "users": req.body._id });
  
  // console.log(fullChat)
  res.status(200).json(chats);
});
app.get("/api/getAllUsers",async(req,res)=>{
  const allusers=await User.find({});
  // console.log(allusers)
  res.status(400).json({
    message:'all users fetched',
    allusers:allusers
  })
})
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// // --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// // --------------------------deployment------------------------------

// // Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT;



const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chat-verseapp.netlify.app/",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    // if (!chat.users) return console.log("chat.users not defined");

    chat?.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
