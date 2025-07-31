# PowerShell Script to Create Profile Pictures for Blake Zimmerman
# This script creates circular profile pictures from the source image

param(
    [string]$SourceImage = "b7e307ba-fc5b-43e8-a3c2-d4c758735a12.jpg",
    [string]$OutputDir = "profile-pictures"
)

Write-Host "=== Blake Zimmerman Profile Picture Generator ===" -ForegroundColor Cyan
Write-Host ""

# Check if source image exists
if (-not (Test-Path $SourceImage)) {
    Write-Host "Error: Source image '$SourceImage' not found!" -ForegroundColor Red
    Write-Host "Please ensure the image file exists in the current directory." -ForegroundColor Yellow
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Created output directory: $OutputDir" -ForegroundColor Green
}

# Check if ImageMagick is available
$magickPath = Get-Command magick -ErrorAction SilentlyContinue
if ($magickPath) {
    Write-Host "ImageMagick found! Creating profile pictures..." -ForegroundColor Green
    Write-Host ""
    
    # Define sizes for profile pictures
    $sizes = @(
        @{Name="small"; Size=100; Border=3},
        @{Name="medium"; Size=200; Border=5},
        @{Name="large"; Size=300; Border=8},
        @{Name="xlarge"; Size=400; Border=10}
    )
    
    foreach ($size in $sizes) {
        $outputFile = Join-Path $OutputDir "blake-zimmerman-profile-${($size.Name)}.png"
        
        Write-Host "Creating ${($size.Name)} profile picture (${($size.Size)}x${($size.Size)})..." -ForegroundColor Yellow
        
        # Create circular profile picture with ImageMagick
        $magickArgs = @(
            $SourceImage,
            "-resize", "${($size.Size)}x${($size.Size)}^",
            "-gravity", "center",
            "-extent", "${($size.Size)}x${($size.Size)}",
            "-fill", "none",
            "-stroke", "#667eea",
            "-strokewidth", $size.Border,
            "-draw", "circle ${($size.Size/2)},${($size.Size/2)} ${($size.Size/2)},0",
            "-alpha", "set",
            "-background", "none",
            "-fill", "white",
            "-draw", "circle ${($size.Size/2)},${($size.Size/2)} ${($size.Size/2)},0",
            "-compose", "copy-opacity",
            "-composite",
            $outputFile
        )
        
        try {
            & magick @magickArgs
            if (Test-Path $outputFile) {
                Write-Host "✓ Created: $outputFile" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed to create: $outputFile" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "✗ Error creating ${($size.Name)} profile picture: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Profile pictures created successfully!" -ForegroundColor Green
    Write-Host "Output directory: $OutputDir" -ForegroundColor Cyan
    
} else {
    Write-Host "ImageMagick not found. Creating HTML/CSS solution instead..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create a simple HTML file that can be used to display the profile picture
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blake Zimmerman - Profile Picture</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .profile-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .profile-picture {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #667eea;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2em;
            font-weight: 300;
        }
        
        p {
            color: #666;
            margin: 0;
        }
        
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: left;
        }
        
        .instructions h3 {
            margin-top: 0;
            color: #333;
        }
        
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .instructions li {
            margin: 5px 0;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <img src="$SourceImage" alt="Blake Zimmerman" class="profile-picture">
        <h1>Blake Zimmerman</h1>
        <p>Professional Profile Picture</p>
        
        <div class="instructions">
            <h3>How to use this profile picture:</h3>
            <ul>
                <li>Right-click on the image and select "Save image as..." to download</li>
                <li>Use CSS classes from profile-picture.css for different sizes</li>
                <li>Open profile-picture-generator.html for custom sizing options</li>
                <li>All images are automatically cropped to a perfect circle</li>
            </ul>
        </div>
    </div>
</body>
</html>
"@
    
    $htmlFile = Join-Path $OutputDir "blake-zimmerman-profile-simple.html"
    $htmlContent | Out-File -FilePath $htmlFile -Encoding UTF8
    
    Write-Host "✓ Created simple profile picture viewer: $htmlFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "To create actual image files, you can:" -ForegroundColor Yellow
    Write-Host "1. Install ImageMagick from https://imagemagick.org/" -ForegroundColor White
    Write-Host "2. Run this script again" -ForegroundColor White
    Write-Host "3. Or use the HTML generator at: profile-picture-generator.html" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Source image: $SourceImage" -ForegroundColor White
Write-Host "Output directory: $OutputDir" -ForegroundColor White
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Get-ChildItem $OutputDir -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "You can now use these profile pictures for:" -ForegroundColor Green
Write-Host "• Social media profiles" -ForegroundColor White
Write-Host "• LinkedIn accounts" -ForegroundColor White
Write-Host "• Email signatures" -ForegroundColor White
Write-Host "• Business cards" -ForegroundColor White
Write-Host "• Portfolio websites" -ForegroundColor White 