# M'Cheyne Reading Plan Web App

This is a web application for following the M'Cheyne bible reading plan. It is built with Next.js and provides a simple, clean interface to track your reading progress.

## Features

*   **Daily Reading Passages:** Displays the reading passages for each day of the year according to the M'Cheyne reading plan.
*   **Progress Tracking:** Mark readings as complete and the app will save your progress in your browser's local storage.
*   **Self-Paced Mode:** Don't want to follow a strict calendar? Use the self-paced mode to read at your own rhythm. The app will show you the next unread passages.
*   **Localization:** The interface is available in English and Spanish.
*   **Leap Day Support:** Includes special readings for leap years.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

Install the project dependencies:
```bash
npm install
```

## Usage

### Running the Development Server

To run the app in development mode, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) to view it in your browser. The app supports English (`/en`) and Spanish (`/es`).

### Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

### Running in Production

To start the production server, use:

```bash
npm run start
```

## Running Tests

This project uses [Jest](https://jestjs.io/) for testing. To run the test suite, use the following command:

```bash
npm run test
```

## Code Quality

### Linting

This project uses [ESLint](https://eslint.org/) to identify and report on patterns found in ECMAScript/JavaScript code. To run the linter, use:

```bash
npm run lint
```

### Formatting

This project uses [Prettier](https://prettier.io/) for code formatting. To format the code, run:

```bash
npm run format
```

## Technology Stack

*   [Next.js](https://nextjs.org/) - React framework for production.
*   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
*   [Jest](https://jestjs.io/) - JavaScript testing framework.
*   [next-intl](https://next-intl-docs.vercel.app/) - Internationalization for Next.js.
*   [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components.

## Project Structure

Here is a high-level overview of the key directories in this project:

*   `/app`: Contains the core application code, following the Next.js App Router structure. The routes are organized by locale (`[locale]`).
*   `/src`: Contains reusable components, context providers, utility functions, and type definitions.
    *   `/src/components`: React components used throughout the application.
    *   `/src/context`: React context providers for managing global state.
    *   `/src/lib`: Utility functions and constants.
*   `/messages`: Contains the localization files for `next-intl` (`en.json`, `es.json`).
*   `/public`: Static assets like images and fonts.
