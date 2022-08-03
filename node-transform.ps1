Param(
  [Parameter(Mandatory = $false, Position = 0)]
  [string] $Version,

  [switch] $Publish
)

If ($PSVersionTable.PSVersion.Major -lt 7) {
  Write-Error "Incompatible version of PowerShell. Use version 7+."
  Exit
}

If ((Get-Location).Path -notlike '*tpy') {
  Write-Error "Not in project root"
  Exit
}

# Injection

$ItemList = "src", "README.md", "LICENSE"
$DeleteList = "lib", "node_modules", "package-lock.json"
$Destination = "node"
$NodePackageLocation = "$Destination/package.json"
$ImportRegex = "(?<=(?<=\n|^)import(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"

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
    ('&Yes', '&No'), 1)
  If ($decision -eq 0) {
    $PresentFiles | Remove-Item -Recurse -Force
  }
  Else {
    Exit
  }
}

ForEach ($Item in $ItemList) {
  If (Test-Path $Item -PathType Container) {
    Copy-Item "$Item" "$Destination" -Recurse
  }
  Else {
    Copy-Item "$Item" "$Destination"
  }
}

# Package Setup

$NodePackage = (Get-Content "$NodePackageLocation" -Raw | ConvertFrom-Json)
$NodePackage.version = $Version
$NodePackage | ConvertTo-Json > $NodePackageLocation

# Node Import Syntax Fix

# Per File
Get-ChildItem $Destination -Recurse -Filter *.ts | ForEach-Object {
  $Content = Get-Content $_.FullName -Raw
  $Content -replace "$ImportRegex", "" > $_.FullName
}

# Verification

Set-Location "$Destination"

npm install
npx tsc

If ($Publish) { 
  If ($Version -eq "x") {
    npm publish --dry-run
  } else {
    npm publish
  }
}