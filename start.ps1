# Path to venv directory
$venvDir = "venv"

# Path to backend directory
$backendDir = "backend"

# Path to requirements file
$requirementsFile = "requirements.txt"

# Path to python executable
$pythonScript = "main.py"

# Check if venv directory exists
if (-Not (Test-Path $venvDir)) {
    # Create venv directory
    Write-Host "Virtual environment not found. Creating..."
    python -m venv $venvDir

    # Activate venv
    Write-Host "Activating virtual environment..."
    & "$venvDir\Scripts\Activate.ps1"

    # Install requirements
    Write-Host "Installing python dependencies..."
    pip install -r $requirementsFile
} else {
    # Activate venv
    Write-Host "Virtual environment found."
    Write-Host "Activating virtual environment..."
    & "$venvDir\Scripts\Activate.ps1"
}

# Run python script

Set-Location $backendDir
Write-Host "Running main python script..."
python $pythonScript