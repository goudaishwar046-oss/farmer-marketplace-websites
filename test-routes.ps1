Write-Host "🧪 COMPREHENSIVE DASHBOARD TEST SUITE" -ForegroundColor Cyan
Write-Host "=" * 70

$routes = @(
    @{ name = "Homepage"; url = "http://localhost:3000/" },
    @{ name = "Auth Page"; url = "http://localhost:3000/auth" },
    @{ name = "Consumer Dashboard"; url = "http://localhost:3000/consumer" },
    @{ name = "Farmer Dashboard"; url = "http://localhost:3000/farmer/dashboard" },
    @{ name = "Delivery Dashboard"; url = "http://localhost:3000/delivery-boy" },
    @{ name = "Dashboard Redirect"; url = "http://localhost:3000/dashboard-redirect" }
)

$passed = 0
$failed = 0

foreach ($route in $routes) {
    Write-Host "`n📄 Testing: $($route.name)" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $route.url -UseBasicParsing -TimeoutSec 5
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   ✅ Size: $(($response.Content.Length / 1KB).ToString('F2')) KB" -ForegroundColor Green
        $passed++
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "📊 RESULTS" -ForegroundColor Cyan
Write-Host "   ✅ Passed: $passed/$($routes.Count)" -ForegroundColor Green
Write-Host "   ❌ Failed: $failed/$($routes.Count)" -ForegroundColor $(if($failed -eq 0) { "Green" } else { "Red" })
$rate = [math]::Round(($passed / $routes.Count) * 100, 1)
Write-Host "   📈 Success: $rate%" -ForegroundColor Green
Write-Host "=" * 70
