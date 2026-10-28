using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Text;
class Launcher {
 static Process supervisor;static ProcessJob job;static NotifyIcon tray;static System.Windows.Forms.Timer monitor;
 static string token=Guid.NewGuid().ToString("N"),root;static readonly string url="http://127.0.0.1:3000";
 static volatile string lastError="";static volatile int chromePid;static IntPtr mainWindow=IntPtr.Zero;
 static bool closing;static int missingWindowTicks;static DateTime readyAt;static bool focusRequested;
 delegate bool EnumWindow(IntPtr h,IntPtr p);
 [DllImport("user32.dll")]static extern bool EnumWindows(EnumWindow callback,IntPtr parameter);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindow(IntPtr h);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetWindowText(IntPtr h,StringBuilder text,int count);
 [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsIconic(IntPtr h);
 [DllImport("user32.dll")]static extern bool ShowWindow(IntPtr h,int action);
 static IntPtr FindAppWindow(){
  IntPtr found=IntPtr.Zero;int pid=chromePid;if(pid==0)return found;
  EnumWindows((h,p)=>{uint owner;GetWindowThreadProcessId(h,out owner);if(owner==(uint)pid&&IsWindowVisible(h)){var title=new StringBuilder(512);GetWindowText(h,title,title.Capacity);if(title.ToString().IndexOf("Whiteboard Studio",StringComparison.OrdinalIgnoreCase)>=0){found=h;return false;}}return true;},IntPtr.Zero);return found;
 }
 static void FocusApp(){if(mainWindow!=IntPtr.Zero&&IsWindow(mainWindow)){if(IsIconic(mainWindow))ShowWindow(mainWindow,9);SetForegroundWindow(mainWindow);}else focusRequested=true;}
 static bool IsOwnedServer(){try{var r=(HttpWebRequest)WebRequest.Create(url+"/api/desktop");r.Headers["X-Desktop-Token"]=token;r.Timeout=700;using(var response=r.GetResponse())using(var reader=new StreamReader(response.GetResponseStream()))return reader.ReadToEnd().Contains("\"owned\":true");}catch{return false;}}
 [STAThread]static void Main(){
  Application.EnableVisualStyles();bool first;
  using(var mutex=new Mutex(true,"Local\\WhiteboardStudio3000",out first)){
   if(!first){try{using(var signal=EventWaitHandle.OpenExisting("Local\\WhiteboardStudio3000Open"))signal.Set();}catch{MessageBox.Show("Ứng dụng đang khởi động. Hãy đợi một chút.");}return;}
   using(var openSignal=new EventWaitHandle(false,EventResetMode.AutoReset,"Local\\WhiteboardStudio3000Open")){
    root=Application.StartupPath;string node=Path.Combine(root,"runtime","node","node.exe");
    if(!File.Exists(node)||!File.Exists(Path.Combine(root,"runtime","python","python.exe"))||!File.Exists(Path.Combine(root,"scripts","desktop-main.mjs"))){MessageBox.Show("Thiếu thành phần. Hãy giải nén toàn bộ ZIP portable, không chỉ lấy file EXE.");return;}
    try{
     Directory.CreateDirectory(Path.Combine(root,"data"));job=new ProcessJob();
     var info=new ProcessStartInfo(node,"scripts/desktop-main.mjs"){WorkingDirectory=root,UseShellExecute=false,CreateNoWindow=true,RedirectStandardInput=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardOutputEncoding=Encoding.UTF8,StandardErrorEncoding=Encoding.UTF8};
     info.EnvironmentVariables["DESKTOP_REQUIRE_PARENT"]="1";info.EnvironmentVariables["DESKTOP_SHUTDOWN_TOKEN"]=token;
     supervisor=new Process();supervisor.StartInfo=info;object gate=new object();
     DataReceivedEventHandler logger=(sender,e)=>{if(e.Data==null)return;if(e.Data.StartsWith("DESKTOP_READY ")){int pid;if(Int32.TryParse(e.Data.Substring(14),out pid)){readyAt=DateTime.UtcNow;chromePid=pid;}}
      if(e.Data.StartsWith("DESKTOP_ERROR "))lastError=e.Data.Substring(14);
      lock(gate){try{var log=Path.Combine(root,"data","desktop.log");if(File.Exists(log)&&new FileInfo(log).Length>2*1024*1024){var old=log+".old";if(File.Exists(old))File.Delete(old);File.Move(log,old);}File.AppendAllText(log,DateTime.Now.ToString("s")+" "+e.Data+Environment.NewLine,Encoding.UTF8);}catch{}}};
     supervisor.OutputDataReceived+=logger;supervisor.ErrorDataReceived+=logger;supervisor.Start();
     // The supervisor waits on stdin. Assign the job BEFORE it can spawn Chrome/Node/Python.
     job.Assign(supervisor);supervisor.BeginOutputReadLine();supervisor.BeginErrorReadLine();supervisor.StandardInput.WriteLine("START");supervisor.StandardInput.Flush();
     tray=new NotifyIcon{Icon=SystemIcons.Application,Text="Whiteboard Studio — đóng cửa sổ để thoát",Visible=true};
     var menu=new ContextMenuStrip();menu.Items.Add("Mở cửa sổ ứng dụng",null,(s,e)=>FocusApp());menu.Items.Add("Thoát",null,(s,e)=>Application.Exit());tray.ContextMenuStrip=menu;tray.DoubleClick+=(s,e)=>FocusApp();
     Application.ApplicationExit+=(s,e)=>Stop();monitor=new System.Windows.Forms.Timer();monitor.Interval=400;
     monitor.Tick+=(s,e)=>{
      if(closing)return;
      if(supervisor.HasExited){string error=supervisor.ExitCode!=0?(lastError.Length>0?lastError:"Không mở được ứng dụng. Xem data/desktop.log."):null;Application.Exit();if(error!=null)MessageBox.Show(error,"Whiteboard Studio");return;}
      if(openSignal.WaitOne(0))FocusApp();
      if(chromePid>0){
       if(mainWindow==IntPtr.Zero){mainWindow=FindAppWindow();if(mainWindow!=IntPtr.Zero&&focusRequested){focusRequested=false;FocusApp();}if(mainWindow==IntPtr.Zero&&(DateTime.UtcNow-readyAt).TotalSeconds>35){Application.Exit();MessageBox.Show("Chrome chưa mở được cửa sổ ứng dụng. Xem data/desktop.log.");}}
       else if(!IsWindow(mainWindow)||!IsWindowVisible(mainWindow)){var replacement=FindAppWindow();if(replacement!=IntPtr.Zero){mainWindow=replacement;missingWindowTicks=0;}else if(++missingWindowTicks>=5)Application.Exit();}
       else missingWindowTicks=0;
      }
     };
     monitor.Start();Application.Run();
    }catch(Exception e){Stop();MessageBox.Show("Không khởi động được: "+e.Message,"Whiteboard Studio");}
    finally{Stop();}
   }
  }
 }
 static void Stop(){
  if(closing)return;closing=true;if(monitor!=null){monitor.Stop();monitor.Dispose();}if(tray!=null)tray.Dispose();
  try{if(supervisor!=null&&!supervisor.HasExited&&IsOwnedServer()){var r=(HttpWebRequest)WebRequest.Create(url+"/api/desktop/shutdown");r.Method="POST";r.Headers["X-Desktop-Token"]=token;r.ContentLength=0;r.Timeout=1500;using(var response=r.GetResponse()){}supervisor.WaitForExit(5000);}}catch{}
  // Closing the non-inherited job handle also cleans orphaned Chrome/Python/FFmpeg children.
  if(job!=null){job.Dispose();job=null;}
  try{if(supervisor!=null&&!supervisor.HasExited){supervisor.Kill();supervisor.WaitForExit(1000);}}catch{}
 }
}
