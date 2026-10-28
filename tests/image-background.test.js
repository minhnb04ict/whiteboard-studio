import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {normalizeImage,imageBackground} from '../src/image.js';

test('normalization preserves white, dark green, blue and pink backgrounds and uses the same colour for portrait padding',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'wb-background-'));
 try{
  for(const rgb of [[255,255,255],[37,75,55],[25,105,190],[242,177,200]]){
   const background={r:rgb[0],g:rgb[1],b:rgb[2]};
   const input=await sharp({create:{width:200,height:400,channels:3,background}}).png().toBuffer();
   assert.deepEqual(await imageBackground(input),background);
   const output=path.join(temp,'scene.png');await normalizeImage(input,output);
   const {data,info}=await sharp(output).raw().toBuffer({resolveWithObject:true});
   for(const [x,y] of [[0,0],[640,360],[1279,719]]){
    const n=(y*info.width+x)*info.channels;assert.deepEqual([...data.subarray(n,n+3)],rgb);
   }
  }
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});

test('a foreground mark at one corner does not determine the canvas; transparent-only borders have an explicit fallback',async()=>{
 const input=await sharp({create:{width:200,height:200,channels:3,background:'#254b37'}})
  .composite([{input:await sharp({create:{width:35,height:35,channels:3,background:'orange'}}).png().toBuffer(),left:0,top:0}]).png().toBuffer();
 assert.deepEqual(await imageBackground(input),{r:37,g:75,b:55});
 const transparent=await sharp({create:{width:10,height:10,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).png().toBuffer();
 assert.deepEqual(await imageBackground(transparent),{r:246,g:241,b:227});
});
