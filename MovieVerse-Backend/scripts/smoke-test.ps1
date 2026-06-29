# Smoke test for the MovieVerse-Backend API. Requires the dev server on :8080.
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080'
function Show($name, $obj) {
  Write-Host "=== $name ===" -ForegroundColor Cyan
  $obj | ConvertTo-Json -Depth 6 -Compress
}

Show 'health' (Invoke-RestMethod "$base/health")

$u = "tester$(Get-Random -Maximum 99999)"
$pw = 'Sup3rSecret!'
Show 'register' (Invoke-RestMethod "$base/api/auth/register" -Method Post -ContentType 'application/json' `
    -Body (@{ username = $u; email = "$u@example.com"; password = $pw } | ConvertTo-Json))

$login = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType 'application/json' `
    -Body (@{ username = $u; password = $pw } | ConvertTo-Json)
Show 'login' $login
$H = @{ Authorization = "Bearer $($login.token)" }

Show 'check-username' (Invoke-RestMethod "$base/api/auth/check-username?username=$u")
Show 'validate-session' (Invoke-RestMethod "$base/api/auth/validate-session" -Headers $H)
Show 'getEmail' (Invoke-RestMethod "$base/api/auth/getEmail" -Headers $H)

Show 'web/catalog' (Invoke-RestMethod "$base/api/web/catalog?page=1&page_size=3")
Show 'web/search' (Invoke-RestMethod "$base/api/web/search/the?page=1")
Show 'web/movie' (Invoke-RestMethod "$base/api/web/movie/Inception").title

$tinder = Invoke-RestMethod "$base/api/TinderMovies" -Headers $H
Show 'TinderMovies(count)' $tinder.Count
$mid = $tinder[0].id

Show 'searchMovie' (Invoke-RestMethod "$base/api/searchMovie/dark" -Headers $H).Count
Show 'fetchMovieInfo' (Invoke-RestMethod "$base/api/fetchMovieInfo/$mid" -Headers $H).title
Show 'shorts/random-trailers' (Invoke-RestMethod "$base/api/shorts/random-trailers" -Headers $H).Count

Show 'addRatings' (Invoke-RestMethod "$base/api/addRatings" -Method Post -Headers $H -ContentType 'application/json' `
    -Body (@{ movie_id = $mid; rating = 5 } | ConvertTo-Json))
Show 'movie/:id/rate' (Invoke-RestMethod "$base/api/movie/$mid/rate" -Method Post -Headers $H -ContentType 'application/json' `
    -Body (@{ rating = 4 } | ConvertTo-Json))
Show 'movie/:id/rating' (Invoke-RestMethod "$base/api/movie/$mid/rating" -Headers $H)
Show 'getRatings' (Invoke-RestMethod "$base/api/getRatings/$u/$mid" -Headers $H)

Show 'watchlist/add' (Invoke-RestMethod "$base/api/watchlist/add" -Method Post -Headers $H -ContentType 'application/json' `
    -Body (@{ movie_id = $mid } | ConvertTo-Json))
Show 'watchlist' (Invoke-RestMethod "$base/api/watchlist/" -Headers $H).Count

Show 'recommendations(POST)' (Invoke-RestMethod "$base/api/recommendations/" -Method Post -Headers $H -ContentType 'application/json' -Body '{}').Count
Show 'from-ratings' (Invoke-RestMethod "$base/api/recommendations/from-ratings" -Headers $H)
Show 'temp-add' (Invoke-RestMethod "$base/api/recommendations/temp-add" -Method Post -Headers $H -ContentType 'application/json' -Body '{}').message

$mood = Invoke-RestMethod "$base/ai/recommend" -Method Post -Headers $H -ContentType 'application/json' -Body (@{ mood = 'I want to laugh' } | ConvertTo-Json)
Show 'ai/recommend(mood)->genre' @{ genre = $mood.genre; recs = $mood.recommendations.Count }

Write-Host "`nALL SMOKE TESTS PASSED" -ForegroundColor Green
