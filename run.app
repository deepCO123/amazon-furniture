# ========================================================
# Amazon Furniture - Complete App Run Script
# ========================================================

# 1. Install all dependencies across Root, Backend, and Frontend:
npm run install:all

# 2. Seed database (Optional - populates products, orders, customers):
npm run seed

# 3. Start both Backend (Port 5000) and Frontend (Port 3000) concurrently:
npm run dev

# --------------------------------------------------------
# Alternative commands:
# Run Backend only:  npm run backend   (http://localhost:5000)
# Run Frontend only: npm run frontend  (http://localhost:3000)
# Build production:  npm run build
# Start production:  npm run start
# --------------------------------------------------------