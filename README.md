# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

# 🛻 Car Marketplace Frontend

A car marketplace web application frontend built with **React**, **TypeScript**, and **Vite**. This app allows users to view, search, and list vehicles for sale. It also includes user profiles, direct messaging, and authentication with Clerk.

---

## ⚙️ Tech Stack

- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/en/main)
- [React Query](https://tanstack.com/query/latest)
- [Clerk](https://clerk.com/) (Authentication)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/oluwadunsin2016/car_marketplace_frontend.git

# Navigate to the project directory
cd car_marketplace_frontend

# Install dependencies
npm install

# Start development server
npm run dev


# Folder Structure
src/
├── add-listing/            # Add car listing page
├── assets/                 # Static images and resources
├── components/             # Shared and UI components
│   ├── shared/             # Shared elements
│   └── ui/                 # UI elements (Header, Footer, etc.)
├── home.tsx                # Home component
├── Layout.tsx              # Layout wrapper
├── main.tsx                # Main entry with routing and providers
├── profile/                # User profile page
├── listing-details/        # Single car listing details
├── search/                 # Search and category filter components


# Routes Overview

| Route                  | Component          | Description                      |
| ---------------------- | ------------------ | -------------------------------- |
| `/`                    | `Home`             | Homepage                         |
| `/profile`             | `Profile`          | User profile                     |
| `/add-listing`         | `AddListing`       | Submit a new car listing         |
| `/search`              | `SearchByOptions`  | Search cars using filter options |
| `/search/:category`    | `SearchByCategory` | Search cars by specific category |
| `/message`             | `Chats`            | Direct messaging interface       |
| `/listing-details/:id` | `ListingDetails`   | View a specific car listing      |
