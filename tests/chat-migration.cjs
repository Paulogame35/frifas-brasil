const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('comunidade.html','utf8');
const start=s.indexOf('async function sendMessage(');
const end=s.indexOf('box.addEventListener("click",',start);
assert.notEqual(start,-1,'sendMessage implementation must exist');
assert.notEqual(end,-1,'sendMessage extraction boundary must exist');
const source=s.slice(start,end);
assert.doesNotMatch(source,/\baddDoc\s*\(/,'protected sends must not use the permissive legacy write');
(async()=>{
 for(const mode of ['success','rejected','offline']){
  let commits=0;
  const writes=[];
  const c={
   db:{},
   doc:(...x)=>({id:'ABCDEFGHIJKLMNOPQRST',path:x}),
   collection:(...x)=>x,
   serverTimestamp:()=>123,
   writeBatch:()=>({
    set:(r,d)=>writes.push([r,d]),
    commit:async()=>{commits++;if(mode==='rejected')throw {code:'permission-denied'};if(mode==='offline')throw {code:'unavailable'};}
   })
  };
  vm.runInNewContext(source,c);
  if(mode==='success')await c.sendMessage({uid:'alice',text:'test'});
  else await assert.rejects(c.sendMessage({uid:'alice',text:'test'}));
  assert.equal(commits,1,'each attempt should make exactly one atomic commit');
  assert.equal(writes.length,2,'message and rate limit must be in the same batch');
  assert.equal(writes[1][1].messageId,writes[0][0].id);
 }
 console.log('PASS: atomic protected send; rejection and offline errors do not trigger a legacy fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});

