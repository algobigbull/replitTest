# Next.js Project on Replit

## Overview
This is a Next.js 16 project with TypeScript and Tailwind CSS 4. It was imported from GitHub and configured to run in the Replit environment.

## Project Structure
- `/src/app` - Next.js app directory with pages and layouts
- `/public` - Static assets
- Root config files for Next.js, TypeScript, ESLint, and Tailwind

## Tech Stack
- **Framework**: Next.js 16.0.6 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: npm

## Configuration for Replit
The project has been configured to work with Replit's proxy environment:
- Dev server runs on port 5000 with host 0.0.0.0
- `allowedDevOrigins` configured in next.config.ts to allow Replit domains
- Workflow set up to run `npm run dev`

## Development
The development server runs automatically via the configured workflow. Changes to files will trigger hot module reloading.

## Deployment
Configured for autoscale deployment:
- Build command: `npm run build`
- Uses Next.js production server

## Recent Changes (December 1, 2025)
- Imported project from GitHub
- Configured Next.js to work with Replit's proxy (allowedDevOrigins)
- Set up dev server on port 5000 with 0.0.0.0 host
- Configured deployment settings for autoscale
- All dependencies installed and working
