$filePath = "app/(auth)/reset-password/page.tsx"
$lines = Get-Content -LiteralPath $filePath -TotalCount 258
$lines | Set-Content -LiteralPath $filePath
