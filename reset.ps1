$Destination = "node"
$NodePackageLocation = "$Destination/package.json"

$NodePackage = (Get-Content "$NodePackageLocation" -Raw | ConvertFrom-Json)
$NodePackage.type = "commonjs"
$nv = $NodePackage.version
$NodePackage.version = $nv.Substring(0, $nv.Length - 4)
$NodePackage | ConvertTo-Json > $NodePackageLocation