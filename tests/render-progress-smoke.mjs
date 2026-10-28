import {python} from '../src/process.js';
console.log(await python(['tests/render-progress-smoke.py'],{timeout:180000,onLine:line=>{if(line.startsWith('PROGRESS '))console.log(line);}}));
