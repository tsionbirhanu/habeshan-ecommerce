$filePath = "app/(auth)/reset-password/page.tsx"
$lines = Get-Content -LiteralPath $filePath
$seen = @{}
$filteredLines = $lines | Where-Object {
    $line = $_.Trim()
    if ($line -match 'import.*Suspense.*from.*react') {
        if ($seen[$line]) {
            $false
        } else {
            $seen[$line] = $true
            $true
        }
    } else {
        $true
    }
}
$filteredLines | Set-Content -LiteralPath $filePath
