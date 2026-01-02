# Project Dependencies

This document lists all dependencies for the Campus Placement Interview Experience Portal project.

## Backend Dependencies

Location: `backend/package.json`

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bcryptjs` | ^2.4.3 | Password hashing and encryption |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing middleware |
| `dotenv` | ^17.2.3 | Environment variable management |
| `express` | ^5.1.0 | Web application framework |
| `jsonwebtoken` | ^9.0.2 | JWT token generation and verification |
| `mongoose` | ^8.0.3 | MongoDB object modeling tool |

### Installation

```bash
cd backend
npm install
```

### Backend Requirements Summary

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher (or MongoDB Atlas)

## Frontend Dependencies

Location: `frontend/package.json`

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `chart.js` | ^4.5.1 | Chart and graph library |
| `jspdf` | ^3.0.4 | PDF generation library |
| `react` | ^19.1.1 | UI library |
| `react-chartjs-2` | ^5.3.1 | React wrapper for Chart.js |
| `react-dom` | ^19.1.1 | React DOM renderer |
| `react-router-dom` | ^7.9.5 | Client-side routing |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@eslint/js` | ^9.36.0 | ESLint JavaScript configuration |
| `@types/react` | ^19.1.16 | TypeScript types for React |
| `@types/react-dom` | ^19.1.9 | TypeScript types for React DOM |
| `@vitejs/plugin-react` | ^5.0.4 | Vite plugin for React |
| `eslint` | ^9.36.0 | JavaScript linter |
| `eslint-plugin-react-hooks` | ^5.2.0 | ESLint plugin for React hooks |
| `eslint-plugin-react-refresh` | ^0.4.22 | ESLint plugin for React refresh |
| `globals` | ^16.4.0 | Global variables for ESLint |
| `vite` | ^7.2.2 | Build tool and dev server |

### Installation

```bash
cd frontend
npm install
```

### Frontend Requirements Summary

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies
- **Internet**: Required for MongoDB Atlas (if using cloud database)

### Recommended Requirements

- **Node.js**: v20.x LTS
- **npm**: v10.x
- **RAM**: 8GB or more
- **Disk Space**: 2GB for development

## Installation Commands

### Full Project Setup

```bash
# Clone repository
git clone <repository-url>
cd campus-placement-portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Quick Install Script (Unix/Mac)

```bash
#!/bin/bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo "Dependencies installed successfully!"
```

### Quick Install Script (Windows PowerShell)

```powershell
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
Write-Host "Dependencies installed successfully!"
```

## Version Compatibility

### Node.js Compatibility

- **Backend**: Requires Node.js v18+ (tested with v18.x and v20.x)
- **Frontend**: Requires Node.js v18+ (tested with v18.x and v20.x)

### MongoDB Compatibility

- **MongoDB**: v6.0+ (local) or MongoDB Atlas (any version)
- **Mongoose**: v8.0.3 (compatible with MongoDB v6.0+)

## Security Notes

### Production Considerations

1. **JWT Secret**: Use a strong, random secret key in production
2. **MongoDB URI**: Never commit connection strings with credentials
3. **CORS**: Restrict CORS origins in production (don't use `*`)
4. **Environment Variables**: Keep all secrets in `.env` files (not committed)
5. **Dependencies**: Regularly update dependencies for security patches

### Update Dependencies

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

## Troubleshooting

### Common Issues

1. **Node version mismatch**: Use `nvm` (Node Version Manager) to switch versions
2. **MongoDB connection errors**: Check connection string and network access
3. **Port already in use**: Change PORT in `.env` or kill process using the port
4. **Module not found**: Delete `node_modules` and `package-lock.json`, then `npm install`

### Clean Install

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## License

All dependencies are subject to their respective licenses. See individual package licenses for details.

