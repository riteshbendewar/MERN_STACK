import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import getQAStore from "./controllers/question.controller.js";
import connectDB from "./utils/db.js";
import stringSimilarity from "string-similarity";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
   origin: ["https://mern-stack-frontend-fawn.vercel.app"], // Replace with your frontend domain
   methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true,
}));
app.use(express.json());
connectDB();

let qaStore = {};

const updateQAStore = async () => {
  try {
    qaStore = await getQAStore();
    console.log("QA Store updated successfully");
  } catch (error) {
    console.error("Error updating qaStore:", error.message);
  }
};
console.log(qaStore);

updateQAStore();
setInterval(updateQAStore, 300000);


function preprocessQuestion(question) {
  return question.toLowerCase().trim();
}

function findClosestMatch(processedQuestion) {
  if (!qaStore || Object.keys(qaStore).length === 0) {
    return { bestMatch: { rating: 0 } };
  }

  const questions = Object.keys(qaStore);
  const matches = stringSimilarity.findBestMatch(processedQuestion, questions);
  return matches.bestMatch;
}

app.get("/",asyns(req,res)=>{
await res.json({msg:"the backend is working"})
})

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  const processedQuestion = preprocessQuestion(question);

  if (qaStore[processedQuestion]) {
    res.json({ answer: qaStore[processedQuestion] });
  } else {
    const bestMatch = findClosestMatch(processedQuestion);
    if (bestMatch.rating > 0.5) {
      res.json({ answer: qaStore[bestMatch.target] });
    } else if (
      processedQuestion.includes("workshop date") ||
      processedQuestion.includes("upcoming workshop date") ||
      processedQuestion.includes("available workshop date")
    ) {
      if (qaStore.workshop_dates && Array.isArray(qaStore.workshop_dates)) {
        const datesInColumn = qaStore.workshop_dates
          .map((date) => `<li>${date}</li>`)
          .join("");
        res.json({
          answer: `Available workshop dates are:- <ul>${datesInColumn}</ul><br>For booking workshop, please <a class="anchor" href="http://example.com/workshop-booking" target="_blank">click here</a> to visit our workshop booking page.`,
        });
      } else {
        res.json({
          answer: "There are no available workshop dates at the moment.",
        });
      }
    } else {
      res.json({
        answer:
          "I don't understand that question. Please try asking something else or you can click on below option.",
        responseType: "unrecognized",
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
