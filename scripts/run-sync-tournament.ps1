$ErrorActionPreference = "Stop"

$projectDir = "C:\Users\ruben\LLM6370\SportsChatPlus-V2"
Set-Location $projectDir

$startTime = Get-Date
Write-Host "[$startTime] Starting tournament sync..."

npm run sync:tournament
$exitCode = $LASTEXITCODE

$endTime = Get-Date

if ($exitCode -ne 0) {
    Write-Error "[$endTime] Tournament sync FAILED with exit code $exitCode"
    exit $exitCode
}

Write-Host "[$endTime] Tournament sync completed successfully."
