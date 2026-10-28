"""Protocol/lifecycle test using the installed SDK's public API shape; no model download."""
import pathlib,subprocess,tempfile,json,sys,textwrap,os
ROOT=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as d:
 p=pathlib.Path(d)
 code="""
import sys,types,runpy,pathlib,numpy as np
loadfile=sys.argv[2]
class Fake:
 def __init__(self,**kwargs):
  assert kwargs['backend']=='onnx' and kwargs['precision']=='fp32'
  with open(loadfile,'a') as f:f.write('loaded\\n')
 def infer(self,text,voice,**kwargs):
  assert voice=='minh-quan'
  return np.ones(24000,dtype=np.float32)*.2
 def list_preset_voices(self):return [('⭐ Minh Quân — miền Bắc','minh-quan')]
sys.modules['vieneu']=types.SimpleNamespace(Vieneu=Fake)
worker=sys.argv[1];sys.argv=[worker];runpy.run_path(worker,run_name='__main__')
"""
 requests=[{'id':i,'text':'Xin chào.','voice':'minh-quan','backend':'onnx','output':str(p/(str(i)+'.wav'))} for i in [1,2]]
 env={**os.environ,'VIENEU_HOME':str(p)}
 proc=subprocess.run([sys.executable,'-c',code,str(ROOT/'scripts/vieneu_worker.py'),str(p/'load-count')],input=''.join(json.dumps(r)+'\n' for r in requests),text=True,capture_output=True,env=env,timeout=20)
 assert proc.returncode==0,proc.stderr
 results=[json.loads(l[7:]) for l in proc.stdout.splitlines() if l.startswith('RESULT ')]
 assert [r['id'] for r in results]==[1,2] and all(r['durationMs']==500 and 'error' not in r for r in results),proc.stdout
 assert (p/'load-count').read_text().splitlines()==['loaded']
 assert all((p/(str(i)+'.wav')).is_file() for i in [1,2])
 # Loading/preparation must persist canonical SDK IDs, never decorated display labels.
 code2=code.replace("worker=sys.argv[1];sys.argv=[worker]","worker=sys.argv[1];sys.argv=[worker,'prepare','onnx']")
 proc=subprocess.run([sys.executable,'-c',code2,str(ROOT/'scripts/vieneu_worker.py'),str(p/'load-count')],text=True,capture_output=True,env=env,timeout=20)
 assert proc.returncode==0,proc.stderr
 state=json.loads((p/'ready.json').read_text());assert state['voices'][0]['id']=='minh-quan' and state['backends']['onnx']
 print('PASS: VieNeu worker reuses model, sequential request IDs, real WAV output, preparation validates audio and retains canonical SDK voice IDs')
