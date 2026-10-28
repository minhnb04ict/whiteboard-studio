export function mockVisual(body){
 const content=body.messages?.at(-1)?.content;
 const text=typeof content==='string'?content:content?.find(x=>x.type==='text')?.text;
 let value;
 if(text?.startsWith('VISUAL_PROFILE:'))value={styleGuide:'Consistent warm paper and dark sketch lines',characters:[]};
 if(text?.startsWith('SCENE_CAST:'))value={cast:[]};
 if(text?.startsWith('IMAGE_CONSISTENCY_CHECK:'))value={ok:true,issues:[]};
 return value?Response.json({choices:[{message:{content:JSON.stringify(value)}}]}):null;
}
