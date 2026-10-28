import test from 'node:test';import assert from 'node:assert/strict';
import {polygonRegion,insideRegion,transformRegion} from '../public/region-shape.js';import {validateAnnotation} from '../src/domain.js';
test('freehand polygons persist, compute bounds and transform without becoming rectangles',()=>{
 const r=polygonRegion([{x:100,y:100},{x:500,y:100},{x:100,y:500}]);assert.equal(r.width,400);assert.equal(insideRegion(r,{x:450,y:450}),false);assert.equal(insideRegion(r,{x:150,y:150}),true);
 const moved=transformRegion(r,{x:200,y:200,width:200,height:200});assert.deepEqual(moved.points,[{x:200,y:200},{x:400,y:200},{x:200,y:400}]);
 const a=validateAnnotation({canvas:{width:1280,height:720},elements:[{region:r,reveal:{startMs:0,durationMs:1000}}]},2000);assert.deepEqual(a.elements[0].region,r);assert.deepEqual(validateAnnotation(a,2000),a);
});
test('invalid, excessive, tiny and out-of-frame polygons are rejected',()=>{
 for(const p of [[],[{x:0,y:0},{x:1,y:0},{x:0,y:1}],Array(257).fill({x:100,y:100}),[{x:0,y:0},{x:1300,y:0},{x:0,y:100}], [{x:0,y:0},{x:NaN,y:0},{x:0,y:100}]])assert.throws(()=>polygonRegion(p));
});
