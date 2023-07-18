const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require("openai");

const ModuleRouter = require("./routes/modules");
const TopicRouter = require("./routes/topics");
const ExerciseRouter = require("./routes/exercises");
const ChatMessageRouter = require("./routes/chatMessages");
const UserRouter = require("./routes/users");
const AdminCourseTemplateRouter = require("./routes/admin/courseTemplates");
const AdminClassRouter = require("./routes/admin/classes");
const UserClassRouter = require("./routes/classes");

const app = express();

const serviceAccount = require('./cert.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configuration = new Configuration({
  apiKey: process.env.OPENAPI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.use((req, res, next) => {
  req.openai = openai;
  next();
})

app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader) {
    return next();
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch(e) {
    console.log(e);
    res.status(403).send('Unauthorized');
  }
});

app.use("/api/modules", ModuleRouter);
app.use("/api/topics", TopicRouter);
app.use("/api/exercises", ExerciseRouter);
app.use("/api/chatMessages", ChatMessageRouter);
app.use("/api/users", UserRouter);

app.use("/api/admin/course_templates", AdminCourseTemplateRouter);
app.use("/api/admin/classes", AdminClassRouter);

app.use("/api/classes", UserClassRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;
