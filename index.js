const H={
 "content-type":"application/json; charset=utf-8",
 "access-control-allow-origin":"*",
 "access-control-allow-methods":"GET,POST,OPTIONS",
 "access-control-allow-headers":"content-type,authorization"
};
const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:H});

class AsariAdapter {
 constructor(env){this.env=env}
 async createLead(lead){
   throw new Error("ASARI not configured: use official account documentation for endpoint, auth and payload mapping. Do not guess production endpoints.");
 }
 async pushProperty(payload){
   throw new Error("ASARI Portal Sync not configured: use official account documentation.");
 }
}

function crm(env){
 if((env.CRM_PROVIDER||"asari").toLowerCase()==="asari") return new AsariAdapter(env);
 throw new Error("Unsupported CRM provider");
}

export default {
 async fetch(req,env){
  if(req.method==="OPTIONS") return new Response(null,{headers:H});
  const u=new URL(req.url);
  try{
   if(u.pathname==="/health")
     return J({ok:true,service:"Homeagent / AGENT AI 1"});

   if(u.pathname==="/api/leads" && req.method==="POST"){
     const x=await req.json();
     const r=await env.DB.prepare(
       "INSERT INTO leads(name,email,phone,message,source) VALUES(?,?,?,?,?)"
     ).bind(x.name||null,x.email||null,x.phone||null,x.message||null,x.source||"web").run();
     return J({ok:true,id:r.meta.last_row_id},201);
   }

   if(u.pathname==="/api/leads" && req.method==="GET"){
     const r=await env.DB.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 100").all();
     return J(r.results);
   }

   if(u.pathname==="/api/ai/chat" && req.method==="POST"){
     const x=await req.json();
     const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8",{
       messages:(x.messages||[]).slice(-20)
     });
     return J({ok:true,result});
   }

   if(u.pathname==="/api/crm/sync" && req.method==="POST"){
     const x=await req.json();
     return J({ok:true,result:await crm(env).createLead(x)});
   }

   if(u.pathname==="/api/portal-sync/enqueue" && req.method==="POST"){
     const x=await req.json();
     const r=await env.DB.prepare(
       "INSERT INTO sync_queue(entity_type,entity_id,target,payload) VALUES(?,?,?,?)"
     ).bind(x.entity_type,String(x.entity_id),x.target||"crm",JSON.stringify(x.payload||{})).run();
     return J({ok:true,id:r.meta.last_row_id},201);
   }

   return J({error:"Not found"},404);
  }catch(e){return J({error:String(e.message||e)},500)}
 }
};
