#!/bin/bash

# Set the parent directory where all project folders are located
PARENT_DIR=$(pwd)  # Assumes script is run from the parent folder

# Output directory for all builds
OUTPUT_DIR="$PARENT_DIR/docs"

# Ensure output directory exists and is clean
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "Building all projects in: $PARENT_DIR"

# Loop through all folders inside the parent directory
for dir in */; do
    # Skip if not a directory
    [ -d "$dir" ] || continue

    cd "$dir"
    echo "Building project in $dir..."

    # Install dependencies and build the project
    if [ -f "package.json" ]; then
        npm install
        npm run build
    else
        echo "Skipping $dir (No package.json found)"
        cd "$PARENT_DIR"
        continue
    fi

    # Determine the build folder (dist or build)
    if [ -d "dist" ]; then
        BUILD_DIR="dist"
    elif [ -d "build" ]; then
        BUILD_DIR="build"
    else
        echo "Skipping $dir (No build output found)"
        cd "$PARENT_DIR"
        continue
    fi

    # Copy the built files to the output directory
    DEST_DIR="$OUTPUT_DIR/${dir%/}"  # Remove trailing slash from dir name
    mkdir -p "$DEST_DIR"
    cp -r "$BUILD_DIR"/* "$DEST_DIR"

    echo "Copied build files from $dir to $DEST_DIR"

    # Return to parent directory
    cd "$PARENT_DIR"
done

echo "All builds copied to $OUTPUT_DIR"

# If deploying to GitHub Pages
# cd "$OUTPUT_DIR"
# git init
# git add .
# git commit -m "Deploy built projects to GitHub Pages"
# git branch -M main
# git remote add origin <YOUR_GITHUB_REPO_URL> # Replace with actual repo URL
# git push -f origin main

# echo "Deployment to GitHub Pages completed!"
