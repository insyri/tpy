#Requires -Version 7.0
# Script uses ternary operator.
# Also to avoid environment conflicts

Param(
  [Parameter()]
  [string] $Version,

  [Parameter()]
  [ValidateSet("ESModule", "CommonJS")]
  [string] $Module,

  [Parameter()]
  [switch] $Reset,

  [Parameter()]
  [switch] $Quiet
)

If ((Get-Location).Path -notlike '*tpy') {
  Write-Error "Not in project root"
  Exit
}

$IsESM = $Module -eq "ESModule"

$ItemList = "src", "README.md", "LICENSE", "mod.ts"
$DeleteList = "lib", "node_modules", "mod.js", "mod.d.ts"
$Destination = "node"
$NodePackageLocation = "$Destination/package.json"
# Matches the file extention in ESM import/export statements.
# (Text in brackets represent [matched] text in this example.)
#
#   import { responseBody, responseHTTP, } from "./error[.ts]";
#
$ImportRegex = "(?<=(?<=\n|^)(im|ex)port(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"
$NodeOnlyRegex = "\/\/ build:node-only "
$DiscordAPIRegex = "(?<=discord-api-types\/[a-z]+\/v8)\/guild"

# Developing Regex
# ((ex|im)port {[\S\s]+?} from "\.[\S\s]*?(?="))(";)
# Should match ./file and not ./file.js

# if esm
#   if .d.ts
#     ext -> ""
#   else (.ts)
#     ext -> ".js"
# else (cjs)
#   ext -> ""

# if esm 
#   if .d.ts
#     ext -> ""
#   else (.js)
#     ext -> ".js"


Function Log {
  Param(
    [string] $str
  )
  If (-not $Quiet) {
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
$NodePackage = (Get-Content "$NodePackageLocation" -Raw | ConvertFrom-Json)
$NodePackage.type = $IsESM ? "module" : "commonjs"
If ($Version) {
  $v = $Version
  If ($IsESM) {
    $v += "-esm"
  }
  $NodePackage.version = $v
}
$NodePackage | ConvertTo-Json > $NodePackageLocation

Log "Correcting import syntax"
# Node Import Syntax Fix
Get-ChildItem $Destination -Recurse -Filter *.ts | ForEach-Object {
  $Regexes = $IsESM -and $_.FullName.EndsWith("d.ts") ? "($NodeOnlyRegex|$DiscordAPIRegex)" : "($ImportRegex|$NodeOnlyRegex|$DiscordAPIRegex)"
  $Content = Get-Content $_.FullName -Raw
  $Content = $Content -replace $Regexes, ""
  If (-not $_.FullName.EndsWith(".d.ts")) {
    $Content = $Content -replace "(\.d)?\.ts", ".js" 
  }
  $Content > $_.FullName
}

# Verification

Set-Location "$Destination"

$ShorthandModule = $IsESM ? "esm" : "cjs"

Log "Running NPM scripts"

npm install -Wait
npm run "build:$ShorthandModule" -Wait

Log "Copying .d.ts files and verifying integrity"
Copy-Item -Recurse "src/types" "lib/src"

npm run "build:${ShorthandModule}_noemit" -Wait

Get-ChildItem $Destination -Recurse -Filter *.js | ForEach-Object {
  $Content = Get-Content $_.FullName -Raw
  $Content = $Content -replace $Regexes, ""
}

Set-Location ".."

# Reset
If ($IsESM -and $Reset) {
  Log "Reseting package.json for future use"
  Invoke-Command -FilePath "./reset.ps1"
}
