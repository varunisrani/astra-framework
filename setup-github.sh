#!/bin/bash

# Setup script for Astra Framework GitHub repository

echo "=== Astra Framework - GitHub Repository Setup ==="
echo ""
echo "This script will help you create and push to a GitHub repository."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) not found."
    echo "   Install it from: https://cli.github.com/"
    echo ""
    echo "Alternative: Create a repository manually on GitHub.com"
    echo ""
    exit 1
fi

# Get repository name
read -p "Enter repository name (default: astra-framework): " REPO_NAME
REPO_NAME=${REPO_NAME:-astra-framework}

# Get repository description
read -p "Enter repository description (optional): " REPO_DESCRIPTION

# Create repository
echo ""
echo "📦 Creating GitHub repository..."
if [ -z "$REPO_DESCRIPTION" ]; then
    gh repo create "$REPO_NAME" --public --source=. --remote=origin
else
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --description="$REPO_DESCRIPTION"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repository created successfully!"
    echo ""
    echo "🔗 Repository URL: $(gh repo view --json url -q .url)"
    echo ""
    echo "Pushing code to GitHub..."
    git push -u origin master

    echo ""
    echo "✅ Done! Your framework is now on GitHub."
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository: $(gh repo view --json url -q .url)"
    echo "2. Read README.md to get started"
    echo "3. Check FRAMEWORK.md for detailed architecture"
    echo ""
else
    echo ""
    echo "❌ Failed to create repository."
    echo "   You may need to authenticate first: gh auth login"
    echo ""
fi
