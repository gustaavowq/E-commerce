# =============================================================================
# Kore Tech — Setup hosts file (Windows) — idempotente, auto-eleva
#
# Adiciona ao hosts file:
#   127.0.0.1 loja.kore.test admin.kore.test api.kore.test
#
# COMO RODAR (precisa admin):
#   Botao direito -> "Executar com PowerShell" -> clicar Sim no UAC
# =============================================================================

$hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"

# Verifica admin + auto-eleva
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "[!] Reabrindo como administrador..." -ForegroundColor Yellow
    Start-Process powershell.exe "-ExecutionPolicy Bypass -NoProfile -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Le conteudo atual (preserva tudo que nao seja Kore Tech)
$existing = ""
if (Test-Path $hostsPath) {
    $size = (Get-Item $hostsPath).Length
    if ($size -gt 0) {
        $existing = Get-Content $hostsPath -Raw -Encoding UTF8
        if ($null -eq $existing) { $existing = "" }
    }
}

$customLines = @()
if ($existing.Length -gt 0) {
    $lines = $existing -split "`r?`n"
    foreach ($line in $lines) {
        # Pula bloco Kore Tech antigo (re-cria abaixo)
        if ($line -match "Kore Tech" -or $line -match "kore\.test") {
            continue
        }
        $customLines += $line
    }
}

# Bloco Kore Tech
$koreBlock = @"

# Kore Tech dev
127.0.0.1 loja.kore.test admin.kore.test api.kore.test
"@

if ($customLines.Count -gt 0 -and ($customLines -join "").Trim().Length -gt 0) {
    $newContent = (($customLines -join "`r`n").TrimEnd()) + "`r`n" + $koreBlock + "`r`n"
} else {
    $defaultHeader = @"
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
"@
    $newContent = $defaultHeader + "`r`n" + $koreBlock + "`r`n"
}

# Escreve em ASCII (formato esperado pelo Windows)
[System.IO.File]::WriteAllText($hostsPath, $newContent, [System.Text.Encoding]::ASCII)

$newSize = (Get-Item $hostsPath).Length
Write-Host "[OK] hosts file atualizado ($newSize bytes)" -ForegroundColor Green

# Limpa cache DNS
ipconfig /flushdns | Out-Null
Write-Host "[OK] Cache DNS limpo" -ForegroundColor Green

# Testa resolucao
Write-Host ""
Write-Host "Testando resolucao DNS..." -ForegroundColor Cyan
$allOk = $true
foreach ($name in @("loja.kore.test", "admin.kore.test", "api.kore.test")) {
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
    Write-Host "TUDO PRONTO. Sobe os containers em src\projeto-tech\kore-tech\infra\:" -ForegroundColor Green
    Write-Host "  docker compose up -d"
    Write-Host ""
    Write-Host "Acessa:" -ForegroundColor Green
    Write-Host "  http://loja.kore.test:8081     -> Loja"
    Write-Host "  http://admin.kore.test:8081    -> Painel admin"
    Write-Host "  http://api.kore.test:8081      -> API"
} else {
    Write-Host "Algumas resolucoes falharam. Conteudo atual do hosts file:" -ForegroundColor Yellow
    Get-Content $hostsPath
}

Write-Host ""
Write-Host "Aperta ENTER pra fechar..."
Read-Host
