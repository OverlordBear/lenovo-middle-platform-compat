param(
    [string]$A8Home = 'E:\Seeyon\A8'
)

$ErrorActionPreference = 'Stop'

$webRoot = Join-Path $A8Home 'ApacheJetspeed\webapps\seeyon'
$targets = @(
    (Join-Path $webRoot 'WEB-INF\lib\customer\ruian-filez-poc-0.1.0.jar'),
    (Join-Path $webRoot 'apps_res\ruian-filez-poc\bootstrap.js'),
    (Join-Path $webRoot 'WEB-INF\cfgHome\plugin\ruianFilezPoc\pluginCfg.xml')
)

$running = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match 'java|tomcat' -and
        $_.CommandLine -match 'Seeyon|ApacheJetspeed|catalina'
    }
if ($running) {
    throw 'A8/Tomcat is running. Stop it before undeploying this PoC.'
}

$resolvedWebRoot = [IO.Path]::GetFullPath($webRoot).TrimEnd('\') + '\'
foreach ($target in $targets) {
    $resolvedTarget = [IO.Path]::GetFullPath($target)
    if (-not $resolvedTarget.StartsWith($resolvedWebRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Undeployment target escaped the A8 web root: $resolvedTarget"
    }
}

foreach ($target in $targets) {
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Force
        Write-Host "Removed: $target"
    }
}

foreach ($directory in @(
    (Join-Path $webRoot 'apps_res\ruian-filez-poc'),
    (Join-Path $webRoot 'WEB-INF\cfgHome\plugin\ruianFilezPoc')
)) {
    if (
        (Test-Path -LiteralPath $directory) -and
        (Get-ChildItem -LiteralPath $directory -Force | Measure-Object).Count -eq 0
    ) {
        Remove-Item -LiteralPath $directory -Force
        Write-Host "Removed empty directory: $directory"
    }
}

Write-Host 'PoC undeployed. No Seeyon standard file was removed.'
