# Backend Deployment Configuration

## Current Setup
- **Backend**: Deployed on AWS EC2 at `http://13.61.104.179:8000/`
- **Frontend**: Deployed on Vercel at `https://verdan-beige.vercel.app`

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=8000
# ... other variables remain the same
```

### Frontend Environment Files
- `.env` - Production environment
- `.env.local` - Local development override
- `.env.development` - Development specific
- `.env.production` - Production specific

All now point to: `http://13.61.104.179:8000/`

## CORS Configuration
The backend is configured to accept requests from:
- `https://verdan-beige.vercel.app` (main frontend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev server)
- Additional localhost ports for development

## Testing
Run `./check-backend-connectivity.sh` to test backend connectivity and CORS configuration.

## Deployment Steps
1. Backend changes are deployed to EC2
2. Frontend environment variables updated
3. Frontend rebuilt with `npm run build`
4. Frontend deployed to Vercel

## Security Notes
- CORS is configured to be permissive for EC2 deployment
- All origins are logged for monitoring
- Credentials are enabled for authenticated requests