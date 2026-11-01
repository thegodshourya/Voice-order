export const menu = [
 ['margherita','Regular Margherita',149,'Pizza','Tomato, mozzarella and fresh basil'],
 ['farmhouse','Medium Farmhouse',269,'Pizza','Peppers, onion, mushrooms and mozzarella'],
 ['corn','Regular Corn & Cheese',189,'Pizza','Sweet corn with a generous cheese topping'],
 ['paneer','Medium Paneer Tikka',299,'Pizza','Paneer, peppers and a spiced tomato base'],
 ['pepper','Regular Pepper Pizza',179,'Pizza','Roasted peppers, onion and mozzarella'],
 ['garlic','Garlic Bread',99,'Sides','Warm garlic bread with herb butter'],
 ['wedges','Potato Wedges',119,'Sides','Oven-baked wedges with a herb seasoning'],
 ['brownie','Chocolate Brownie',89,'Dessert','A rich chocolate finish'],
 ['lemon','Lemonade',69,'Drinks','Fresh, bright and lightly sweet'],
 ['cola','Cola',59,'Drinks','Chilled 250 ml can']
].map(([id,name,price,category,description])=>({id:String(id),name:String(name),price:Number(price),category:String(category),description:String(description),available:id!=='cola'}));

export function validateCart(input) {
 if(!Array.isArray(input)||input.length>10) throw Error('Invalid cart.');
 const ids=new Set();
 return input.map(row=>{const item=menu.find(m=>m.id===row?.id);if(!item||!item.available||ids.has(item.id)||!Number.isInteger(row.qty)||row.qty<1||row.qty>20)throw Error('Choose available items with quantities from 1 to 20.');ids.add(item.id);return {id:item.id,qty:row.qty};});
}
export function total(cart){return validateCart(cart).reduce((s,r)=>s+menu.find(m=>m.id===r.id).price*r.qty,0);}

// ponytail: deliberately limited guided commands; use the configured AI route for natural language.
export function guided(text,cart){
 const t=text.toLowerCase().trim();const next=validateCart(cart).map(r=>({...r}));
 const add=t.match(/^add (\d+) (.+)$/),set=t.match(/^(?:set|change) (.+) to (\d+)$/),remove=t.match(/^(?:remove|delete) (.+)$/);
 if(!add&&!set&&!remove)throw Error('Guided mode: try add 2 margherita, set margherita to 1, or remove garlic.');
 const name=add?add[2]:set?set[1]:remove[1];const item=menu.find(m=>m.id===name||m.name.toLowerCase()===name);
 if(!item)throw Error('Choose one exact menu item per guided command.');
 if(!item.available)throw Error(item.name+' is unavailable. Please choose another item.');
 if(remove)return next.filter(r=>r.id!==item.id);
 const qty=Number(add?add[1]:set[2]);if(qty<1||qty>20)throw Error('Use a quantity from 1 to 20.');const old=next.find(r=>r.id===item.id);
 if(old)old.qty=add?old.qty+qty:qty;else next.push({id:item.id,qty});return validateCart(next);
}
