FROM python:3.11.3

# Set the working directory
WORKDIR /app

# Set environment variable to prevent Python from buffering output
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Install cron
RUN apt-get update && apt-get -y install cron && touch /var/log/cron.log

# Copy application code
COPY . .

# Ensure the entrypoint script is executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# Ensure cron runs in the background and the Django server is started as the main process
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
