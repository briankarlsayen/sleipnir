import express from "express";
import { rateLimit } from "express-rate-limit";
import { sendEmail } from "./utilities/sendEmail.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || "5201";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
});

app.use(cors());
app.use(express.json());
app.use(limiter);

app.get("/", (req, res) => {
  return res.status(200).json("Alive alive");
});

app.post("/sendmail", async (req, res) => {
  const { to, from, subject, message } = req.body;
  try {
    if (!to || !subject || !message)
      return res.status(422).json({ message: "Invalid input" });
    const options = {
      to, // email to be sent
      from, // email from ex. Note app team
      subject, // email subject
      message, // email content, can be html
    };
    const response = await sendEmail(options);
    if (!response) return res.status(422).json({ message: "Email not sent" });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(422).json({ message: "Email send failed" });
  }
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Listening to port ${PORT}`);
});
