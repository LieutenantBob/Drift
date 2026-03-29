---
name: bitbot-diagnostic-module-pattern
description: "Architecture pattern for adding post-hoc diagnostic analysis modules to BitBot backtest"
user-invocable: false
origin: auto-extracted
---

# BitBot Diagnostic Analysis Module Pattern

**Extracted:** 2026-03-10
**Context:** Adding new post-hoc analysis modules to the BitBot backtest engine (e.g., participation analysis, rocket guard failure analysis)

## Problem

BitBot needs diagnostic modules that analyze backtest results without modifying the hot-loop engine. Each diagnostic answers a specific question (e.g., "Why don't more assets trade?" or "Which guard blocks rockets?"). Building these ad-hoc leads to inconsistent interfaces and missed integration points.

## Solution

Follow this 4-file pattern, proven by `participation_report.py` and `rocket_report.py`:

### File Structure

```
app/services/backtest/
  {name}_analysis.py    # Data structures + core computation (~500-600 lines)
  {name}_report.py      # 8-section report generator + text formatter (~500-700 lines)
tests/unit/
  test_{name}_analysis.py  # Unit tests (~300-400 lines)
scripts/
  run_backtest.py          # Add --{name}-report CLI flag (+15-20 lines)
```

### 1. Analysis module (`{name}_analysis.py`)

```python
# Frozen dataclasses for immutable results
@dataclass(frozen=True)
class EventType: ...        # Detected event (e.g., RocketEvent)

@dataclass(frozen=True)
class SnapshotType: ...     # Per-timestamp measurement (e.g., GuardSnapshot)

@dataclass
class ProfileType: ...      # Mutable accumulator per event (e.g., RocketGuardProfile)

# Standalone functions mirroring engine methods (CRITICAL: don't import engine internals)
def compute_X(store: CandleStore, pair: str, ts_ms: int) -> float:
    """Mirror of engine._compute_X -- standalone for post-hoc use."""

# Extraction functions
def extract_events_from_store(store: CandleStore) -> list[EventType]: ...

# Top-level orchestrator returns plain dict (JSON-serializable)
def run_{name}_analysis(store, settings, trades, ...) -> dict:
    """Returns {"events": [...], "profiles": [...], ...}"""
```

**Key rules:**
- Standalone functions take `CandleStore` as first arg -- never access engine internals
- Mirror engine computation exactly (copy formula, don't import private methods)
- Use `TYPE_CHECKING` for CandleStore/ClosedTrade imports to avoid circular deps
- Orchestrator returns a plain dict, not dataclasses (report layer handles serialization)

### 2. Report module (`{name}_report.py`)

```python
def generate_{name}_report(analysis: dict, settings) -> dict:
    """8-section JSON-serializable report."""
    return {
        "1_section_name": _section_1(...),
        ...
        "8_conclusion": _section_8(...),
        "metadata": {...},
    }

def format_{name}_text_report(report: dict) -> str:
    """Console-friendly ASCII text output."""

def write_{name}_json_report(report: dict, path: str) -> None:
    """Machine-readable JSON output."""

def print_{name}_report(store, settings, trades, ...) -> dict:
    """Convenience: run analysis + generate + print + return."""
```

### 3. CLI integration (`run_backtest.py`)

```python
# In argparse setup:
parser.add_argument("--{name}-report", action="store_true", ...)

# In main():
need_engine = args.participation_report or args.rocket_report  # Add new flag here
# ... after backtest completes:
if args.{name}_report and engine is not None:
    from app.services.backtest.{name}_report import print_{name}_report, write_{name}_json_report
    report = print_{name}_report(engine.store, settings, result.trades)
    write_{name}_json_report(report, "data/{name}_report.json")
```

### 4. Tests

```python
# Helper: create CandleStore with synthetic data exhibiting the target pattern
def _make_store_with_{pattern}() -> CandleStore:
    store = CandleStore()
    candles = [...]  # Synthetic candles with known properties
    store.load_pair(pair, candles)
    return store

# Test classes: one per logical group
class TestComputation:     # Pure function correctness
class TestExtraction:      # Event detection from synthetic data
class TestProfiling:       # Per-event analysis
class TestReportGeneration:  # All 8 sections present, JSON-serializable, text headers
```

## Critical Gotchas

### Windows CP1252 Console Encoding
**Never use Unicode symbols in printed output.** Windows console uses CP1252 which cannot encode:
- `<=` `>=` not `<=` `>=` (Unicode less/greater-than-or-equal)
- `->` not `->` (Unicode arrow)
- `+/-` not `+/-` (Unicode plus-minus)
- `x` not `x` (Unicode multiplication sign)

This only fails at runtime (`print()`), not during testing. Docstrings/comments are fine.

### CandleStore Internal Access
CandleStore fields (`_timestamps`, `_closes`, etc.) are prefixed with `_` but are accessed directly for performance in analysis modules. This is acceptable for post-hoc analysis -- don't add public API just for diagnostics.

### Engine Method Mirroring
When mirroring engine formulas (e.g., spread estimate = `min(avg_hl * 0.3, 2.0)`), copy the formula exactly. Add extra return values for diagnostic insight (e.g., return `before_cap` value too). Never modify the engine to expose internals.

### Test sqlite3.OperationalError
Tests calling `engine.run()` trigger `_load_data()` which opens a NEW `:memory:` SQLite (always empty), overwriting pre-loaded candles. Fix with:
```python
def _run_engine(engine):
    engine._load_data = lambda: None
    return engine.run()
```

## Existing Implementations (Reference)

| Module | Question Answered | Key Finding |
|--------|-------------------|-------------|
| `participation_report.py` + `diagnostics.py` | Why do only 5-8 of 65+ assets generate trades? | Answer A: Momentum scarcity (98.4% rejections = low_momentum) |
| `rocket_analysis.py` + `rocket_report.py` | Why are >50% 24h movers blocked by execution guards? | DEPTH_DOMINANT: 48/52 rockets (92%) blocked by depth guard. Avg depth $383 vs $5,000 required. Spread hypothesis was wrong. |

## Key Data Points (for future diagnostic work)

- **Engine pipeline order:** position_limit -> global_filter -> per_pair: cooldown -> momentum -> persistence(E2) -> price -> volume(E3) -> score -> execution_guards -> followthrough(E6) -> edge -> sizing -> entry
- **Execution guards:** spread (H-L range x 0.3, cap 2.0), slippage (fixed 0.1% in backtest), depth (vol_24h x 0.001 vs $5,000)
- **Depth requires $5M+ 24h volume** to pass ($5,000 / 0.001)
- **Oct 10, 2025:** Major cluster event, 35 rockets in +/-48h window
- **414 tests** as of 2026-03-10 (391 pre-existing + 23 rocket analysis)
- **Python path:** `C:\Users\bo\AppData\Local\Python\bin\python.exe`
- **DB path:** `data/history.db` (SQLite, table `candles_1m`)
