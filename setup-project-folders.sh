#!/bin/bash
# Setup script for project folder structure

echo "🔧 Project Folder Setup"
echo "======================="
echo ""

# Step 1: Rename existing folders (if needed)
echo "📝 Step 1: Rename existing folders to new convention"
echo ""

if [ -d "src/project_sites/elementech_technologies-vanilla_js" ]; then
    echo "Renaming: elementech_technologies-vanilla_js → elementech_projects-vanilla_js"
    mv src/project_sites/elementech_technologies-vanilla_js src/project_sites/elementech_projects-vanilla_js
fi

if [ -d "src/project_sites/elementech_technologies-react_js" ]; then
    echo "Renaming: elementech_technologies-react_js → elementech_projects-react_js"
    mv src/project_sites/elementech_technologies-react_js src/project_sites/elementech_projects-react_js
fi

if [ -d "src/project_sites/elementech_technologies-react_essentials" ]; then
    echo "Renaming: elementech_technologies-react_essentials → elementech_projects-react_essentials"
    mv src/project_sites/elementech_technologies-react_essentials src/project_sites/elementech_projects-react_essentials
fi

echo ""
echo "✅ Folders renamed!"
echo ""

# Step 2: Create heliospay folder structure
echo "📝 Step 2: Create heliospay project structure"
echo ""

if [ ! -d "src/project_sites/heliospay" ]; then
    mkdir -p src/project_sites/heliospay
    echo "Created: src/project_sites/heliospay/"
fi

if [ ! -d "src/project_sites/heliospay/backend" ]; then
    mkdir -p src/project_sites/heliospay/backend
    echo "Created: src/project_sites/heliospay/backend/"
fi

if [ ! -d "src/project_sites/heliospay/frontend" ]; then
    mkdir -p src/project_sites/heliospay/frontend
    echo "Created: src/project_sites/heliospay/frontend/"
fi

echo ""
echo "✅ Heliospay folders created!"
echo ""

# Step 3: Show current structure
echo "📂 Current project structure:"
ls -la src/project_sites/

echo ""
echo "=============================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy your heliospay backend code to: src/project_sites/heliospay/backend/"
echo "  2. Copy your heliospay frontend code to: src/project_sites/heliospay/frontend/"
echo "  3. Run: bash update-database-paths.sh"
echo ""
