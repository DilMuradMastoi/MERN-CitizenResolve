# CitizenResolve Frontend

React + Vite frontend for the Express/MongoDB complaint API supplied with this project.

## Expected backend routes

The frontend uses:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/mine`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/upvote`
- `PATCH /api/complaints/:id/status`
- `PATCH /api/complaints/:id/feedback`
- `GET /api/complaints/export`
- `POST /api/ai/officer-summary`

The Vite dev server proxies `/api` to `http://localhost:5000`.

## Run

1. Make sure your backend is running on port 5000.
2. Install dependencies:
   `npm install`
3. Start:
   `npm run dev`
4. Open the Vite URL shown in the terminal.

## Important backend security note

The credentials pasted into the original request include a MongoDB connection string and JWT secret. Rotate those secrets before using the application anywhere outside a private development environment. Do not put them in this frontend project.
