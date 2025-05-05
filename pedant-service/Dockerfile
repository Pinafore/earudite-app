# Use an official Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy application code and requirements
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]

