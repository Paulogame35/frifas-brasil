// Offline checks: Firebase is stubbed, no accounts or emails are created.
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
async function check(file,search){
 const html=fs.readFileSync(file,'utf8');const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm,'');
 const nodes={};function node(id){return nodes[id]??={value:'',type:'password',validity:{valid:true},handlers:{},dataset:{},attributes:{},disabled:false,addEventListener(t,f){this.handlers[t]=f},setAttribute(k,v){this.attributes[k]=v},focus(){this.focused=true}}}
 let calls=0;const context={URLSearchParams,location:{search,replace(v){context.destination=v}},document:{getElementById:node,querySelector:node},console,setTimeout:f=>f(),initializeApp:()=>({}),getAuth:()=>({}),GoogleAuthProvider:function(){},setPersistence:async()=>{},browserLocalPersistence:{},getRedirectResult:async()=>null,signInWithEmailAndPassword:async()=>{calls++;return {user:{}}},createUserWithEmailAndPassword:async()=>{calls++;return {user:{}}},sendEmailVerification:async()=>{},signInWithRedirect:async()=>{throw {code:'auth/network-request-failed'}},sendPasswordResetEmail:async()=>{calls++}};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);
 const form=node(file==='login.html'?'loginForm':'registerForm');await form.handlers.submit({preventDefault(){}});assert.equal(calls,0);assert.equal(node('email').focused,true);
 node('togglePassword').handlers.click();assert.equal(node('password').type,'text');assert.equal(node('togglePassword').attributes['aria-pressed'],'true');
 node('email').value='example@example.com';node('password').value='example123';node('confirmPassword').value='different';
 if(file==='cadastro.html'){await form.handlers.submit({preventDefault(){}});assert.equal(calls,0);assert.equal(node('confirmPassword').focused,true);node('confirmPassword').value='example123'}
 await form.handlers.submit({preventDefault(){}});assert.equal(calls,1);assert.equal(context.destination,search.includes('evil')?(file==='login.html'?'index.html':'perfil.html?welcome=1'):'comunidade.html');
 await node('btnGoogle').handlers.click();assert.equal(node('btnGoogle').disabled,false);assert.match(node('status').textContent,/conexão/);
}
(async()=>{for(const file of ['login.html','cadastro.html']){await check(file,'?next=comunidade.html');await check(file,'?next=https://evil.example/')}console.log('Auth UI: validation, toggle, return paths and error recovery passed (offline).')})().catch(e=>{console.error(e);process.exitCode=1});
