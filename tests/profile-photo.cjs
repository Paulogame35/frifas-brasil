const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('comunidade.html','utf8');
const moduleSource=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
assert.ok(moduleSource,'community module must exist');
const start=moduleSource.indexOf('const safePhotoSource=');
const end=moduleSource.indexOf('const avatar=',start);
assert.notEqual(start,-1,'safe photo source filter must exist');
assert.notEqual(end,-1,'avatar renderer boundary must exist');
const source=moduleSource.slice(start,end)+'\nglobalThis.safePhotoSource=safePhotoSource;';
const context={URL};
vm.runInNewContext(source,context);
for(const data of ['data:image/jpeg;base64,QUJD','data:image/png;base64,QUJD','data:image/webp;base64,QUJD']) assert.equal(context.safePhotoSource(data),data);
assert.equal(context.safePhotoSource('https://lh3.googleusercontent.com/a/avatar.png'),'https://lh3.googleusercontent.com/a/avatar.png');
for(const blocked of ['https://tracker.example/pixel','http://lh3.googleusercontent.com/a.png','https://lh3.googleusercontent.com.evil.example/a.png','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','data:image/jpeg;base64,not-valid!','x'.repeat(300001)]) assert.equal(context.safePhotoSource(blocked),'',`unsafe profile photo accepted: ${blocked.slice(0,60)}`);
console.log('Profile photos: allowed image data and Google avatars; blocked arbitrary remote or active-content sources.');

