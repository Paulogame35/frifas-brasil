const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,collection,collectionGroup,query,orderBy,getDocs,setDoc,getDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp}=require('firebase/firestore');
const fs=require('node:fs');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-frifas',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(__dirname+'/firestore.rules','utf8')}});
 const a=env.authenticatedContext('alice').firestore(),b=env.authenticatedContext('bob').firestore(),owner=env.authenticatedContext('zslxVPC5TOhFVefTSGqYAxjI6Xi1').firestore(),guest=env.unauthenticatedContext().firestore(),mod=env.authenticatedContext('mod1').firestore();
 const msg=(uid='alice')=>({uid,displayName:'Teste',photoData:'',text:'Olá',createdAt:serverTimestamp()});
 function send(db,uid='alice',extra={}){const ref=doc(collection(db,'chatMessages')),batch=writeBatch(db);batch.set(ref,{...msg(uid),...extra});batch.set(doc(db,'chatLimits',uid),{messageId:ref.id,lastSentAt:serverTimestamp()});return {ref,run:()=>batch.commit()};}
 const first=send(a);await assertSucceeds(first.run());await assertSucceeds(getDoc(doc(guest,'chatMessages',first.ref.id)));
 await assertFails(send(a).run());await assertFails(setDoc(doc(collection(a,'chatMessages')),msg()));await assertFails(deleteDoc(doc(a,'chatLimits','alice')));
 await assertFails(getDoc(doc(b,'chatLimits','alice')));await assertFails(send(b,'alice').run());await assertFails(send(guest).run());
 await assertFails(setDoc(first.ref,{text:'edit'},{merge:true}));await assertFails(deleteDoc(doc(b,'chatMessages',first.ref.id)));
 await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'chatLimits','alice'),{messageId:first.ref.id,lastSentAt:Timestamp.fromMillis(Date.now()-6000)});});
 await assertFails(send(a,'alice',{text:'   \n  '}).run());await assertFails(send(a,'alice',{photoData:'a'.repeat(300001)}).run());await assertFails(send(a,'alice',{text:'a'.repeat(301)}).run());
 const second=send(a,'alice',{text:'multi\nline'});await assertSucceeds(second.run());
 function report(db,uid,id){const batch=writeBatch(db);batch.set(doc(db,'chatReports',id,'reporters',uid),{messageId:id,reporterUid:uid,reason:'spam',createdAt:serverTimestamp()});batch.set(doc(db,'reportLimits',uid),{messageId:id,lastReportedAt:serverTimestamp()});return batch.commit();}
 await assertFails(report(a,'alice',first.ref.id));await assertSucceeds(report(b,'bob',first.ref.id));await assertFails(report(b,'bob',second.ref.id));await assertFails(report(b,'bob',first.ref.id));
 const reportRef=doc(b,'chatReports',first.ref.id,'reporters','bob');await assertFails(getDoc(reportRef));await assertFails(getDoc(doc(guest,'chatReports',first.ref.id,'reporters','bob')));await assertSucceeds(getDoc(doc(owner,'chatReports',first.ref.id,'reporters','bob')));
 // Moderator permissions are granted only by an owner-created role document.
 await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'chatModerators','mod1'),{role:'moderator'});await setDoc(doc(c.firestore(),'chatMessages','mod-target'),{uid:'alice',displayName:'Alice',photoData:'',text:'Mensagem denunciada',createdAt:Timestamp.now()});});
 await assertSucceeds(getDoc(doc(mod,'chatModerators','mod1')));await assertFails(setDoc(doc(mod,'chatModerators','bob'),{role:'moderator'}));
 await assertSucceeds(getDoc(reportRef));await assertSucceeds(getDocs(query(collectionGroup(mod,'reporters'),orderBy('createdAt','desc'))));
 const moderationBatch=writeBatch(mod);moderationBatch.delete(doc(mod,'chatMessages','mod-target'));moderationBatch.set(doc(mod,'chatModerationLogs','mod-target'),{messageId:'mod-target',moderatorUid:'mod1',action:'delete_message',reason:'Violação das regras',createdAt:serverTimestamp()});await assertSucceeds(moderationBatch.commit());
 await assertFails(deleteDoc(doc(b,'chatMessages','mod-target')));
 await assertSucceeds(setDoc(doc(a,'users','alice'),{displayName:'Teste'}));await assertFails(getDoc(doc(b,'users','alice')));
 await assertSucceeds(deleteDoc(doc(owner,'chatMessages',first.ref.id)));
 // Multiple message writes cannot share a single throttle update.
 await env.withSecurityRulesDisabled(async c=>{await deleteDoc(doc(c.firestore(),'chatLimits','alice'));});
 const x=doc(collection(a,'chatMessages')),y=doc(collection(a,'chatMessages')),batch=writeBatch(a);batch.set(x,msg());batch.set(y,msg());batch.set(doc(a,'chatLimits','alice'),{messageId:x.id,lastSentAt:serverTimestamp()});await assertFails(batch.commit());
 console.log('PASS: server cooldown, atomic writes, duplicate reports, privacy, ownership, validation and multi-message bypass.');await env.cleanup();
})().catch(e=>{console.error(e);process.exitCode=1});
