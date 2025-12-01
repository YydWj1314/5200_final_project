#!/bin/bash

# Script to run database_triggers.sql on GCP Cloud SQL
# This script uses gcloud sql connect to execute the SQL file

echo "=========================================="
echo "Running Database Triggers Setup"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it first: brew install --cask google-cloud-sdk"
    exit 1
fi

# Check if database_triggers.sql exists
if [ ! -f "database_triggers.sql" ]; then
    echo "❌ Error: database_triggers.sql not found"
    exit 1
fi

echo "This script will connect to GCP Cloud SQL and run database_triggers.sql"
echo ""
echo "You have two options:"
echo ""
echo "Option 1: Interactive mode (recommended)"
echo "  gcloud sql connect neu-test-db --user=admin1"
echo "  Then copy and paste the contents of database_triggers.sql"
echo ""
echo "Option 2: Using Cloud SQL Proxy"
echo "  Terminal 1: ./start-proxy.sh"
echo "  Terminal 2: mysql -h 127.0.0.1 -P 3307 -u admin1 -p 5200_final_project < database_triggers.sql"
echo ""
echo "=========================================="
echo "Opening interactive connection..."
echo "=========================================="
echo ""

# Try to connect interactively
gcloud sql connect neu-test-db --user=admin1

