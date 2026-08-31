# Run this instead of "mvn spring-boot:run" directly.
# Sets the "local" Spring profile (which loads application-local.properties,
# containing your TMDB key) and starts the backend in one step — no more
# forgetting the environment variable in a fresh terminal.
#
# Usage:  .\run-local.ps1

$env:SPRING_PROFILES_ACTIVE = "local"
Write-Host "SPRING_PROFILES_ACTIVE set to 'local' — starting backend..." -ForegroundColor Cyan
mvn spring-boot:run
