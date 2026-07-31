param(
    [string]$A8Home = 'E:\Seeyon\A8'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $A8Home 'ApacheJetspeed\webapps\seeyon'
$libRoot = Join-Path $webRoot 'WEB-INF\lib'
$coreJar = Join-Path $libRoot 'seeyon-ctp-core.jar'
$servletJar = Join-Path $libRoot 'javax.servlet-api.jar'
$sourceFile = Join-Path $projectRoot 'src\main\java\com\ruian\filez\poc\web\FilezPocGlobalJsExtend.java'
$resourceRoot = Join-Path $projectRoot 'src\main\resources'
$manifestFile = Join-Path $resourceRoot 'META-INF\MANIFEST.MF'
$buildRoot = Join-Path $projectRoot 'build'
$distRoot = Join-Path $projectRoot 'dist'
$workRoot = Join-Path $buildRoot ('work-' + [guid]::NewGuid().ToString('N'))
$classesRoot = Join-Path $workRoot 'classes'
$jarPath = Join-Path $distRoot 'ruian-filez-poc-0.1.0.jar'

foreach ($required in @($coreJar, $servletJar, $sourceFile, $manifestFile)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required path does not exist: $required"
    }
}

New-Item -ItemType Directory -Path $classesRoot -Force | Out-Null
New-Item -ItemType Directory -Path $distRoot -Force | Out-Null

$classpath = $coreJar + [IO.Path]::PathSeparator + $servletJar
& javac -encoding UTF-8 -source 1.8 -target 1.8 -classpath $classpath -d $classesRoot $sourceFile
if ($LASTEXITCODE -ne 0) {
    throw "javac failed with exit code $LASTEXITCODE"
}

Copy-Item -LiteralPath (Join-Path $resourceRoot 'META-INF') -Destination $classesRoot -Recurse -Force

& jar cfm $jarPath $manifestFile -C $classesRoot .
if ($LASTEXITCODE -ne 0) {
    throw "jar failed with exit code $LASTEXITCODE"
}

$expectedEntries = @(
    'com/ruian/filez/poc/web/FilezPocGlobalJsExtend.class',
    'META-INF/services/com.seeyon.ctp.common.web.GlobalJsExtend'
)
$jarEntries = & jar tf $jarPath
foreach ($entry in $expectedEntries) {
    if ($jarEntries -notcontains $entry) {
        throw "JAR is missing required entry: $entry"
    }
}

$hash = (Get-FileHash -LiteralPath $jarPath -Algorithm SHA256).Hash
Write-Host "Built: $jarPath"
Write-Host "SHA256: $hash"
