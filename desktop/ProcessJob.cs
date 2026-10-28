using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
sealed class ProcessJob : IDisposable {
 IntPtr handle;
 [StructLayout(LayoutKind.Sequential)] struct BasicLimits { public long ProcessTime,JobTime; public uint Flags; public UIntPtr MinWorkingSet,MaxWorkingSet; public uint ActiveProcesses; public UIntPtr Affinity; public uint Priority,Scheduling; }
 [StructLayout(LayoutKind.Sequential)] struct IoCounters { public ulong ReadOps,WriteOps,OtherOps,ReadBytes,WriteBytes,OtherBytes; }
 [StructLayout(LayoutKind.Sequential)] struct ExtendedLimits { public BasicLimits Basic; public IoCounters Io; public UIntPtr ProcessMemory,JobMemory,PeakProcessMemory,PeakJobMemory; }
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attributes,string name);
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job,int type,IntPtr info,uint size);
 [DllImport("kernel32.dll",SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr job,IntPtr process);
 [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
 public ProcessJob(){
  handle=CreateJobObject(IntPtr.Zero,null);if(handle==IntPtr.Zero)throw new Win32Exception();
  ExtendedLimits info=new ExtendedLimits();info.Basic.Flags=0x2000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
  int size=Marshal.SizeOf(typeof(ExtendedLimits));IntPtr pointer=Marshal.AllocHGlobal(size);
  try{Marshal.StructureToPtr(info,pointer,false);if(!SetInformationJobObject(handle,9,pointer,(uint)size))throw new Win32Exception();}
  catch{Dispose();throw;}
  finally{Marshal.FreeHGlobal(pointer);}
 }
 public void Assign(Process process){if(!AssignProcessToJobObject(handle,process.Handle))throw new Win32Exception(Marshal.GetLastWin32Error(),"Không quản lý được nhóm tiến trình ứng dụng trên máy này.");}
 public void Dispose(){if(handle!=IntPtr.Zero){CloseHandle(handle);handle=IntPtr.Zero;}}
}
