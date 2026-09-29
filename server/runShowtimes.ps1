# CineBook automatic showtime updater

$node = "C:\Program Files\nodejs\node.exe"
$script = "C:\CineBook\server\addShowtimes.js"

Write-Host "Starting CineBook showtime update..."

Set-Location "C:\CineBook\server"

& $node $script

Write-Host "Showtime update finished."
