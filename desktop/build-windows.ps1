param([switch]$Resume)
$ErrorActionPreference='Stop'
if($env:OS -ne 'Windows_NT'){throw 'Build this portable release on Windows x64.'}
$root=Split-Path -Parent $PSScriptRoot
$release=Join-Path $root 'release'
$stage=Join-Path $release 'WhiteboardStudio-Windows-x64'
$cache=Join-Path $release 'build-cache'
New-Item -ItemType Directory -Force -Path $cache | Out-Null

function Run($exe,$arguments){& $exe @arguments;if($LASTEXITCODE -ne 0){throw "Command failed: $exe"}}
function Fetch($url,$file){if(!(Test-Path $file)){Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing}}
$userBackup=Join-Path $cache 'portable-data-backup'
if(-not $Resume){
 if(Test-Path $stage){
  foreach($name in @('data','models')){
   $source=Join-Path $stage $name
   if((Test-Path $source) -and @(Get-ChildItem -Path $source -Recurse -File -Force).Count -gt 0){
    $destination=Join-Path $userBackup $name
    if(Test-Path $destination){Remove-Item -Recurse -Force $destination}
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Get-ChildItem -Path $source -Force | Copy-Item -Destination $destination -Recurse -Force
   }
  }
  Remove-Item -Recurse -Force $stage
 }
 New-Item -ItemType Directory -Force -Path $stage | Out-Null
$nodeVersion='24.11.1'
$pythonVersion='3.12.10'
$nodeZip=Join-Path $cache "node-v$nodeVersion-win-x64.zip"
$pythonZip=Join-Path $cache "python-$pythonVersion-embed-amd64.zip"
Fetch "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip" $nodeZip
Fetch "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-embed-amd64.zip" $pythonZip
$nodeTemp=Join-Path $cache 'node'
Expand-Archive -Force $nodeZip $nodeTemp
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'runtime/node'),(Join-Path $stage 'runtime/python') | Out-Null
Copy-Item (Join-Path $nodeTemp "node-v$nodeVersion-win-x64/node.exe") (Join-Path $stage 'runtime/node/node.exe')
Copy-Item (Join-Path $nodeTemp "node-v$nodeVersion-win-x64/LICENSE") (Join-Path $stage 'runtime/node/LICENSE')
Expand-Archive -Force $pythonZip (Join-Path $stage 'runtime/python')
foreach($name in @('src','scripts','public','views','assets','vendor')){Copy-Item -Recurse (Join-Path $root $name) $stage}
foreach($name in @('package.json','package-lock.json','.env','README.md','PIPER-HUONG-DAN.md','THIRD-PARTY-PIPER.md','STUDIO-2.0-HUONG-DAN.md','STUDIO-2.1-HUONG-DAN.md','PUTER-HUONG-DAN.md')){if(Test-Path (Join-Path $root $name)){Copy-Item (Join-Path $root $name) $stage}}
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'data'),(Join-Path $stage 'models/piper') | Out-Null
$env:PATH=(Join-Path $nodeTemp "node-v$nodeVersion-win-x64")+";"+$env:PATH
# Install Windows native Sharp modules in the release directory, never copy another OS's node_modules.
Push-Location $stage
try{Run (Join-Path $nodeTemp "node-v$nodeVersion-win-x64/npm.cmd") @('ci','--omit=dev')}finally{Pop-Location}
# Build-time Python only: embed runtime receives prebuilt wheels; users never run pip.
$site=Join-Path $stage 'runtime/python/Lib/site-packages'
Run 'py' @('-3.12','-m','pip','install','--only-binary=:all:','--target',$site,'-r',(Join-Path $PSScriptRoot 'requirements-windows.txt'))
$pth="python312.zip`n.`nLib`nLib/site-packages`nimport site`n"
[IO.File]::WriteAllText((Join-Path $stage 'runtime/python/python312._pth'),$pth,[Text.Encoding]::ASCII)
# Application-local MSVC runtime libraries: builder needs Microsoft VC++ x64 redistributable installed.
foreach($dll in @('vcruntime140.dll','vcruntime140_1.dll','msvcp140.dll','concrt140.dll')){
 $source=Join-Path $env:WINDIR "System32/$dll"
 if(!(Test-Path $source)){throw "Missing $dll on build machine. Install Microsoft VC++ 2015-2022 x64 Redistributable and rebuild."}
 Copy-Item $source (Join-Path $stage 'runtime/python') -Force
}
$csc=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
if(!(Test-Path $csc)){throw 'Missing .NET Framework C# compiler on build machine.'}
Run $csc @('/nologo','/codepage:65001','/target:winexe','/platform:x64','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll',"/out:$stage/WhiteboardStudio.exe",(Join-Path $PSScriptRoot 'Launcher.cs'),(Join-Path $PSScriptRoot 'ProcessJob.cs'))
}else{
 foreach($file in @('runtime/node/node.exe','runtime/python/python.exe','WhiteboardStudio.exe','src/server.js','scripts/desktop-main.mjs','scripts/chrome-lifecycle.mjs')){
  if(!(Test-Path (Join-Path $stage $file))){throw "Cannot resume: missing $file. Run npm run build:desktop for a full build."}
 }
 $sourceVersion=(Get-Content -Raw (Join-Path $root 'package.json') | ConvertFrom-Json).version
 $stageVersion=(Get-Content -Raw (Join-Path $stage 'package.json') | ConvertFrom-Json).version
 if($sourceVersion -ne $stageVersion){throw 'Cannot resume a different source version. Run npm run build:desktop for a full build.'}
 Write-Host 'Resuming runtime checks and ZIP packaging. Existing runtimes and libraries are kept.'
}
Copy-Item (Join-Path $PSScriptRoot 'check-python.py') (Join-Path $stage 'scripts/build-check-python.py') -Force
Copy-Item (Join-Path $PSScriptRoot 'check-node.cjs') (Join-Path $stage 'scripts/build-check-node.cjs') -Force
Push-Location $stage
try{
 Run (Join-Path $stage 'runtime/python/python.exe') @('scripts/media.py','doctor')
 Run (Join-Path $stage 'runtime/python/python.exe') @('scripts/build-check-python.py')
 Run (Join-Path $stage 'runtime/node/node.exe') @('scripts/build-check-node.cjs')
}finally{Pop-Location}
Copy-Item (Join-Path $PSScriptRoot 'PORTABLE-README.txt') $stage
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=Join-Path $release 'WhiteboardStudio-Windows-x64.zip'
if(Test-Path $archive){Remove-Item $archive}
# Keep local portable data when rebuilding, but do not distribute personal projects/models in the ZIP.
if(-not $Resume){
 foreach($name in @('data','models')){
  $source=Join-Path $userBackup $name
  if(Test-Path $source){Get-ChildItem -Path $source -Force | Copy-Item -Destination (Join-Path $stage $name) -Recurse -Force}
 }
}
$zip=[IO.Compression.ZipFile]::Open($archive,[IO.Compression.ZipArchiveMode]::Create)
try{
 foreach($file in Get-ChildItem -Path $stage -Recurse -File -Force){
  $relative=$file.FullName.Substring($stage.Length).TrimStart([char[]]'\/').Replace('\','/')
  if($relative -match '^(data|models)/'){continue}
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,'WhiteboardStudio-Windows-x64/'+$relative,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
 }
 $zip.CreateEntry('WhiteboardStudio-Windows-x64/data/') | Out-Null
 $zip.CreateEntry('WhiteboardStudio-Windows-x64/models/piper/') | Out-Null
}finally{$zip.Dispose()}
Write-Host 'Build complete. Test WhiteboardStudio.exe on a clean Windows 10/11 x64 PC before distribution.'
