# 📤 How to Push to GitHub

## Step 1: Initialize Git (if not already done)

```bash
git init
```

## Step 2: Add all files

```bash
git add .
```

## Step 3: Commit

```bash
git commit -m "Initial commit: Risk Engine Prototype ready for Vercel"
```

## Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: risk-prototype
3. Description: "Behavioural Credit Risk Engine Prototype"
4. Public (or Private - your choice)
5. DO NOT initialize with README (we already have one)
6. Click "Create repository"

## Step 5: Connect and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/risk-prototype.git
git branch -M main
git push -u origin main
```

Replace YOUR_USERNAME with your actual GitHub username.

## Step 6: Verify

Visit: https://github.com/YOUR_USERNAME/risk-prototype
Your code should be there!

## 🚀 Next: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" → "Project"
4. Import your risk-prototype repository
5. Click "Deploy" (all settings auto-detected)

Your app will be live in 2 minutes!
