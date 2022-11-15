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

const random = (max: number) => {
  return Math.floor(Math.random() * max);
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


const helloText: string[] = [
  "Dobar ti dan prijateljice, neka ti od jutra sunce sije, neka te prati radost tokom dana.",
  "Želim ti lijep dan, pun osmijeha, sreće i zadovoljstva, uživaj u svakom trenutku dana.",
  "Dan  započni uz osmjeh, ne dopusti da ga itko kvari, odagnaj loše misli i kreni uzdignute glave u novi dan.",
  "Danas ti želim milion poljubaca, da ti osmijeh sa lica ne silazi, iskoristi ga najbolje što znaš.",
];

const goodbyeText: string[] = [
  "Bez obzira koliko je dan bio loš, uvijek ga pokušaj završiti pozitivnim mislima. Pokušaj se usredotočiti na sljedeći dan i nadati se slatkom snu. Laku noć.",
  "Želim ti miran san i da se sutra probudiš s novim nadama i puno pozitivne energije. Laka ti noć!",
  "Želim ti laku noć i da se dobro odmoriš, dragi prijatelju. Prestani se brinuti o životu. Uvijek ćeš imati moju podršku bez obzira na sve.",
  "Idi u krevet i pripremi se za najbolji san ikad jer nikad nećeš imati topliju i mirniju noć od ove. Laku noć!",
  "Skloni brige po strani i dopusti tijelu da osjeti mekoću tvog kreveta i toplinu pokrivača. Neka ti je miran san večeras!"
]


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

  let text: string | null= null;

  if(/.*ci$/i.test(message.body?.text))
    text = helloText[random(helloText.length)];

  if(/.*co$/i.test(message.body?.text))
    text = goodbyeText[random(goodbyeText.length)];

  if(!text) return res.send();
  
  axios.post(requestURL, {
    roomId: roomId,
    type: "text",
    body: {
      text:text
    }
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