# Specification

## Summary
**Goal:** Build a Bitunix trading bot system with three automated strategies (Grid spot trading, MACD+RSI futures, EMA scalping futures), manual trading capabilities, risk management, and Internet Identity authentication.

**Planned changes:**
- Implement Grid spot trading bot with configurable price range, grid levels, and investment distribution
- Implement MACD+RSI futures trading bot with buy signals (MACD cross up + RSI<30) and sell signals (MACD cross down + RSI>70)
- Implement EMA crossover scalping futures bot with configurable stop-loss and take-profit
- Create comprehensive dashboard displaying real-time status, P&L, trades, and signals for all three bots
- Build manual trading interface for both spot and futures with independent bot enable/disable toggles
- Integrate Bitunix API with secure credential storage, market data fetching, order execution, and account management
- Implement risk management controls: stop-loss, take-profit, position size limits, and daily loss limits
- Integrate Internet Identity authentication with per-user bot configurations and trading history
- Design dark-themed professional trading interface with neon accents, animated charts, and smooth transitions

**User-visible outcome:** Users authenticate with Internet Identity, configure their Bitunix API credentials, set up three different trading bots with custom parameters and risk controls, view real-time performance metrics on a professional dashboard, manually execute trades, and toggle between automated and manual modes for each bot independently.
