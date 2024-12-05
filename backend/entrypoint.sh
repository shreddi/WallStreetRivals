#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure the log file for cron exists
CRON_LOG="/var/log/cron.log"
if [ ! -f "$CRON_LOG" ]; then
  touch "$CRON_LOG"
  echo "Created cron log file at $CRON_LOG"
fi

# Add environment variables to /etc/environment, excluding certain variables
printenv | grep -Ev '^(BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID|LANG|PWD|GPG_KEY|_=)' >> /etc/environment
echo "Environment variables added to /etc/environment"

# Remove existing crontab jobs for the current user
echo "Removing existing crontab jobs..."
python manage.py crontab remove || true

# Add new crontab jobs
echo "Adding new crontab jobs..."
python manage.py crontab add

# Start the cron service
echo "Starting cron service..."
service cron start

echo "Cron setup complete and running."

python manage.py runserver 0.0.0.0:8000