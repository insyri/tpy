Set-Location "node" # Destination
$NodePackageLocation = "package.json"

$NodePackage = (Get-Content "$NodePackageLocation" -Raw | ConvertFrom-Json)
$NodePackage.type = "commonjs"
While ($NodePackage.version.EndsWith("-esm")) {
  $NodePackage.version = $NodePackage.version.Substring(0, $NodePackage.version.Length - 4)
}
$NodePackage | ConvertTo-Json > $NodePackageLocation
npm install "node-fetch@^2"
npm install "@types/node-fetch" --save-peer

Set-Location ..