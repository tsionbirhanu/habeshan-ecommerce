$filePath = "app\(shop)\products\[slug]\page.tsx"
$content = Get-Content $filePath | Out-String
$content = $content -replace 'const resolvedParams = use\(params\);', ''
$content = $content -replace 'resolvedParams', 'params'
$content | Set-Content $filePath
