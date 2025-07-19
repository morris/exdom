# Changelog

## NEXT

- Make `update` optional in `reconcile`
- Use `item` (if it is a string) as key fallback in `reconcile`
- Update dependencies

## 2.0.1

- Simplify `escapeHTML`
- Streamline test setup
- Update dependencies

## 2.0.0

- BREAKING: Rename `nextFrame` to `requestAnimationFrameOnce`
- BREAKING: Remove `key: string` in `reconcile` (`key` must be function, if any)
- BREAKING: Remove `emit`, `send` and `relay`as they cannot be implemented in a
  type-safe way
- BREAKING: Remove `getValue` as it did not provide non-trivial work
- Fix `requestAnimationFrameOnce` swallowing errors
- Add `TypedCustomEvent` constructor and typed `dispatchEvent` signature to
  `CustomEventTarget` (can infer details based on event target and type)
- Use indexes as key fallback in `reconcile`
- Handle boolean values correctly in `setAttr`
- Fix top-level `document` access
- Migrate to one file library
- Update dependencies

## 1.0.2

- Update README
- Update docs
- Add tests
- Update dependencies

## 1.0.1

- Improve `nextFrame` behavior
- Fix `reconcile` key function
- Update docs
- Update dependencies

## 1.0.0

- Initial version
