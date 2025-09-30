Frontend dev notes

- Put an `.env` file in `frontend/` with:

  VITE_API_BASE=http://localhost:8000

- Start the dev server:

  cd frontend
  npm install
  npm run dev

- Useful checks:

  # Check API from frontend host (dev server will proxy /data and /process if configured)

  curl http://localhost:8000/data/transformers
  curl http://localhost:8000/process/transformers

If the frontend still points to the wrong host, ensure `import.meta.env.VITE_API_BASE` is present and that you've restarted the dev server after changing `.env`.
