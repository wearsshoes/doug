# Update Tests for Bidirectional Rules

1. Update ruleChain.test.ts:
   - Add direction to RuleApplication in test cases
   - Update test cases to use BidirectionalRule structure
   - Add tests for bidirectional chain operations

2. Update miu.test.ts:
   - Restructure tests to test both forward and backward operations
   - Update test cases to use forward/backward properties
   - Add tests for inverse operations

3. Add new test file for bidirectional operations:
   - Test meeting point detection
   - Test forward/backward chain interactions
   - Test rule application in both directions