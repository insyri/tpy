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
  [switch] $NoReset,

  [Parameter()]
  [switch] $Quiet,

  [Parameter()]
  [switch] $CleanInstall
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
#   import { DeploymentStructures } from "./deployment[.d.ts]";
#
$ImportRegex = "(?<=(?<=\n|^)(im|ex)port(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"
$NodeOnlyRegex = "\/\/ build:node-only "
$DiscordAPIRegex = "(?<=discord-api-types\/[a-z]+\/v8)\/guild"
# Matches ESM import/export statements without extensions, allowing for insertion.
#
#   SHOULD MATCH
#   import { TpyWs } from "./ws";
#
#   SHOULD NOT MATCH
#   export { Tpy as default } from "./src/tpy.js";
#
$NoExtensionRegex = '((ex|im)port {[\S\s]+?} from "\.\/[\S\s]+?(?<!\.js)(?="))(";)'

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

If ($IsESM) {
  Log "Fixing ex/import extensions"
  Get-ChildItem "src/types" -Recurse | ForEach-Object {
    $Content = Get-Content $_.FullName -Raw
    $Content = $Content -replace $ImportRegex, ""
    $Content > $_.FullName
  }
}

$ShorthandModule = $IsESM ? "esm" : "cjs"

Log "Running NPM scripts"

npm ($CleanInstall ? "ci" : "install") -Wait
npm run "build:$ShorthandModule" -Wait

Log "Copying .d.ts files and verifying integrity"
Copy-Item -Recurse "src/types" "lib/src"

npm run "build:${ShorthandModule}_noemit" -Wait

If ($IsESM) {
  Log "Fixing ex/import extensions (TS emission)"
  Get-ChildItem "lib" -Recurse -Filter *.js | ForEach-Object {
    $Content = Get-Content $_.FullName -Raw
    $Content = $Content -replace $NoExtensionRegex, '$1.js$3'
    $Content > $_.FullName
  }
}

Remove-Item "./src" -Recurse

Set-Location ".."

# Reset
If ($IsESM -and (-not $NoReset)) {
  Log "Reseting package.json for future use"
  Log "Use the `-NoReset` flag to disable this behavior"
  & "$PSScriptRoot/reset.ps1"
}
