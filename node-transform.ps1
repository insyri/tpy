Param(
  [Parameter(Mandatory = $false, Position = 0)]
  [ValidatePattern("v(\d\.){2}\d")]
  [string] $Version
)

If ((Get-Location).Path -notlike '*tpy') {
  Write-Error "Not in project root"
  Exit
}

# Injection

$ItemList = "src", "mod.ts", "README.md", "LICENSE"
$Destination = "node"
$NodePackageLocation = "$Destination\package.json"
$ImportRegex = "(?g)(?(?<=(?<=\n|^)import(?:(?!(\.d)?\.ts).|\n)*)(\.d)?\.ts"

[string[]]$PresentFiles = @()
$ItemList | ForEach-Object {
  If (Test-Path "$Destination\$_") {
    $PresentFiles += "$Destination\$_"
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

$NodePackage = (Get-Content "$NodePackageLocation" | ConvertFrom-Json)
$NodePackage.version = $Version 
$NodePackage | ConvertTo-Json > $NodePackageLocation

# Node Import Syntax Fix

# Per File
Get-ChildItem $Destination -Recurse -Filter *.ts | ForEach-Object {
  $Content = Get-Content $_.FullName
  $Content -replace "$ImportRegex", "" > $_.FullName
}

# Verification

Set-Location "$Destination"

npm install
npx tsc
