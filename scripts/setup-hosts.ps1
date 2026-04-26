# =============================================================================
# Miami Store — Setup hosts file (Windows) — VERSÃO 2 (idempotente, restaura)
#
# Reescreve o hosts file com conteúdo padrão do Windows + entradas Miami.
# Funciona mesmo se o arquivo estiver vazio ou corrompido.
#
# COMO RODAR (precisa admin):
#   Botão direito → "Executar com PowerShell" → clicar Sim no UAC
# =============================================================================

$hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"

# Verifica admin + auto-eleva
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "[!] Reabrindo como administrador..." -ForegroundColor Yellow
    Start-Process powershell.exe "-ExecutionPolicy Bypass -NoProfile -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Conteúdo padrão Windows (cabeçalho oficial Microsoft)
$defaultHeader = @"
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
"@

# Lê conteúdo atual (se existir e não estiver vazio)
$existing = ""
if (Test-Path $hostsPath) {
    $size = (Get-Item $hostsPath).Length
    if ($size -gt 0) {
        $existing = Get-Content $hostsPath -Raw -Encoding UTF8
        if ($null -eq $existing) { $existing = "" }
    }
}

# Preserva linhas customizadas que NÃO sejam Miami nem o header padrão
$customLines = @()
if ($existing.Length -gt 0) {
    $lines = $existing -split "`r?`n"
    $skipBlock = $false
    foreach ($line in $lines) {
        # Pula bloco Miami antigo (re-cria abaixo)
        if ($line -match "Miami Store" -or $line -match "miami\.test") {
            continue
        }
        $customLines += $line
    }
}

# Monta novo conteúdo
$miamiBlock = @"

# Miami Store dev
127.0.0.1 miami.test admin.miami.test api.miami.test
"@

if ($customLines.Count -gt 0 -and ($customLines -join "").Trim().Length -gt 0) {
    # Tinha conteúdo customizado: preserva + adiciona Miami
    $newContent = (($customLines -join "`r`n").TrimEnd()) + "`r`n" + $miamiBlock + "`r`n"
} else {
    # Arquivo estava vazio/corrompido: usa template padrão
    $newContent = $defaultHeader + "`r`n" + $miamiBlock + "`r`n"
}

# Escreve em ASCII (formato esperado pelo Windows pro hosts file)
[System.IO.File]::WriteAllText($hostsPath, $newContent, [System.Text.Encoding]::ASCII)

$newSize = (Get-Item $hostsPath).Length
Write-Host "[OK] hosts file reescrito ($newSize bytes)" -ForegroundColor Green

# Limpa cache DNS
ipconfig /flushdns | Out-Null
Write-Host "[OK] Cache DNS limpo" -ForegroundColor Green

# Testa resolução
Write-Host ""
Write-Host "Testando resolucao DNS..." -ForegroundColor Cyan
$allOk = $true
foreach ($name in @("miami.test", "admin.miami.test", "api.miami.test")) {
    Start-Sleep -Milliseconds 200
    $resolved = $null
    try {
        $resolved = (Resolve-DnsName -Name $name -ErrorAction Stop | Where-Object { $_.IPAddress } | Select-Object -First 1).IPAddress
    } catch { }

    if ($resolved -eq "127.0.0.1") {
        Write-Host "  [OK] $name -> 127.0.0.1" -ForegroundColor Green
    } else {
        Write-Host "  [X]  $name -> $resolved (esperado 127.0.0.1)" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "TUDO PRONTO. Acessa:" -ForegroundColor Green
    Write-Host "  http://miami.test         -> Loja"
    Write-Host "  http://admin.miami.test   -> Painel admin"
    Write-Host "  http://api.miami.test     -> API (debug)"
} else {
    Write-Host "Algumas resolucoes falharam. Conteudo atual do hosts file:" -ForegroundColor Yellow
    Get-Content $hostsPath
}

Write-Host ""
Write-Host "Aperta ENTER pra fechar..."
Read-Host
