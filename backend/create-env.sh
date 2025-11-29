#!/bin/bash

# Helper script to create .env file

echo "🔧 Creating .env file from template..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
  echo "⚠️  .env file already exists!"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled. Keeping existing .env file."
    exit 1
  fi
fi

# Create .env from template
cp .env.template .env 2>/dev/null || cat > .env << 'EOF'
# Supabase Configuration
# Get these from: Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# JWT Secret (generate random string: openssl rand -base64 32)
JWT_SECRET=your-random-secret-key-here-minimum-32-characters-long
EOF

echo "✅ .env file created!"
echo ""
echo "📝 Next steps:"
echo "1. Open backend/.env in your editor"
echo "2. Replace placeholder values with your Supabase credentials"
echo "3. Get credentials from: Supabase Dashboard → Settings → API"
echo ""
echo "🔑 To generate JWT_SECRET, run:"
echo "   openssl rand -base64 32"
echo ""

