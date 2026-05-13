$filePath = "app/(shop)/products/[slug]/page.tsx"
$lines = Get-Content -LiteralPath $filePath
$filteredLines = $lines | Where-Object { $_ -notmatch 'const params = use\(params\);' }
$filteredLines | Set-Content -LiteralPath $filePath
