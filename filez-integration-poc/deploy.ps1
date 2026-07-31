param(
    [string]$A8Home = 'E:\Seeyon\A8'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $A8Home 'ApacheJetspeed\webapps\seeyon'
$officeSdk = Join-Path $webRoot 'common\office\js\officeSDK.js'
$sourceJar = Join-Path $projectRoot 'dist\ruian-filez-poc-0.1.0.jar'
$sourceJs = Join-Path $projectRoot 'src\main\webapp\apps_res\ruian-filez-poc\bootstrap.js'
$sourcePluginCfg = Join-Path $projectRoot 'src\main\webapp\WEB-INF\cfgHome\plugin\ruianFilezPoc\pluginCfg.xml'
$targetJar = Join-Path $webRoot 'WEB-INF\lib\customer\ruian-filez-poc-0.1.0.jar'
$targetJs = Join-Path $webRoot 'apps_res\ruian-filez-poc\bootstrap.js'
$targetPluginCfg = Join-Path $webRoot 'WEB-INF\cfgHome\plugin\ruianFilezPoc\pluginCfg.xml'
$backupRoot = Join-Path $projectRoot ('deploy-backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss'))

foreach ($required in @($officeSdk, $sourceJar, $sourceJs, $sourcePluginCfg)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required path does not exist: $required"
    }
}

$running = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match 'java|tomcat' -and
        $_.CommandLine -match 'Seeyon|ApacheJetspeed|catalina'
    }
if ($running) {
    throw 'A8/Tomcat is running. Stop it before deploying this PoC.'
}

$resolvedWebRoot = [IO.Path]::GetFullPath($webRoot).TrimEnd('\') + '\'
foreach ($target in @($targetJar, $targetJs, $targetPluginCfg)) {
    $resolvedTarget = [IO.Path]::GetFullPath($target)
    if (-not $resolvedTarget.StartsWith($resolvedWebRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Deployment target escaped the A8 web root: $resolvedTarget"
    }
}

$existingTargets = @($targetJar, $targetJs, $targetPluginCfg) |
    Where-Object { Test-Path -LiteralPath $_ }
if ($existingTargets.Count -gt 0) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    foreach ($existing in $existingTargets) {
        $relative = $existing.Substring($resolvedWebRoot.Length)
        $backup = Join-Path $backupRoot $relative
        New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
        Copy-Item -LiteralPath $existing -Destination $backup -Force
    }
    Write-Host "Existing PoC files backed up to: $backupRoot"
}

foreach ($parent in @(
    (Split-Path -Parent $targetJar),
    (Split-Path -Parent $targetJs),
    (Split-Path -Parent $targetPluginCfg)
)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
}

Copy-Item -LiteralPath $sourceJar -Destination $targetJar -Force
Copy-Item -LiteralPath $sourceJs -Destination $targetJs -Force
Copy-Item -LiteralPath $sourcePluginCfg -Destination $targetPluginCfg -Force

Write-Host 'Deployed FileZ zero-source bootstrap PoC:'
foreach ($target in @($targetJar, $targetJs, $targetPluginCfg)) {
    $hash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    Write-Host "  $target"
    Write-Host "    SHA256 $hash"
}
Write-Host 'A8 was not started.'
