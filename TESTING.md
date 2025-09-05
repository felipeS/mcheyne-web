# Testing Guide

This document outlines the testing strategy and conventions for the MCheyne Web application.

## Testing Strategy

### Overview

- **Primary Focus**: Unit and component testing (90% of test coverage)
- **Secondary Focus**: E2E testing for critical user journeys (10% of tests)
- **Goal**: Fast, reliable tests that catch regressions quickly

### Test Categories

#### 1. Unit Tests (`src/lib/__tests__/*.test.ts`)

- Test pure functions and utilities
- Focus on business logic (date calculations, data transformations)
- Mock external dependencies
- Example: `planConstants.test.ts`

#### 2. Component Tests (`src/components/__tests__/*.test.tsx`)

- Test React components in isolation
- Use React Testing Library for user-centric testing
- Mock context providers and external APIs
- Example: `ReadingSelection.test.tsx`

#### 3. Integration Tests (`src/context/__tests__/*.test.tsx`)

- Test context providers and state management
- Test localStorage persistence
- Test error handling
- Example: `PlanProvider.test.tsx`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## Configuration Files

- **Jest Config**: `jest.config.ts` - TypeScript configuration with proper typing
- **Jest Setup**: `jest.setup.ts` - Global test setup with TypeScript types
- **Dependencies**: `ts-node` enables Jest to parse TypeScript config files

## Writing Tests

### File Structure

```
src/
├── lib/
│   ├── planConstants.test.ts
│   └── planConstants.ts
├── components/
│   ├── reading-selection.test.tsx
│   └── reading-selection.tsx
└── context/
    ├── PlanProvider.test.tsx
    └── PlanProvider.tsx
```

### Naming Conventions

- Test files: `[ComponentName].test.tsx` or `[ModuleName].test.ts`
- Test descriptions: Clear, descriptive sentences
- Test blocks: Arrange, Act, Assert pattern

### Example Patterns

#### Unit Test

```typescript
describe("isLeapYear", () => {
  it("should return true for leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it("should return false for non-leap years", () => {
    expect(isLeapYear(2023)).toBe(false);
  });
});
```

#### Component Test

```typescript
describe("ReadingSelection", () => {
  it("should render reading passages", () => {
    mockUsePlan.getSelection.mockReturnValue({
      passages: ["Genesis 1"],
      isLeap: false,
    });

    render(<ReadingSelection />);

    expect(screen.getByText("Genesis 1")).toBeInTheDocument();
  });
});
```

#### Context/Integration Test

```typescript
describe("PlanProvider", () => {
  it("should persist changes to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    await user.click(screen.getByTestId("toggle-self-paced"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith("selfPaced", "true");
  });
});
```

## Mocking Strategy

### Local Storage

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### Context Providers

```typescript
jest.mock("@/context/PlanProvider", () => ({
  usePlan: () => mockUsePlan,
}));
```

### Next.js Features

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

## Best Practices

### ✅ Do's

- Test user interactions, not implementation details
- Use descriptive test names that explain the behavior
- Mock external dependencies consistently
- Keep tests fast and reliable
- Test error conditions and edge cases
- Use `screen` queries from React Testing Library
- Test accessibility features when relevant

### ❌ Don'ts

- Don't test implementation details that might change
- Don't create brittle tests that break with refactoring
- Don't mock everything - test integration where it matters
- Don't write tests that are slower than 1 second
- Don't duplicate test logic across files

## Coverage Goals

- **Business Logic** (`planConstants.ts`): 90%+
- **State Management** (`PlanProvider.tsx`): 70%+
- **UI Components**: 80%+ for critical components
- **Overall**: 70%+ statement coverage

## CI/CD Integration

Tests run automatically on:

- Every push to main branch
- Every pull request
- Multiple Node.js versions (18.x, 20.x)

Coverage reports are uploaded to Codecov.

## Adding New Tests

1. Create test file in appropriate `__tests__` directory
2. Follow naming conventions
3. Use existing patterns from similar tests
4. Run tests locally before committing
5. Ensure CI passes

## Troubleshooting

### Common Issues

**Tests failing due to localStorage**

- Ensure localStorage is properly mocked in test setup

**Component tests failing due to context**

- Mock the context provider or use a test wrapper

**Async tests timing out**

- Use `act()` from React Testing Library for state updates
- Wait for async operations to complete

**Translation tests failing**

- Mock `next-intl` or provide fallback translations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
