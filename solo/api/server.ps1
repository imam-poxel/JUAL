param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$StaticDir = Join-Path $RootDir "public"
$DataDir = Join-Path $RootDir "data"

New-Item -ItemType Directory -Force -Path $StaticDir | Out-Null
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

function New-Id {
  [Guid]::NewGuid().ToString("N")
}

function Get-NowIso {
  (Get-Date).ToUniversalTime().ToString("o")
}

function Read-JsonFile {
  param([string]$Path, $DefaultValue)
  if (-not (Test-Path $Path)) {
    $DefaultValue | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Path
  }
  $raw = Get-Content -Raw -Encoding UTF8 $Path
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $DefaultValue
  }
  return $raw | ConvertFrom-Json
}

function Write-JsonFile {
  param([string]$Path, $Value)
  $Value | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Path
}

function Get-Db {
  $dbPath = Join-Path $DataDir "db.json"
  $default = @{
    users = @()
    sessions = @()
    enrollments = @()
    courses = @()
    lessons = @()
    exercises = @()
    attempts = @()
    posts = @()
    comments = @()
    reactions = @()
    achievements = @()
    userAchievements = @()
  }
  return Read-JsonFile -Path $dbPath -DefaultValue $default
}

function Save-Db {
  param($db)
  $dbPath = Join-Path $DataDir "db.json"
  Write-JsonFile -Path $dbPath -Value $db
}

function Ensure-SeedData {
  $db = Get-Db
  if ($db.courses.Count -gt 0) { return }

  $courseEnA1 = @{
    id = (New-Id)
    targetLanguage = "en"
    level = "A1"
    title = "English Foundations A1"
    description = "Core survival English: greetings, daily routines, and essential sentence patterns."
    createdAt = (Get-NowIso)
  }
  $courseJaN5 = @{
    id = (New-Id)
    targetLanguage = "ja"
    level = "N5"
    title = "Japanese Starter N5"
    description = "Kana basics, particle intuition, and beginner listening with short dialogues."
    createdAt = (Get-NowIso)
  }
  $courseKo1 = @{
    id = (New-Id)
    targetLanguage = "ko"
    level = "1"
    title = "Korean Beginner 1"
    description = "Hangul reading, basic verbs, and listening drills for everyday situations."
    createdAt = (Get-NowIso)
  }

  $db.courses = @($courseEnA1, $courseJaN5, $courseKo1)

  $lessons = @(
    @{
      id = (New-Id); courseId = $courseEnA1.id; sortOrder = 1; title = "Hello & Introductions";
      content = "Key phrases: Hello, Nice to meet you, I am ...\nPattern: I am + name.\nMini dialogue: A: Hello. B: Hello. Nice to meet you."; audioUrl = $null
    },
    @{
      id = (New-Id); courseId = $courseEnA1.id; sortOrder = 2; title = "Daily Routine";
      content = "Verbs: wake up, work, study, sleep.\nPattern: I + verb + at + time.\nListening focus: reduced forms in everyday speech."; audioUrl = $null
    },
    @{
      id = (New-Id); courseId = $courseJaN5.id; sortOrder = 1; title = "Kana Warm-up";
      content = "Practice reading: a i u e o\nMini phrases: hai / iie\nListening: short kana recognition."; audioUrl = $null
    },
    @{
      id = (New-Id); courseId = $courseKo1.id; sortOrder = 1; title = "Hangul in 10 Minutes";
      content = "Consonants and vowels basics.\nReading drills and sound-to-letter mapping.\nShadowing: short syllable chains."; audioUrl = $null
    }
  )
  $db.lessons = $lessons

  $lesson1 = $lessons[0].id
  $lesson2 = $lessons[1].id

  $db.exercises = @(
    @{
      id = (New-Id); lessonId = $lesson1; type = "vocab"; prompt = "Recall: 'Nice to meet you'";
      data = @{ answer = "Nice to meet you"; variants = @("Nice to meet you.", "Nice to meet you!") }
    },
    @{
      id = (New-Id); lessonId = $lesson1; type = "grammar"; prompt = "Complete: I am ___ (your name)";
      data = @{ answer = "Alex"; explanation = "Use 'I am + name' to introduce yourself." }
    },
    @{
      id = (New-Id); lessonId = $lesson2; type = "listening"; prompt = "Choose the correct meaning of: 'I wake up at seven.'";
      data = @{ choices = @("I sleep at seven.", "I get up at seven.", "I work at seven."); correctIndex = 1 }
    },
    @{
      id = (New-Id); lessonId = $lesson2; type = "shadowing"; prompt = "Shadow: 'I study every day.'";
      data = @{ text = "I study every day."; pace = "normal" }
    }
  )

  $db.achievements = @(
    @{ id = (New-Id); code = "FIRST_STEPS"; name = "First Steps"; description = "Complete your first attempt."; rule = @{ kind = "attempt_count"; min = 1 } },
    @{ id = (New-Id); code = "FIVE_ATTEMPTS"; name = "Momentum"; description = "Make 5 attempts."; rule = @{ kind = "attempt_count"; min = 5 } },
    @{ id = (New-Id); code = "STREAK_3"; name = "3-Day Streak"; description = "Study 3 days in a row."; rule = @{ kind = "streak_days"; min = 3 } }
  )

  Save-Db -db $db
}

