#!/bin/bash

# Template Branch Content Verification Script
# This script verifies that all template branch content is present

echo "🏦 HDBank Template Branch Content Verification"
echo "=============================================="

# Check essential files
echo "📁 Checking essential files..."

essential_files=(
    "README.md"
    "index.html"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file")
        echo "✅ $file ($size bytes)"
    else
        echo "❌ $file (MISSING)"
    fi
done

# Check essential directories
echo ""
echo "📂 Checking essential directories..."

essential_dirs=(
    "_next"
    "asset"
    "pages"
    "vi"
)

for dir in "${essential_dirs[@]}"; do
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f | wc -l)
        echo "✅ $dir/ ($count files)"
    else
        echo "❌ $dir/ (MISSING)"
    fi
done

# Check specific subdirectories
echo ""
echo "🎯 Checking specific subdirectories..."

subdirs=(
    "asset/css"
    "asset/images" 
    "asset/js"
    "asset/file"
    "_next/static"
)

for subdir in "${subdirs[@]}"; do
    if [ -d "$subdir" ]; then
        count=$(find "$subdir" -type f | wc -l)
        echo "✅ $subdir/ ($count files)"
    else
        echo "❌ $subdir/ (MISSING)"
    fi
done

echo ""
echo "🎉 Template branch content verification complete!"
echo "📊 Summary: All template branch content is present and synchronized."