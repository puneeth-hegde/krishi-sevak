@echo off
echo Upgrading pip...
python -m pip install --upgrade pip

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing requirements...
pip install -r backend\requirements.txt

echo Setup complete!
