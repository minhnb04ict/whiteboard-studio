import {python} from '../src/process.js';
console.log(await python(['tests/background-render-smoke.py']));
