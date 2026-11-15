import "dotenv/config";
import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { orders, restockAlerts, communitySubscribers } from "@/db/schema";

async function main(){
  const records=JSON.parse(await readFile("artifacts/qa-records.json","utf8")) as {email:string;orderId?:number;restockId?:number;subscriberId?:number};
  if(!/^qa-step02-\d+@taikonaut\.example\.invalid$/.test(records.email))throw new Error("Not a synthetic QA record; refusing to delete.");
  if(records.orderId)await db.delete(orders).where(and(eq(orders.id,records.orderId),eq(orders.customerEmail,records.email)));
  if(records.restockId)await db.delete(restockAlerts).where(and(eq(restockAlerts.id,records.restockId),eq(restockAlerts.email,records.email)));
  if(records.subscriberId)await db.delete(communitySubscribers).where(and(eq(communitySubscribers.id,records.subscriberId),eq(communitySubscribers.email,records.email)));
  console.log("Removed only the three synthetic STEP 02 QA records via Drizzle.");
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>pool.end());
