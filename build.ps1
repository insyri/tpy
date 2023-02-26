#Requires -Version 7.0
# Script uses ternary operator.
# Also to avoid environment conflicts

Param(
  [Parameter(Mandatory = $false, Position = 0)]
  [string] $Version,

  [Parameter(Mandatory = $false, Position = 1)]
  [switch] $Esm,

  [Parameter(Mandatory = $false, Position = 2)]
  [switch] $Reset,

  [Parameter(Mandatory = $false, Position = 3)]
  [switch] $Quiet
)

If ((Get-Location).Path -notlike '*tpy') {
  Write-Error "Not in project root"
  Exit
}

# Injection

$ItemList = "src", "README.md", "LICENSE", "mod.ts"
$DeleteList = "lib", "node_modules", "mod.js", "mod.d.ts"
$Destination = "node"
$NodePackageLocation = "$Destination/package.json"
$ImportRegex = "(?<=(?<=\n|^)(im|ex)port(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"
$NodeOnlyRegex = "\/\/ build:node-only "
$DiscordAPIRegex = "(?<=discord-api-types\/[a-z]+\/v8)\/guild"

Function Log {
  Param(
    [string] $str
  )
  If (-not $Quiet) {
    ""
    Write-Host "Tpy Build: " -ForegroundColor DarkBlue -NoNewline
    $str
  }
}

Log "Searching for previous build artifacts"

[string[]]$PresentFiles = @()
$ItemList + $DeleteList | ForEach-Object {
  $F = "$Destination/$_"
  If (Test-Path $F) {
    $PresentFiles += $F
  }
}

$PresentFilesFormated = [String]::Join(", ", $PresentFiles)

If ($PresentFiles.Length -ne 0) {
  $decision = $Host.UI.PromptForChoice(
    "Item(s) in the specified destination location already exists. ($PresentFilesFormated)",
    "Do you want to delete these items and continue?",
    ('&No', '&Yes'), 1)
  If (($decision -eq 1) -or ($null -ne $env:CI)) {
    Log "Deleting previous build artifacts"
    $PresentFiles | Remove-Item -Recurse -Force
  }
  Else {
    Exit
  }
}

Log "Copying Deno project files to $Destination"

ForEach ($Item in $ItemList) {
  If (Test-Path $Item -PathType Container) {
    Copy-Item "$Item" "$Destination" -Recurse
  }
  Else {
    Copy-Item "$Item" "$Destination"
  }
}

Log "Setting up package.json for build"
If ($Version -or $Esm) {
  $NodePackage = (Get-Content "$NodePackageLocation" -Raw | ConvertFrom-Json)
  If ($Esm) {
    $NodePackage.type = "module"
  }
  If ($Version) {
    $v = $Version
    If ($Esm) {
      $v += "-esm"
    }
    $NodePackage.version = $v
  }
  $NodePackage | ConvertTo-Json > $NodePackageLocation
}

Log "Correcting import syntax"
# Node Import Syntax Fix
Get-ChildItem $Destination -Recurse -Filter *.ts | ForEach-Object {
  $Regexes = $Esm -and $_.FullName.EndsWith("d.ts") ? "($NodeOnlyRegex|$DiscordAPIRegex)" : "($ImportRegex|$NodeOnlyRegex|$DiscordAPIRegex)"
  $Content = Get-Content $_.FullName -Raw
  $Content = $Content -replace $Regexes, ""
  If (-not $_.FullName.EndsWith(".d.ts")) {
    $Content = $Content -replace "(\.d)?\.ts", ".js" 
  }
  $Content > $_.FullName
}

# Verification

Set-Location "$Destination"

$Module = $Esm ? "esm" : "cjs"

Log "Running NPM scripts"

npm install -Wait
npm run "build:$Module" -Wait

Log "Copying .d.ts files and verifying integrity"
Copy-Item -Recurse "src/types" "lib/src"

npm run "build:${Module}_noemit" -Wait

# If ($Esm) {
#   Get-ChildItem "lib" -Recurse -Filter *.js | ForEach-Object {
#     Rename-Item $_ ($_ -replace ".js", ".mjs")
#   }
# }

Set-Location ".."

# Reset
If ($Esm -and $Reset) {
  Log "Reseting package.json for future use"
  Invoke-Command -FilePath "./reset.ps1"
}
