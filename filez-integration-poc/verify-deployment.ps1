param(
    [string]$A8Home = 'E:\Seeyon\A8'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $A8Home 'ApacheJetspeed\webapps\seeyon'
$pairs = @(
    @{
        Source = (Join-Path $projectRoot 'dist\ruian-filez-poc-0.1.0.jar')
        Target = (Join-Path $webRoot 'WEB-INF\lib\customer\ruian-filez-poc-0.1.0.jar')
    },
    @{
        Source = (Join-Path $projectRoot 'src\main\webapp\apps_res\ruian-filez-poc\bootstrap.js')
        Target = (Join-Path $webRoot 'apps_res\ruian-filez-poc\bootstrap.js')
    },
    @{
        Source = (Join-Path $projectRoot 'src\main\webapp\WEB-INF\cfgHome\plugin\ruianFilezPoc\pluginCfg.xml')
        Target = (Join-Path $webRoot 'WEB-INF\cfgHome\plugin\ruianFilezPoc\pluginCfg.xml')
    }
)

$failed = $false
foreach ($pair in $pairs) {
    if (-not (Test-Path -LiteralPath $pair.Source)) {
        Write-Error "Missing source: $($pair.Source)"
        $failed = $true
        continue
    }
    if (-not (Test-Path -LiteralPath $pair.Target)) {
        Write-Error "Missing target: $($pair.Target)"
        $failed = $true
        continue
    }

    $sourceHash = (Get-FileHash -LiteralPath $pair.Source -Algorithm SHA256).Hash
    $targetHash = (Get-FileHash -LiteralPath $pair.Target -Algorithm SHA256).Hash
    $match = $sourceHash -eq $targetHash
    [pscustomobject]@{
        Target = $pair.Target
        HashMatches = $match
        SHA256 = $targetHash
    }
    if (-not $match) {
        $failed = $true
    }
}

$targetJar = $pairs[0].Target
if (Test-Path -LiteralPath $targetJar) {
    $entries = & jar tf $targetJar
    foreach ($entry in @(
        'com/ruian/filez/poc/web/FilezPocGlobalJsExtend.class',
        'META-INF/services/com.seeyon.ctp.common.web.GlobalJsExtend'
    )) {
        if ($entries -notcontains $entry) {
            Write-Error "Deployed JAR is missing: $entry"
            $failed = $true
        }
    }
}

if ($failed) {
    throw 'Deployment verification failed.'
}

Write-Host 'Deployment verification passed.'
