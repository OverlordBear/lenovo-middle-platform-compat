param(
    [string]$A8Home = 'E:\Seeyon\A8'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $A8Home 'ApacheJetspeed\webapps\seeyon'
$libRoot = Join-Path $webRoot 'WEB-INF\lib'
$coreJar = Join-Path $libRoot 'seeyon-ctp-core.jar'
$servletJar = Join-Path $libRoot 'javax.servlet-api.jar'
$mainJar = Join-Path $projectRoot 'dist\ruian-filez-poc-0.1.0.jar'
$testSource = Join-Path $projectRoot 'src\test\java\com\ruian\filez\poc\web\FilezPocGlobalJsExtendSmokeTest.java'
$testRoot = Join-Path $projectRoot ('build\test-' + [guid]::NewGuid().ToString('N'))
$classpath = @($mainJar, $coreJar, $servletJar) -join [IO.Path]::PathSeparator

foreach ($required in @($mainJar, $coreJar, $servletJar, $testSource)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required path does not exist: $required"
    }
}

New-Item -ItemType Directory -Path $testRoot -Force | Out-Null

& javac -encoding UTF-8 -source 1.8 -target 1.8 -classpath $classpath -d $testRoot $testSource
if ($LASTEXITCODE -ne 0) {
    throw "Test compilation failed with exit code $LASTEXITCODE"
}

$runtimeClasspath = @($testRoot, $classpath) -join [IO.Path]::PathSeparator
& java -classpath $runtimeClasspath com.ruian.filez.poc.web.FilezPocGlobalJsExtendSmokeTest
if ($LASTEXITCODE -ne 0) {
    throw "Smoke test failed with exit code $LASTEXITCODE"
}

& node --check (Join-Path $projectRoot 'src\main\webapp\apps_res\ruian-filez-poc\bootstrap.js')
if ($LASTEXITCODE -ne 0) {
    throw "JavaScript syntax check failed with exit code $LASTEXITCODE"
}

Write-Host 'All offline PoC tests passed.'
