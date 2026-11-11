$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-WorkbookRows([string] $name) {
    $path = Join-Path 'tmp/who' ($name + '.xlsx')
    $archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $path).Path)
    try {
        $sharedEntry = $archive.GetEntry('xl/sharedStrings.xml')
        $sharedReader = New-Object System.IO.StreamReader($sharedEntry.Open())
        try { $shared = [xml] $sharedReader.ReadToEnd() } finally { $sharedReader.Dispose() }
        $strings = @($shared.SelectNodes("//*[local-name()='si']") | ForEach-Object {
            ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }) -join ''
        })

        $sheetEntry = $archive.GetEntry('xl/worksheets/sheet1.xml')
        $sheetReader = New-Object System.IO.StreamReader($sheetEntry.Open())
        try { $sheet = [xml] $sheetReader.ReadToEnd() } finally { $sheetReader.Dispose() }
        $rows = @($sheet.SelectNodes("//*[local-name()='row']"))
        $headers = @{}
        foreach ($cell in $rows[0].SelectNodes("*[local-name()='c']")) {
            $column = [regex]::Match($cell.GetAttribute('r'), '^[A-Z]+').Value
            $value = $cell.SelectSingleNode("*[local-name()='v']").InnerText
            $headers[$column] = $strings[[int] $value]
        }

        $result = [System.Collections.Generic.List[object]]::new()
        foreach ($row in $rows | Select-Object -Skip 1) {
            $values = @{}
            foreach ($cell in $row.SelectNodes("*[local-name()='c']")) {
                $column = [regex]::Match($cell.GetAttribute('r'), '^[A-Z]+').Value
                $valueNode = $cell.SelectSingleNode("*[local-name()='v']")
                if ($null -eq $valueNode) { continue }
                $raw = $valueNode.InnerText
                $values[$headers[$column]] = [double]::Parse($raw, [Globalization.CultureInfo]::InvariantCulture)
            }
            $x = $values[$headers['A']]
            $l = $values['L']
            $m = $values['M']
            $s = $values['S']
            if ($null -ne $x -and $null -ne $l -and $null -ne $m -and $null -ne $s) {
                $result.Add(@([double] $x, [double] $l, [double] $m, [double] $s))
            }
        }

        return ,@{ xAxis = $headers['A']; rows = $result.ToArray() }
    }
    finally { $archive.Dispose() }
}

$data = @{
    source = @{
        publisher = 'World Health Organization'
        title = 'WHO Child Growth Standards - expanded z-score tables (L, M, S)'
        retrieved = '2026-11-11'
        references = @(
            'https://www.who.int/tools/child-growth-standards/standards/weight-for-age',
            'https://www.who.int/tools/child-growth-standards/standards/length-height-for-age',
            'https://www.who.int/tools/child-growth-standards/standards/weight-for-length-height',
            'https://www.who.int/tools/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age',
            'https://www.who.int/tools/child-growth-standards/standards/head-circumference-for-age'
        )
    }
    laki = @{
        bb_u = Get-WorkbookRows 'wfa-boys'
        pb_tb_u = Get-WorkbookRows 'lhfa-boys'
        bb_pb_tb = @{ pb = Get-WorkbookRows 'wfl-boys'; tb = Get-WorkbookRows 'wfh-boys' }
        imt_u = Get-WorkbookRows 'bfa-boys'
        lk_u = Get-WorkbookRows 'hcfa-boys'
    }
    perempuan = @{
        bb_u = Get-WorkbookRows 'wfa-girls'
        pb_tb_u = Get-WorkbookRows 'lhfa-girls'
        bb_pb_tb = @{ pb = Get-WorkbookRows 'wfl-girls'; tb = Get-WorkbookRows 'wfh-girls' }
        imt_u = Get-WorkbookRows 'bfa-girls'
        lk_u = Get-WorkbookRows 'hcfa-girls'
    }
}

$destination = 'resources/data/standar-antropometri-who.json'
New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
$json = ConvertTo-Json -InputObject $data -Depth 10 -Compress
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $destination), $json, [System.Text.UTF8Encoding]::new($false))
Write-Output ('Wrote ' + $destination + ' (' + (Get-Item $destination).Length + ' bytes)')
