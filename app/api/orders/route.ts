import {getDb} from '@/db';
import {orders} from '@/db/schema';
import {getSession} from '@/app/session';
import {and,desc,eq} from 'drizzle-orm';
import {validateCart,total} from '@/lib/order-engine.mjs';
export async function GET(){const user=await getSession();if(!user)return Response.json({error:'Sign in to view orders.'},{status:401});return Response.json({orders:await getDb().select().from(orders).where(eq(orders.owner,user.userId)).orderBy(desc(orders.createdAt)).limit(100)});}
export async function POST(req:Request){try{
 const user=await getSession();if(!user)return Response.json({error:'Sign in to place an order.'},{status:401});
 const b:any=await req.json();if(!b.confirmed||typeof b.id!=='string'||!/^[-a-zA-Z0-9]{10,80}$/.test(b.id)||typeof b.table!=='string'||!b.table.trim()||b.table.length>30)throw Error('Review and confirm the order with a valid table label.');
 const cart=validateCart(b.cart);if(!cart.length)throw Error('Your cart is empty.');
 const db=getDb();const [old]=await db.select().from(orders).where(eq(orders.id,b.id));
 if(old){if(old.owner!==user.userId||old.cart!==JSON.stringify(cart)||old.table!==b.table.trim())throw Error('This confirmation belongs to a different order. Start a new confirmation.');return Response.json({order:old});}
 const [order]=await db.insert(orders).values({id:b.id,owner:user.userId,table:b.table.trim(),cart:JSON.stringify(cart),total:total(cart),status:'Queued',createdAt:Date.now()}).returning();return Response.json({order});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Could not save order.'},{status:400});}}
export async function PATCH(req:Request){try{const user=await getSession();if(!user)return Response.json({error:'Sign in required.'},{status:401});const b:any=await req.json();if(!['Preparing','Ready','Completed'].includes(b.status))throw Error('Invalid status.');const [order]=await getDb().update(orders).set({status:b.status}).where(and(eq(orders.id,b.id),eq(orders.owner,user.userId))).returning();if(!order)return Response.json({error:'Order not found.'},{status:404});return Response.json({order});}catch{return Response.json({error:'Could not update order.'},{status:400});}}
