# 🍺 Simba Beer Analytics Portal

A comprehensive Next.js 15.5 dashboard for beer sales analytics and business intelligence, built for the Simba beer brand. This portal provides real-time insights into sales performance, stock analytics, and business metrics through an intuitive web interface.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Project Overview

Simba Beer Analytics Portal is a modern, responsive web application that empowers beer distributors and retailers with actionable insights from their sales and inventory data. The platform processes government Excel/PDF/Word reports and transforms them into comprehensive dashboards with real-time analytics.

### Key Features

- **🔐 Secure Authentication** - Complete auth flow with login, password reset, and OTP verification
- **📊 Real-time Analytics** - Live sales and stock monitoring with automated refresh
- **📈 Interactive Dashboards** - Multiple specialized views for different business needs
- **📋 Report Processing** - Upload and process government reports in multiple formats
- **🗺️ Stock Heatmaps** - Visual representation of shop-wise closing stock
- **⚠️ Risk Alerts** - Automated alerts for stuck inventory and low stock situations
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices.

## 🛠 Tech Stack

### Core Framework

- **Next.js 15.5** - React framework with App Router
- **React 19.1** - UI library with latest features
- **TypeScript 5.0** - Type-safe development

### Styling & UI

- **TailwindCSS 4.0** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Geist Font Family** - Modern typography with weights 100-900
- **Inter Font** - Fallback font for enhanced readability
- **Lucide React** - Beautiful & consistent icon library

### Data & State Management

- **@tanstack/react-query 5.87** - Server state management
- **React Hook Form 7.62** - Performant form handling
- **Recharts 3.1** - Composable charting library
- **Axios 1.11** - HTTP client with interceptors

### Development Tools

- **ESLint 9** - Code linting with Next.js config
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler for development

## 🎨 Design System

### Color Palette

```css
/* Primary Brand Colors */
--primary-gradient: linear-gradient(#FF4250 → #D73742)
--error-color: #DC2626
--rose-accent: #FF4452

/* Neutral Palette */
--background: #FAFAFA
--text-primary: #0A0A0A
--text-secondary: #737373
--border-radius: 8px, 16px
```

### Typography

- **Primary Font**: Geist (weights: 400, 500, 600, 700)
- **Secondary Font**: Inter (fallback)
- **Font Features**: Variable fonts with optimal loading

### Component Styling

- Soft shadows and inset gradients
- Consistent 8px/16px border radius
- Noise texture backgrounds for depth
- Custom utility classes for common layouts

## 📁 Project Architecture

```
src/
├── app/                    # Next.js 15 App Router
│   ├── dashboard/         # Main dashboard pages
│   │   ├── daily-reports/ # Daily sales reports
│   │   ├── sales-analytics/ # Sales insights
│   │   ├── stock-analytics/ # Inventory tracking
│   │   ├── risk-alerts/   # Risk management
│   │   ├── upload-centre/ # File processing
│   │   └── user-management/ # User management
│   ├── context/           # React Context providers
│   ├── forgot-password/   # Password recovery
│   ├── reset-password/    # Password reset
│   └── verify-otp/        # OTP verification
├── components/            # Reusable UI components
│   ├── auth/             # Authentication forms
│   ├── chart/            # Data visualization components
│   ├── navbar/           # Navigation components
│   ├── sidebar/          # Dashboard navigation
│   ├── tables/           # Data table components
│   └── ui/               # Base UI components (Radix UI)
├── common/               # Shared utilities
│   ├── skeleton/         # Loading state components
│   └── [components]      # Common UI elements
├── libs/                 # Core utilities
│   ├── axios/            # API configuration
│   ├── constant/         # App constants
│   └── types/            # TypeScript definitions
├── assets/               # Static assets
│   ├── icons/            # SVG icons
│   └── image/            # Images
└── hooks/                # Custom React hooks
```

### Key Directories Explained

**`/app`** - Next.js App Router structure with file-based routing
**`/components`** - Organized by feature with barrel exports
**`/common`** - Shared components used across features
**`/libs`** - Business logic, API clients, and utilities
**`/assets`** - Static resources with organized imports

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd simbha
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Setup**
   Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=your_api_endpoint_here
```

4. **Start development server**

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000` (configured port)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🔧 Configuration

### Next.js Configuration

The project uses Next.js 15.5 with Turbopack for faster builds:

```javascript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: ["localhost:3000", "images.unsplash.com"],
  },
};
```

### TypeScript Configuration

Current configuration with recommended improvements:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**⚠️ Important**: Consider enabling stricter TypeScript rules:

- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`

### ESLint Configuration

Current setup with disabled rules that should be enabled:

```javascript
// eslint.config.mjs
{
  rules: {
    "@typescript-eslint/no-explicit-any": "off", // ⚠️ Should be "error"
    "@typescript-eslint/no-unused-vars": "off", // ⚠️ Should be "error"
    "react-hooks/exhaustive-deps": "off", // ⚠️ Should be "error"
  }
}
```

## 📊 Features Deep Dive

### Dashboard Analytics

- **Real-time Metrics**: Live sales tracking with YoY comparisons
- **Top Products**: Best-performing SKUs with unit sales
- **Seller Performance**: Top-performing shops and distributors
- **Active Resellers**: Geographic distribution insights

### Chart Components

- **DataDonutCard**: Interactive donut charts with hover effects
- **StoreReportVsFieldChart**: Bar charts comparing government vs field data
- **PeerComparisonChart**: Cylindrical charts for product comparisons
- **Heat Maps**: Geographic stock distribution visualization

### File Processing

- **Supported Formats**: Excel (.xlsx, .xls), PDF (.pdf), Word (.doc, .docx)
- **Drag & Drop**: Intuitive file upload interface
- **Processing Pipeline**: Government report parsing and data extraction

### Authentication Flow

- **Secure Login**: Email/password with validation
- **Password Recovery**: Multi-step reset process
- **OTP Verification**: Two-factor authentication support
- **Session Management**: JWT token handling with axios interceptors

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Form Validation**: Client and server-side validation
- **HTTPS Enforcement**: Secure data transmission
- **Input Sanitization**: XSS prevention measures

## 🚀 Performance Optimizations

- **Dynamic Imports**: Code splitting for chart components
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Variable fonts with display swap
- **Skeleton Loading**: Enhanced UX during data loading
- **Turbopack**: Faster development builds
- **React Query**: Efficient data caching and synchronization

## 🐛 Known Issues & Technical Debt

### High Priority

- **TypeScript**: Extensive use of `any` types throughout components
- **ESLint**: Critical rules disabled (no-explicit-any, no-unused-vars)
- **Error Handling**: Missing proper error boundaries
- **Loading States**: Generic "Loading...." text instead of proper skeletons

### Medium Priority

- **Component Size**: Large components (427-line DataDonutCard) need refactoring
- **Code Duplication**: Chart data transformation logic repeated
- **Naming Conventions**: Inconsistent file naming (camelCase vs kebab-case)

### Low Priority

- **Performance**: Some components could benefit from memoization
- **Accessibility**: Missing ARIA labels in some components

## 🛠 Development Guidelines

### Code Standards

- Use TypeScript strict mode (currently disabled)
- Follow kebab-case for file names
- Use PascalCase for component names
- Implement proper error handling
- Write descriptive commit messages
- Add JSDoc comments for complex functions

### Component Guidelines

- Keep components under 200 lines
- Extract reusable logic to custom hooks
- Use proper TypeScript interfaces
- Implement loading and error states
- Follow single responsibility principle

### API Integration

- Use React Query for all data fetching
- Implement proper error handling
- Use TypeScript interfaces for API responses
- Handle loading states consistently

## 📝 Available Scripts

```bash
npm run dev          # Start development server with Turbopack (port 3000)
npm run build        # Build production application with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

## 🐛 Testing Strategy

### Current State

- No test files present
- Manual testing approach

### Recommended Testing

- Unit tests for utility functions
- Integration tests for components
- E2E tests for critical user flows
- API mocking for data fetching

## 🐛 Troubleshooting

### Common Issues

**Build Errors**:

- Ensure all dependencies are installed with correct versions
- Check TypeScript configuration

**Environment Variables**:

- Verify `.env.local` file exists with required variables
- Check `NEXT_PUBLIC_API_URL` is set

**TypeScript Errors**:

- Check path aliases in `tsconfig.json`
- Enable strict mode gradually

**Styling Issues**:

- Ensure TailwindCSS is properly configured
- Check for conflicting CSS classes

**API Issues**:

- Verify API endpoints are accessible
- Check axios interceptors configuration
- Review React Query setup

### Development Tips

- Use browser dev tools for responsive testing
- Check console for detailed error messages
- Use React Query DevTools for debugging
- Clear browser cache if styles aren't updating

## 🔄 Migration Notes

### From Pages Router to App Router

- ✅ Already using App Router
- ✅ Proper file-based routing structure

### TypeScript Improvements Needed

- Enable strict mode
- Fix all `any` usage
- Add proper return types
- Implement strict null checks

### Component Refactoring

- Break down large components
- Extract custom hooks
- Implement proper error boundaries
- Add comprehensive loading states

## 📄 License

This project is proprietary software for Simba Beer Brand.

## 👥 Team

Built with ❤️ by the Simba development team.

---

**Need help?**

- Check the troubleshooting guide above
- Review the code review findings
- Contact our support team

**For New Developers:**

1. Read this README thoroughly
2. Set up your development environment
3. Review the code review findings
4. Start with small bug fixes before major features
5. Follow the development guidelines
# amrik trigger build#   s i m b a  
 