$ErrorActionPreference = 'Stop'

$localWeb = Join-Path $PSScriptRoot 'web'
$repoWeb = Join-Path $PSScriptRoot '..\..\web'
if (Test-Path (Join-Path $localWeb 'index.html')) {
    $WebRoot = (Resolve-Path $localWeb).Path
} elseif (Test-Path (Join-Path $repoWeb 'index.html')) {
    $WebRoot = (Resolve-Path $repoWeb).Path
} else {
    Write-Host 'AutoCart web files were not found.' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.svg' = 'image/svg+xml'
    '.css' = 'text/css; charset=utf-8'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.ico' = 'image/x-icon'
}

$listener = $null
$port = 8765
foreach ($candidate in 8765..8795) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidate)
        $listener.Start()
        $port = $candidate
        break
    } catch {
        if ($listener) { try { $listener.Stop() } catch {} }
        $listener = $null
    }
}
if (-not $listener) {
    Write-Host 'AutoCart could not find a free local port.' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host 'AutoCart PC is running.' -ForegroundColor Cyan
Write-Host $url -ForegroundColor Green
Write-Host 'Keep this window open while using AutoCart.' -ForegroundColor DarkGray
Write-Host 'Press Ctrl+C to stop it.' -ForegroundColor DarkGray
Write-Host ''
Start-Process $url

function Send-Response($stream, [int]$status, [string]$statusText, [byte[]]$body, [string]$contentType) {
    $header = "HTTP/1.1 $status $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }
            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2 -or $parts[0] -ne 'GET') {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Method not allowed')
                Send-Response $stream 405 'Method Not Allowed' $body 'text/plain; charset=utf-8'
                continue
            }
            $rawPath = $parts[1].Split('?')[0]
            $path = [Uri]::UnescapeDataString($rawPath)
            if ($path -eq '/') { $path = '/index.html' }
            $relative = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $fullPath = [System.IO.Path]::GetFullPath((Join-Path $WebRoot $relative))
            $rootPrefix = [System.IO.Path]::GetFullPath($WebRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
            if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $fullPath -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
                Send-Response $stream 404 'Not Found' $body 'text/plain; charset=utf-8'
                continue
            }
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
            $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            Send-Response $stream 200 'OK' $bytes $type
        } catch {
            try {
                $body = [System.Text.Encoding]::UTF8.GetBytes('AutoCart local server error')
                Send-Response $stream 500 'Internal Server Error' $body 'text/plain; charset=utf-8'
            } catch {}
        } finally {
            $client.Close()
        }
    }
} finally {
    if ($listener) { $listener.Stop() }
}
