import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { sl } from "zod/locales";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === "Dry Run" ? "Dry Run" : "LIVE";

if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing.");

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "10s", max: 10 }),
      ],
    })
  : null;

  export const wsArcjet= arcjetKey ?
  arcjet({
    key:arcjetKey,
    rules:[
        shield({mode:arcjetMode}),
        detectBot({mode:arcjetMode,allow:['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']}),
    slidingWindow({mode:arcjetMode,interval:'2s',max:5})
    ]
  }):null

  export function securityMiddleware(){
    return async(req,res,next)=>{
      if(!httpArcjet) return next();

      try {
        const decison= await httpArcjet.protect(req);

        if(decison.isDenied()){
          if(decison.reason.isRateLimit()){
            return res.status(429).json({error:'Too many request.'})
          }

          return res.status(403).json({error:'Forbidden'});
        }
      } catch (e) {
        console.error('Arcjet middleware error',e);
        return res.status(503).json({error:'Service Unavailable'})
        
      }
      next();
    }
  }