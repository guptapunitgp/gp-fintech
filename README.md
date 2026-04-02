# Finance Dashboard

Full-stack finance dashboard with a strict assignment-first frontend and a clean supporting backend.

## Stack

### Frontend
- React + Vite
- Tailwind CSS
- Zustand
- Recharts

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- OpenAI Responses API for AI help and stock study

## Project Structure

```text
finance-dashboard/
├─ client/
│  ├─ .env.example
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ index.css
│     ├─ components/
│     │  ├─ AddTransactionModal.jsx
│     │  ├─ EmptyState.jsx
│     │  ├─ InsightsPanel.jsx
│     │  ├─ OverviewCharts.jsx
│     │  ├─ SummaryCard.jsx
│     │  ├─ TransactionsSection.jsx
│     │  ├─ auth/
│     │  ├─ common/
│     │  └─ layout/
│     ├─ lib/
│     │  └─ api.js
│     ├─ pages/
│     │  ├─ DashboardPage.jsx
│     │  ├─ InsightsPage.jsx
│     │  ├─ LoginPage.jsx
│     │  ├─ RegisterPage.jsx
│     │  └─ TransactionsPage.jsx
│     ├─ store/
│     │  ├─ useAuthStore.js
│     │  ├─ useTransactionStore.js
│     │  └─ useUiStore.js
│     └─ utils/
│        ├─ finance.js
│        └─ formatters.js
├─ server/
│  ├─ .env.example
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     ├─ controllers/
│     ├─ middleware/
│     ├─ models/
│     ├─ routes/
│     └─ utils/
├─ package.json
└─ README.md
```

## Frontend Features

- 3 summary cards: total balance, total income, total expenses
- Line chart for balance trend
- Pie chart for expense categories
- Transactions table with search, filter, and sorting
- Role switch dropdown for Viewer/Admin UI simulation
- Viewer mode: read-only
- Admin mode: add and delete transactions from the UI
- Insights panel with highest spending category, monthly comparison, and summary insight
- Sidebar + navbar layout
- Responsive design
- Loading states and empty states
- Dark mode toggle
- Profile page with monthly income and saving goal
- Stocks page with Indian stock cards, portfolio table, and stock chart
- AI finance help panel for suggestions and budgeting guidance
- AI stock study panel for readable stock analysis on the selected stock

## Backend Features

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`

Note:
- `PUT /api/transactions/:id` is also included to keep the app closer to real-world usage.

### User Profile
- `GET /api/user/profile`
- `PUT /api/user/profile`

### Stocks
- `GET /api/stocks`
- `POST /api/stocks/buy`
- `GET /api/stocks/portfolio`

### AI
- `POST /api/ai/finance-help`
- `POST /api/ai/stock-analysis`

### Models

#### User
- `name`
- `email`
- `password`
- `role`
- `monthlyIncome`
- `savingGoal`

#### Transaction
- `userId`
- `date`
- `amount`
- `category`
- `type`

#### Portfolio
- `userId`
- `stockName`
- `quantity`
- `buyPrice`

### Middleware
- JWT authentication middleware
- Protected transaction routes

## Environment Variables

### Client

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Server

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=super_secret_jwt_key
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
NODE_ENV=development
```

You can also use MongoDB Atlas:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_dashboard
```

## Local Setup

### 1. Install dependencies

At the root:

```bash
npm install
```

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd server
npm install
```

### 2. Start MongoDB

Use either:
- local MongoDB
- MongoDB Atlas

### 3. Run the backend

From the root:

```bash
npm run dev:server
```

Or:

```bash
cd server
npm run dev
```

### 4. Run the frontend

From the root:

```bash
npm run dev:client
```

Or:

```bash
cd client
npm run dev
```

### 5. Open the app

[http://localhost:5173](http://localhost:5173)

## Firebase Google Authentication Setup

1. Create a Firebase project in Firebase Console.
2. Go to `Authentication` and enable `Google` as a sign-in provider.
3. In `Project settings`, copy the Firebase web app config values.
4. Add `http://localhost:5173` and your deployed frontend URL to authorized domains.
5. Put the Firebase web config into `client/.env`.
6. From `Project settings > Service accounts`, generate a private key JSON.
7. Copy these values into `server/.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Google sign-in now runs through Firebase Auth on the frontend and Firebase Admin verification on the backend.

## OpenAI Setup

1. Create an OpenAI API key in your OpenAI account.
2. Add `OPENAI_API_KEY` to `server/.env`.
3. Optionally change `OPENAI_MODEL` if you want a different model.
4. Restart the backend after editing the env file.

The app uses the Responses API on the server side and keeps the key off the frontend.

Important:
- OpenAI API usage is usually pay-as-you-go rather than a guaranteed free backend tier.
- This project defaults to `gpt-5-mini` to keep costs lower for help and suggestion features.
- If you want the cheapest possible setup, you can switch the model to a smaller current model in `server/.env`.

## Role Switch Behavior

- The frontend includes a role switch dropdown in the navbar as required by the assignment.
- This changes the UI dynamically between Viewer and Admin.
- The backend still keeps real authorization based on the logged-in user role.
- Best demo flow:
- register/login as `admin` for full CRUD behavior
- switch roles in the navbar to demonstrate frontend assignment behavior

## Deployment Guide

### 1. MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP in Network Access.
4. Copy the connection string.
5. Put it in `server/.env` or your hosting environment as `MONGO_URI`.

### 2. Deploy Backend to Render

1. Push the repository to GitHub.
2. In Render, create a new Web Service.
3. Set the Root Directory to `server`.
4. Build Command:

```bash
npm install
```

5. Start Command:

```bash
npm start
```

6. Add environment variables:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NODE_ENV=production`

7. After deploy, copy the API URL, for example:

```text
https://your-app.onrender.com/api
```

### 3. Deploy Frontend to Vercel

1. Import the repository into Vercel.
2. Set the Root Directory to `client`.
3. Set environment variable:

```env
VITE_API_URL=https://your-render-url.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Build settings:
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

5. Deploy.

## Production Notes

- CORS is configured in the Express app using `CLIENT_URL`.
- JWT token is persisted in `localStorage`.
- Transactions are scoped to the authenticated user.
- Stock prices use a clean simulated live-data layer so the portfolio works without a paid market data provider.
- Frontend is ready for Vercel.
- Backend is ready for Render or Railway.

## Verification

- Frontend production build passes.
- Backend app imports successfully.
- Final runtime depends on valid MongoDB credentials and network access.