function Get-CookieMap {
  param([string]$CookieHeader)
  $map = @{}
  if ([string]::IsNullOrWhiteSpace($CookieHeader)) { return $map }
  foreach ($part in ($CookieHeader -split ";")) {
    $kv = $part.Trim()
    if ($kv -match "^(?<k>[^=]+)=(?<v>.*)$") {
      $map[$matches["k"].Trim()] = $matches["v"].Trim()
    }
  }
  return $map
}

function Read-BodyJson {
  param($Request)
  if (-not $Request.HasEntityBody) { return $null }
  $reader = New-Object System.IO.StreamReader($Request.InputStream, $Request.ContentEncoding)
  $text = $reader.ReadToEnd()
  if ([string]::IsNullOrWhiteSpace($text)) { return $null }
  return $text | ConvertFrom-Json
}

function Write-Json {
  param($Response, $StatusCode, $Obj)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = "application/json; charset=utf-8"
  $payload = $Obj | ConvertTo-Json -Depth 20
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Response.OutputStream.Close()
}

function Write-Text {
  param($Response, $StatusCode, [string]$Text, [string]$ContentType)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = $ContentType
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Response.OutputStream.Close()
}

function Get-Mime {
  param([string]$Path)
  switch -Regex ($Path) {
    "\.html$" { "text/html; charset=utf-8" }
    "\.css$" { "text/css; charset=utf-8" }
    "\.js$" { "application/javascript; charset=utf-8" }
    "\.json$" { "application/json; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

function Hash-Password {
  param([string]$Password)
  $salt = New-Object byte[] 16
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($salt)
  $iterations = 120000
  $pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $salt, $iterations, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  $hash = $pbkdf2.GetBytes(32)
  return "${iterations}:$([Convert]::ToBase64String($salt)):$([Convert]::ToBase64String($hash))"
}

function Verify-Password {
  param([string]$Password, [string]$Stored)
  if ([string]::IsNullOrWhiteSpace($Stored)) { return $false }
  $parts = $Stored -split ":"
  if ($parts.Length -ne 3) { return $false }
  $iterations = [int]$parts[0]
  $salt = [Convert]::FromBase64String($parts[1])
  $expected = [Convert]::FromBase64String($parts[2])
  $pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Password, $salt, $iterations, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  $actual = $pbkdf2.GetBytes(32)
  return [System.Security.Cryptography.CryptographicOperations]::FixedTimeEquals($actual, $expected)
}

function Get-UserFromSession {
  param($Request)
  $cookies = Get-CookieMap -CookieHeader $Request.Headers["Cookie"]
  $sid = $cookies["session"]
  if ([string]::IsNullOrWhiteSpace($sid)) { return $null }
  $db = Get-Db
  $session = $db.sessions | Where-Object { $_.id -eq $sid } | Select-Object -First 1
  if (-not $session) { return $null }
  $user = $db.users | Where-Object { $_.id -eq $session.userId } | Select-Object -First 1
  return $user
}

function Public-User {
  param($user)
  if (-not $user) { return $null }
  return @{
    id = $user.id
    email = $user.email
    displayName = $user.displayName
    uiLanguage = $user.uiLanguage
    targetLanguages = $user.targetLanguages
    createdAt = $user.createdAt
  }
}

Ensure-SeedData

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Server running at $prefix"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response

    $path = $req.Url.AbsolutePath
    $method = $req.HttpMethod.ToUpperInvariant()

    if ($path.StartsWith("/api/")) {
      try {
        $db = Get-Db
        $user = Get-UserFromSession -Request $req

        if ($method -eq "POST" -and $path -eq "/api/auth/register") {
          $body = Read-BodyJson -Request $req
          $email = [string]$body.email
          $password = [string]$body.password
          $displayName = [string]$body.displayName
          $uiLanguage = if ($body.uiLanguage) { [string]$body.uiLanguage } else { "en" }
          $targetLanguages = @()
          if ($body.targetLanguages) { $targetLanguages = @($body.targetLanguages) } else { $targetLanguages = @("en") }

          if ([string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($displayName)) {
            Write-Json -Response $res -StatusCode 400 -Obj @{ code = "BAD_REQUEST"; message = "Missing fields." }
            continue
          }

          $existing = $db.users | Where-Object { $_.email -eq $email } | Select-Object -First 1
          if ($existing) {
            Write-Json -Response $res -StatusCode 409 -Obj @{ code = "EMAIL_TAKEN"; message = "Email already registered." }
            continue
          }

          $newUser = @{
            id = (New-Id)
            email = $email
            passwordHash = (Hash-Password -Password $password)
            displayName = $displayName
            uiLanguage = $uiLanguage
            targetLanguages = $targetLanguages
            createdAt = (Get-NowIso)
          }
          $db.users += $newUser

          $sid = (New-Id)
          $db.sessions += @{ id = $sid; userId = $newUser.id; createdAt = (Get-NowIso) }
          Save-Db -db $db

          $res.Headers.Add("Set-Cookie", "session=$sid; Path=/; HttpOnly; SameSite=Lax")
          Write-Json -Response $res -StatusCode 200 -Obj @{ user = (Public-User -user $newUser) }
          continue
        }

        if ($method -eq "POST" -and $path -eq "/api/auth/login") {
          $body = Read-BodyJson -Request $req
          $email = [string]$body.email
          $password = [string]$body.password

          $u = $db.users | Where-Object { $_.email -eq $email } | Select-Object -First 1
          if (-not $u) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "INVALID_CREDENTIALS"; message = "Invalid credentials." }
            continue
          }
          if (-not (Verify-Password -Password $password -Stored $u.passwordHash)) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "INVALID_CREDENTIALS"; message = "Invalid credentials." }
            continue
          }

          $sid = (New-Id)
          $db.sessions += @{ id = $sid; userId = $u.id; createdAt = (Get-NowIso) }
          Save-Db -db $db

          $res.Headers.Add("Set-Cookie", "session=$sid; Path=/; HttpOnly; SameSite=Lax")
          Write-Json -Response $res -StatusCode 200 -Obj @{ user = (Public-User -user $u) }
          continue
        }

        if ($method -eq "POST" -and $path -eq "/api/auth/logout") {
          $cookies = Get-CookieMap -CookieHeader $req.Headers["Cookie"]
          $sid = $cookies["session"]
          if ($sid) {
            $db.sessions = @($db.sessions | Where-Object { $_.id -ne $sid })
            Save-Db -db $db
          }
          $res.Headers.Add("Set-Cookie", "session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
          Write-Json -Response $res -StatusCode 200 -Obj @{ ok = $true }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/me") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          Write-Json -Response $res -StatusCode 200 -Obj @{ user = (Public-User -user $user) }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/courses") {
          $targetLanguage = $req.QueryString["targetLanguage"]
          $level = $req.QueryString["level"]
          $items = $db.courses
          if ($targetLanguage) { $items = @($items | Where-Object { $_.targetLanguage -eq $targetLanguage }) }
          if ($level) { $items = @($items | Where-Object { $_.level -eq $level }) }
          $courses = @(
            $items | ForEach-Object {
              $c = $_
              $lessonCount = @($db.lessons | Where-Object { $_.courseId -eq $c.id }).Count
              @{
                id = $c.id
                targetLanguage = $c.targetLanguage
                level = $c.level
                title = $c.title
                description = $c.description
                lessonCount = $lessonCount
              }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{ courses = $courses }
          continue
        }

        if ($method -eq "GET" -and $path -match "^/api/courses/(?<id>[a-f0-9]{32})$") {
          $courseId = $matches["id"]
          $course = $db.courses | Where-Object { $_.id -eq $courseId } | Select-Object -First 1
          if (-not $course) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Course not found." }
            continue
          }
          $lessons = @(
            $db.lessons | Where-Object { $_.courseId -eq $courseId } | Sort-Object sortOrder | ForEach-Object {
              @{
                id = $_.id
                courseId = $_.courseId
                order = $_.sortOrder
                title = $_.title
              }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{
            course = @{
              id = $course.id
              targetLanguage = $course.targetLanguage
              level = $course.level
              title = $course.title
              description = $course.description
            }
            lessons = $lessons
          }
          continue
        }

        if ($method -eq "POST" -and $path -match "^/api/courses/(?<id>[a-f0-9]{32})/enroll$") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $courseId = $matches["id"]
          $course = $db.courses | Where-Object { $_.id -eq $courseId } | Select-Object -First 1
          if (-not $course) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Course not found." }
            continue
          }
          $exists = $db.enrollments | Where-Object { $_.userId -eq $user.id -and $_.courseId -eq $courseId } | Select-Object -First 1
          if (-not $exists) {
            $db.enrollments += @{ userId = $user.id; courseId = $courseId; createdAt = (Get-NowIso) }
            Save-Db -db $db
          }
          Write-Json -Response $res -StatusCode 200 -Obj @{ ok = $true }
          continue
        }

        if ($method -eq "GET" -and $path -match "^/api/lessons/(?<id>[a-f0-9]{32})$") {
          $lessonId = $matches["id"]
          $lesson = $db.lessons | Where-Object { $_.id -eq $lessonId } | Select-Object -First 1
          if (-not $lesson) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Lesson not found." }
            continue
          }
          Write-Json -Response $res -StatusCode 200 -Obj @{
            lesson = @{
              id = $lesson.id
              courseId = $lesson.courseId
              order = $lesson.sortOrder
              title = $lesson.title
              content = $lesson.content
              audioUrl = $lesson.audioUrl
            }
          }
          continue
        }

        if ($method -eq "GET" -and $path -match "^/api/lessons/(?<id>[a-f0-9]{32})/exercises$") {
          $lessonId = $matches["id"]
          $ex = @(
            $db.exercises | Where-Object { $_.lessonId -eq $lessonId } | ForEach-Object {
              @{ id = $_.id; lessonId = $_.lessonId; type = $_.type; prompt = $_.prompt; data = $_.data }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{ exercises = $ex }
          continue
        }

        if ($method -eq "POST" -and $path -eq "/api/attempts") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $body = Read-BodyJson -Request $req
          $exerciseId = [string]$body.exerciseId
          $isCorrect = [bool]$body.isCorrect
          $score = $body.score
          $durationMs = $body.durationMs

          $exercise = $db.exercises | Where-Object { $_.id -eq $exerciseId } | Select-Object -First 1
          if (-not $exercise) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Exercise not found." }
            continue
          }

          $attempt = @{
            id = (New-Id)
            userId = $user.id
            exerciseId = $exerciseId
            isCorrect = $isCorrect
            score = $score
            durationMs = $durationMs
            createdAt = (Get-NowIso)
          }
          $db.attempts += $attempt
          Save-Db -db $db
          Write-Json -Response $res -StatusCode 200 -Obj @{ attempt = $attempt }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/progress/summary") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $userAttempts = @($db.attempts | Where-Object { $_.userId -eq $user.id })
          $total = $userAttempts.Count
          $correct = @($userAttempts | Where-Object { $_.isCorrect -eq $true }).Count
          $accuracy = if ($total -gt 0) { [Math]::Round(($correct / $total) * 100, 1) } else { 0 }

          $enrolled = @($db.enrollments | Where-Object { $_.userId -eq $user.id } | ForEach-Object { $_.courseId })
          $enrolledCourses = @($db.courses | Where-Object { $enrolled -contains $_.id })

          $summary = @{
            attemptCount = $total
            accuracyPct = $accuracy
            enrolledCourses = @($enrolledCourses | ForEach-Object { @{ id = $_.id; title = $_.title; targetLanguage = $_.targetLanguage; level = $_.level } })
          }
          Write-Json -Response $res -StatusCode 200 -Obj @{ summary = $summary }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/progress/review-queue") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $attempts = @($db.attempts | Where-Object { $_.userId -eq $user.id } | Sort-Object createdAt -Descending)
          $byExercise = @{}
          foreach ($a in $attempts) {
            if (-not $byExercise.ContainsKey($a.exerciseId)) { $byExercise[$a.exerciseId] = @() }
            $byExercise[$a.exerciseId] += $a
          }

          $queue = @()
          foreach ($ex in $db.exercises) {
            if (-not $byExercise.ContainsKey($ex.id)) { continue }
            $hist = $byExercise[$ex.id]
            $recent = $hist[0]
            $recentCorrect = [bool]$recent.isCorrect
            if (-not $recentCorrect) {
              $queue += @{ exerciseId = $ex.id; type = $ex.type; prompt = $ex.prompt; reason = "Recent incorrect attempt" }
            }
          }
          $queue = @($queue | Select-Object -First 20)
          Write-Json -Response $res -StatusCode 200 -Obj @{ queue = $queue }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/recommendations/daily") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $enrolled = @($db.enrollments | Where-Object { $_.userId -eq $user.id } | ForEach-Object { $_.courseId })
          $courseId = if ($enrolled.Count -gt 0) { $enrolled[0] } else { $db.courses[0].id }
          $lessons = @($db.lessons | Where-Object { $_.courseId -eq $courseId } | Sort-Object sortOrder)
          $nextLesson = if ($lessons.Count -gt 0) { $lessons[0] } else { $null }
          $review = @()
          $attempts = @($db.attempts | Where-Object { $_.userId -eq $user.id } | Sort-Object createdAt -Descending)
          $bad = $attempts | Where-Object { $_.isCorrect -eq $false } | Select-Object -First 1
          if ($bad) {
            $ex = $db.exercises | Where-Object { $_.id -eq $bad.exerciseId } | Select-Object -First 1
            if ($ex) {
              $review += @{ kind = "review"; targetId = $ex.id; reason = "Reinforce a recent weak spot."; priority = 10 }
            }
          }
          $recs = @()
          if ($nextLesson) {
            $recs += @{ kind = "lesson"; targetId = $nextLesson.id; reason = "Continue your leveled course."; priority = 9 }
          }
          foreach ($r in $review) { $recs += $r }
          Write-Json -Response $res -StatusCode 200 -Obj @{ recommendations = $recs }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/community/posts") {
          $posts = @(
            $db.posts | Sort-Object createdAt -Descending | Select-Object -First 50 | ForEach-Object {
              $p = $_
              $author = $db.users | Where-Object { $_.id -eq $p.userId } | Select-Object -First 1
              @{
                id = $p.id
                user = if ($author) { @{ id = $author.id; displayName = $author.displayName } } else { $null }
                targetLanguage = $p.targetLanguage
                title = $p.title
                body = $p.body
                createdAt = $p.createdAt
                reactionCount = @($db.reactions | Where-Object { $_.postId -eq $p.id }).Count
                commentCount = @($db.comments | Where-Object { $_.postId -eq $p.id }).Count
              }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{ posts = $posts }
          continue
        }

        if ($method -eq "POST" -and $path -eq "/api/community/posts") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $body = Read-BodyJson -Request $req
          $title = [string]$body.title
          $text = [string]$body.body
          $targetLanguage = if ($body.targetLanguage) { [string]$body.targetLanguage } else { "en" }
          if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($text)) {
            Write-Json -Response $res -StatusCode 400 -Obj @{ code = "BAD_REQUEST"; message = "Missing fields." }
            continue
          }
          $post = @{ id = (New-Id); userId = $user.id; targetLanguage = $targetLanguage; title = $title; body = $text; createdAt = (Get-NowIso) }
          $db.posts += $post
          Save-Db -db $db
          Write-Json -Response $res -StatusCode 200 -Obj @{ post = $post }
          continue
        }

        if ($method -eq "GET" -and $path -match "^/api/community/posts/(?<id>[a-f0-9]{32})$") {
          $postId = $matches["id"]
          $post = $db.posts | Where-Object { $_.id -eq $postId } | Select-Object -First 1
          if (-not $post) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Post not found." }
            continue
          }
          $author = $db.users | Where-Object { $_.id -eq $post.userId } | Select-Object -First 1
          $comments = @(
            $db.comments | Where-Object { $_.postId -eq $postId } | Sort-Object createdAt | ForEach-Object {
              $c = $_
              $cu = $db.users | Where-Object { $_.id -eq $c.userId } | Select-Object -First 1
              @{ id = $c.id; body = $c.body; createdAt = $c.createdAt; user = if ($cu) { @{ id = $cu.id; displayName = $cu.displayName } } else { $null } }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{
            post = @{
              id = $post.id
              user = if ($author) { @{ id = $author.id; displayName = $author.displayName } } else { $null }
              targetLanguage = $post.targetLanguage
              title = $post.title
              body = $post.body
              createdAt = $post.createdAt
              reactionCount = @($db.reactions | Where-Object { $_.postId -eq $postId }).Count
            }
            comments = $comments
          }
          continue
        }

        if ($method -eq "POST" -and $path -match "^/api/community/posts/(?<id>[a-f0-9]{32})/comments$") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $postId = $matches["id"]
          $post = $db.posts | Where-Object { $_.id -eq $postId } | Select-Object -First 1
          if (-not $post) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Post not found." }
            continue
          }
          $body = Read-BodyJson -Request $req
          $text = [string]$body.body
          if ([string]::IsNullOrWhiteSpace($text)) {
            Write-Json -Response $res -StatusCode 400 -Obj @{ code = "BAD_REQUEST"; message = "Missing fields." }
            continue
          }
          $c = @{ id = (New-Id); postId = $postId; userId = $user.id; body = $text; createdAt = (Get-NowIso) }
          $db.comments += $c
          Save-Db -db $db
          Write-Json -Response $res -StatusCode 200 -Obj @{ comment = $c }
          continue
        }

        if ($method -eq "POST" -and $path -match "^/api/community/posts/(?<id>[a-f0-9]{32})/reactions$") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $postId = $matches["id"]
          $post = $db.posts | Where-Object { $_.id -eq $postId } | Select-Object -First 1
          if (-not $post) {
            Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Post not found." }
            continue
          }
          $existing = $db.reactions | Where-Object { $_.postId -eq $postId -and $_.userId -eq $user.id } | Select-Object -First 1
          if ($existing) {
            $db.reactions = @($db.reactions | Where-Object { -not ($_.postId -eq $postId -and $_.userId -eq $user.id) })
          } else {
            $db.reactions += @{ id = (New-Id); postId = $postId; userId = $user.id; createdAt = (Get-NowIso) }
          }
          Save-Db -db $db
          Write-Json -Response $res -StatusCode 200 -Obj @{ ok = $true; reactionCount = @($db.reactions | Where-Object { $_.postId -eq $postId }).Count }
          continue
        }

        if ($method -eq "GET" -and $path -eq "/api/achievements") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $earnedIds = @($db.userAchievements | Where-Object { $_.userId -eq $user.id } | ForEach-Object { $_.achievementId })
          $items = @(
            $db.achievements | ForEach-Object {
              @{
                code = $_.code
                name = $_.name
                description = $_.description
                earned = ($earnedIds -contains $_.id)
              }
            }
          )
          Write-Json -Response $res -StatusCode 200 -Obj @{ achievements = $items }
          continue
        }

        if ($method -eq "POST" -and $path -eq "/api/achievements/claim") {
          if (-not $user) {
            Write-Json -Response $res -StatusCode 401 -Obj @{ code = "UNAUTHORIZED"; message = "Login required." }
            continue
          }
          $attemptCount = @($db.attempts | Where-Object { $_.userId -eq $user.id }).Count
          $earned = @($db.userAchievements | Where-Object { $_.userId -eq $user.id } | ForEach-Object { $_.achievementId })
          $newEarned = @()
          foreach ($a in $db.achievements) {
            if ($earned -contains $a.id) { continue }
            if ($a.rule.kind -eq "attempt_count" -and $attemptCount -ge [int]$a.rule.min) {
              $db.userAchievements += @{ userId = $user.id; achievementId = $a.id; createdAt = (Get-NowIso) }
              $newEarned += $a.code
            }
          }
          Save-Db -db $db
          Write-Json -Response $res -StatusCode 200 -Obj @{ earned = $newEarned }
          continue
        }

        Write-Json -Response $res -StatusCode 404 -Obj @{ code = "NOT_FOUND"; message = "Unknown API route." }
      } catch {
        Write-Json -Response $res -StatusCode 500 -Obj @{ code = "SERVER_ERROR"; message = $_.Exception.Message }
      }
      continue
    }

    if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
      $filePath = Join-Path $StaticDir "index.html"
    } else {
      $clean = $path.TrimStart("/") -replace "/", "\"
      $filePath = Join-Path $StaticDir $clean
      if (-not (Test-Path $filePath)) {
        $filePath = Join-Path $StaticDir "index.html"
      }
    }

    if (-not (Test-Path $filePath)) {
      Write-Text -Response $res -StatusCode 404 -Text "Not found" -ContentType "text/plain; charset=utf-8"
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $res.StatusCode = 200
    $res.ContentType = (Get-Mime -Path $filePath)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.OutputStream.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
