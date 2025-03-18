# Copilot Project Instructions for UI (Vite, React, Typescript and Material UI)

## Code Architecture

- **Language**: TypeScript
- **Structure**:
    - `src/components/` - UI components
    - `src/constants/` - App constants
    - `src/contexts/` - App contexts
    - `src/logic/` - Business logic
    - `src/hooks/` - React hooks
    - `src/pages/` - Page components
    - `src/types/` - Types and interfaces
- **Nesting**: Maximum 1 level below src/
- **State Management**: Multiple focused React contexts rather than a single large context
    - Create separate contexts for distinct state domains
    - Prefer simple getter/setter patterns for each context
    - Colocate related state in the same context
    - Keep state management logic close to where it's used
- **File Naming**: PascalCase for components, camelCase for others

## Code Style

- **Layout**: Clean, consistent indentation
- **Logic Files**: Strictly 1 export per file
- **File Naming**: Files must be named the same as their named export
- **Exports**: Named only (no default exports)
- **Imports**: Group 3rd party first, then internal
- **Components**: Functional with explicit prop types

## TypeScript Standards

- **Config**: Strict mode enabled
- **Null Checking**: Required
- **Types**: Prefer interfaces for objects, explicit return types

## Documentation

- **Comments**: Only for complex logic, prefer self-documenting code

## Performance

- **Memoization**: Use React.memo, useMemo, useCallback for expensive operations
- **Rendering**: Prevent unnecessary re-renders

## Testing

- **Framework**: Jest with React Testing Library
- **Coverage**: 100% for `src/logic/` and `src/hooks/`
- **Unit Tests**: Required for all functions
- **Test Files**: Named as `<NAMED_EXPORT>.test.ts` or `<NAMED_EXPORT>.test.tsx`
- **Test Structure**: Mirror source code structure

## Quality & Security

- **Input Validation**: Required for all user inputs
- **Authentication**: Token-based with secure storage
- **Environment Variables**: No secrets in code

## Accessibility

- **Standard**: WCAG AA compliance
- **Semantic HTML**: Required

## Communication Style

- Provide minimal but contextual explanations