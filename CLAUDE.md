# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Vite)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint` (uses ESLint)
- **Preview production build**: `npm run preview`

## Architecture Overview

This is a React + TypeScript document management application built with Vite, featuring:

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for bundling and dev server
R- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** component library with Radix UI primitives
- **Recharts** for data visualization

### Application Structure

**Authentication Flow**: The app uses Clerk for authentication. All routes require authentication and redirect to Clerk's sign-in page when not authenticated.

**Layout**: Single-page application with:
- Collapsible sidebar navigation (`AppSidebar.tsx`)
- Header with upload button and user profile
- Main content area with routing

**Key Pages**:
- `Dashboard.tsx` - KPI dashboard with charts and metrics (French content)
- `Documents.tsx` - Document listing and management
- `DocumentDetail.tsx` - Individual document view
- `AuditTrail.tsx` - Activity logging
- `Settings.tsx`, `ApiKeys.tsx`, `Team.tsx`, `Usage.tsx` - Configuration pages

**Component Organization**:
- `/components/ui/` - shadcn/ui components (buttons, cards, forms, etc.)
- `/components/` - Application-specific components (sidebar, modals, etc.)
- `/pages/` - Route components
- `/contexts/` - React contexts (currently just auth)
- `/hooks/` - Custom React hooks
- `/lib/` - Utilities and helpers

### Styling Conventions
- Uses Tailwind CSS with custom configuration
- Component styling follows shadcn/ui patterns
- French language content in dashboard components
- Consistent use of slate color palette for UI elements

### State Management
- React Context for authentication state
- TanStack Query for server state (configured but API calls not implemented)
- Local component state for UI interactions

This appears to be a document analysis/security application for detecting suspicious documents, with KPI tracking and user management features.

## Research Notes

- Potential cross-reference: SALESFORCE-ANTI-FRAUDE-ARCHITECTURE.md seems relevant to the document analysis/security aspects of the application

## Memory Notes

- Added reference to FRAUD_MAPPING_ANALYSIS.md for potential investigation into document fraud detection mechanisms
- Added research context for SALESFORCE-ANTI-FRAUDE-ARCHITECTURE.md to understand potential fraud detection architectural strategies
- Explored FRAUD_MAPPING_ANALYSIS.md as a potential resource for enhancing document fraud detection capabilities