Param(
  [Parameter(Mandatory = $false, Position = 0)]
  [ValidatePattern("v(\d\.){2}\d")]
  [string] $Version
)

If (Get-Location -match '.+tpy') {
  Throw "Not in project root"
}

# Injection

$ItemList = ".\src", ".\mod.ts", ".\README.md", ".\LICENSE"
$Destination = ".\node"
$NodePackageLocation = "$Destination\package.json"
$ImportRegex = "(?<=(?<=\n|^)import(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"

New-Item "$Destination" -ItemType Directory

ForEach ($Item in $ItemList) {
  If ($Item -like "*deno*") {
    Continue;
  }
  If (Test-Path $Item -PathType Container) {
    Copy-Item "$Item" "$Destination" -Recurse
  }
  Else {
    Copy-Item "$Item" "$Destination"
  }
}

# Package Setup

$NodePackage = Get-Content "$NodePackageLocation" | ConvertFrom-Json
If (("version" -notin $NodePackage) -or ($NodePackage.version -ne "x")) {
  Throw "Version not specified or is not of expected value `x` in package.json."
}

$NodePackage.version = $Version 
$NodePackage | ConvertTo-Json > $NodePackageLocation

# Node Import Syntax Fix

# Per File
Get-ChildItem $Destination -Recurse -Filter *.ts | ForEach-Object {
  Get-Content $_.FullName | -replace "$ImportRegex", "" > $_.FullName
}

# Verification

Set-Location "$Destination"
npm install
npx tsc
