import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from "axios";

const wait = (sec: number) => {
  return new Promise<void>( (res,rej) => {
    setTimeout(()=>{
      res();
    },sec * 1000);
  });
}
type Message = {
  id: number;
  type: string;
  body: {
    text: string
  };
  fromUserId: number;
}

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const requestURL: string = process.env.API_URL as string;
if(!requestURL) throw new Error("API_URL should defined in .env");
const apiKey: string = process.env.API_KEY as string;
if(!apiKey) throw new Error("API_KEY should defined in .env");
const roomId: number = parseInt(process.env.ROOM_ID as string);
if(!roomId) throw new Error("ROOM_ID should defined in .env");
const botUserId: number = parseInt(process.env.BOT_USER_ID as string);
if(!botUserId) throw new Error("BOT_USER_ID should defined in .env");

app.use(express.json());

app.post('/', (req: Request, res: Response) => {

  if(parseInt(process.env.DEBUG as string))
    console.log("Webhook request",req.body,req.headers);

  const signature: string = req.headers["verification-signature"] as string;
  if(signature !== process.env.WEBHOOK_SIGNATURE){
    return res.send();
  }

  const message: Message = req.body.message as Message;

  if(message.fromUserId === botUserId) return res.send();
  if(message.type !== "text") return res.send();


  axios.post(requestURL, {
    roomId: roomId,
    type: "text",
    body: message.body
  },{
      headers: {
          "Content-Type": "application/json",
          "accesstoken": apiKey,
      },
  }).catch((e)=> {
      console.error({ webHookError: e });
  });

  res.send();

});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});