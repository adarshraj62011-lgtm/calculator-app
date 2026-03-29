import React, { useState, useEffect, useCallback } from 'react';
import { evaluateExpression } from '../core/mathCore.js';
import { calculateBMI, calculateAge, convertCurrency, convertLength, convertWeight, convertTemperature } from '../core/converters.js';

// ── Local history store (fs not available in browser) ──────────────────────
const localHistory = {
  data: [],
  add: (expr, result) => {
    const entry = { id: Date.now(), ts: new Date(), expression: expr, result: result.toString() };
    localHistory.data = [entry, ...localHistory.data].slice(0, 50);
    return entry;
  },
  get: () => localHistory.data,
  clear: () => { localHistory.data = []; },
};

// ── Memory ──────────────────────────────────────────────────────────────────
const memory = { value: 0 };

// ────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [mode, setMode] = useState('standard');   // standard | scientific
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('history');
  const [activeUtil, setActiveUtil] = useState(null);     // null | bmi | age | currency | emi

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const pushHistory = (expression, result) => {
    localHistory.add(expression, result);
    setHistory([...localHistory.get()]);
  };

  const setDisplaySafe = (val) => {
    const s = val.toString();
    setDisplay(s.length > 14 ? parseFloat(s).toPrecision(10) : s);
  };

  // ── Button handlers ────────────────────────────────────────────────────────
  const handleDigit = useCallback((d) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return d;
      if (prev.length >= 14) return prev;
      return prev + d;
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setDisplay(prev => (prev.includes('.') ? prev : prev + '.'));
  }, []);

  const handleOperator = useCallback((op) => {
    setExpr(prev => {
      // Replace trailing operator
      if (prev && /[\+\-\*\/]$/.test(prev.trim())) {
        return prev.trim().slice(0, -1) + ' ' + op + ' ';
      }
      return (prev || display) + ' ' + op + ' ';
    });
    setDisplay('0');
  }, [display]);

  const handleEqual = useCallback(() => {
    const full = expr + display;
    try {
      const result = evaluateExpression(full);
      pushHistory(full, result);
      setDisplaySafe(result);
      setExpr('');
    } catch { setDisplay('Error'); setExpr(''); }
  }, [display, expr]);

  const handleClear = useCallback(() => { setDisplay('0'); setExpr(''); }, []);
  const handleBackspace = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);
  const handleSign = useCallback(() => {
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : (prev === '0' ? prev : '-' + prev));
  }, []);
  const handlePercent = useCallback(() => {
    setDisplay(prev => (parseFloat(prev) / 100).toString());
  }, []);

  // ── Scientific ─────────────────────────────────────────────────────────────
  const execSci = useCallback((fn) => {
    try {
      const result = evaluateExpression(`${fn}(${display})`);
      pushHistory(`${fn}(${display})`, result);
      setDisplaySafe(result);
    } catch { setDisplay('Error'); }
  }, [display]);

  // ── Memory ─────────────────────────────────────────────────────────────────
  const memAdd = () => { memory.value += parseFloat(display) || 0; };
  const memSub = () => { memory.value -= parseFloat(display) || 0; };
  const memRecall = () => setDisplay(memory.value.toString());
  const memClear = () => { memory.value = 0; };

  // ── Keyboard support ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === '.') handleDecimal();
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('*');
      else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
      else if (e.key === 'Enter' || e.key === '=') handleEqual();
      else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') handleClear();
      else if (e.key === 'Backspace') handleBackspace();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDigit, handleDecimal, handleOperator, handleEqual, handleClear, handleBackspace]);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      {/* ── CALCULATOR PANE ── */}
      <div className="calc-pane">
        {/* Header */}
        <div className="calc-header">
          <div className="calc-mode-pill">
            {mode === 'scientific' ? '⚗ Scientific' : '∑ Standard'}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="icon-btn" title="Toggle Science Mode" onClick={() => setMode(m => m === 'standard' ? 'scientific' : 'standard')}>
              {mode === 'scientific' ? '🔢' : '⚗️'}
            </button>

            {/* Theme toggle */}
            <div className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
              <div className="theme-toggle-knob">{theme === 'dark' ? '🌙' : '☀️'}</div>
            </div>
          </div>
        </div>

        {/* Memory bar */}
        <div className="memory-bar">
          {[['MC', memClear], ['M+', memAdd], ['M−', memSub], ['MR', memRecall]].map(([lbl, fn]) => (
            <button key={lbl} className="mem-btn" onClick={fn}>{lbl}</button>
          ))}
        </div>

        {/* Display */}
        <div className="calc-display">
          <div className="display-expression">{expr || '\u00A0'}</div>
          <div className="display-result">{display}</div>
        </div>

        {/* Keypad */}
        <div className={`keypad${mode === 'scientific' ? ' sci' : ''}`}>
          {/* Row 0: functions */}
          <button className="btn btn-fn" onClick={handleClear}>C</button>
          <button className="btn btn-fn" onClick={handleSign}>+/−</button>
          <button className="btn btn-fn" onClick={handlePercent}>%</button>
          <button className="btn btn-op" onClick={() => handleOperator('/')}>÷</button>
          {mode === 'scientific' && <button className="btn btn-sci" onClick={() => execSci('sin')}>sin</button>}

          {/* Row 1 */}
          <button className="btn btn-num" onClick={() => handleDigit('7')}>7</button>
          <button className="btn btn-num" onClick={() => handleDigit('8')}>8</button>
          <button className="btn btn-num" onClick={() => handleDigit('9')}>9</button>
          <button className="btn btn-op" onClick={() => handleOperator('*')}>×</button>
          {mode === 'scientific' && <button className="btn btn-sci" onClick={() => execSci('cos')}>cos</button>}

          {/* Row 2 */}
          <button className="btn btn-num" onClick={() => handleDigit('4')}>4</button>
          <button className="btn btn-num" onClick={() => handleDigit('5')}>5</button>
          <button className="btn btn-num" onClick={() => handleDigit('6')}>6</button>
          <button className="btn btn-op" onClick={() => handleOperator('-')}>−</button>
          {mode === 'scientific' && <button className="btn btn-sci" onClick={() => execSci('tan')}>tan</button>}

          {/* Row 3 */}
          <button className="btn btn-num" onClick={() => handleDigit('1')}>1</button>
          <button className="btn btn-num" onClick={() => handleDigit('2')}>2</button>
          <button className="btn btn-num" onClick={() => handleDigit('3')}>3</button>
          <button className="btn btn-op" onClick={() => handleOperator('+')}>+</button>
          {mode === 'scientific' && <button className="btn btn-sci" onClick={() => execSci('log10')}>log</button>}

          {/* Row 4 */}
          <button className="btn btn-num btn-wide" onClick={() => handleDigit('0')}>0</button>
          <button className="btn btn-num" onClick={handleDecimal}>.</button>
          <button className="btn btn-eq" onClick={handleEqual}>=</button>
          {mode === 'scientific' && <button className="btn btn-sci" onClick={() => execSci('sqrt')}>√</button>}
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebar-tabs">
          <button className={`s-tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
          <button className={`s-tab${activeTab === 'utilities' ? ' active' : ''}`} onClick={() => setActiveTab('utilities')}>Tools</button>
        </div>

        <div className="sidebar-body">
          {/* ── History ── */}
          {activeTab === 'history' && (
            <div className="animate-in">
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">Your calculations will appear here</div>
                </div>
              ) : (
                <>
                  {history.map(item => (
                    <div className="hist-item" key={item.id} onClick={() => setDisplay(item.result)}>
                      <div className="hist-expr">{item.expression}</div>
                      <div className="hist-res">= {item.result}</div>
                      <div className="hist-time">
                        {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <button className="clear-btn" onClick={() => { localHistory.clear(); setHistory([]); }}>
                    Clear History
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Utilities ── */}
          {activeTab === 'utilities' && (
            <div className="animate-in">
              <div className="util-grid">
                {[
                  { id: 'bmi', icon: '⚖️', label: 'BMI' },
                  { id: 'age', icon: '🎂', label: 'Age' },
                  { id: 'currency', icon: '💱', label: 'Currency' },
                  { id: 'length', icon: '📏', label: 'Length' },
                  { id: 'weight', icon: '🏋️', label: 'Weight' },
                  { id: 'temp', icon: '🌡️', label: 'Temp' },
                ].map(u => (
                  <div
                    key={u.id}
                    className={`util-card${activeUtil === u.id ? ' active' : ''}`}
                    onClick={() => setActiveUtil(prev => prev === u.id ? null : u.id)}
                  >
                    <div className="util-icon">{u.icon}</div>
                    <div className="util-label">{u.label}</div>
                  </div>
                ))}
              </div>

              {/* Tool Forms */}
              {activeUtil === 'bmi' && <BMITool onClose={() => setActiveUtil(null)} />}
              {activeUtil === 'age' && <AgeTool onClose={() => setActiveUtil(null)} />}
              {activeUtil === 'currency' && <CurrencyTool onClose={() => setActiveUtil(null)} />}
              {activeUtil === 'length' && <LengthTool onClose={() => setActiveUtil(null)} />}
              {activeUtil === 'weight' && <WeightTool onClose={() => setActiveUtil(null)} />}
              {activeUtil === 'temp' && <TempTool onClose={() => setActiveUtil(null)} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tool Components
// ────────────────────────────────────────────────────────────────────────────

function ToolShell({ title, onClose, children }) {
  return (
    <div className="conv-form">
      <div className="conv-label">
        {title}
        <button onClick={onClose} title="Close">✕</button>
      </div>
      {children}
    </div>
  );
}

function BMITool({ onClose }) {
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [res, setRes] = useState(null);
  const calc = () => {
    try { setRes(calculateBMI(Number(w), Number(h))); }
    catch (e) { setRes(null); alert(e.message); }
  };
  const category = (bmi) => bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  return (
    <ToolShell title="BMI CALCULATOR" onClose={onClose}>
      <input className="conv-input" placeholder="Weight (kg)" type="number" value={w} onChange={e => setW(e.target.value)} />
      <input className="conv-input" placeholder="Height (cm)" type="number" value={h} onChange={e => setH(e.target.value)} />
      <button className="conv-btn" onClick={calc}>Calculate</button>
      {res && <div className="conv-result">{res.toFixed(2)} — {category(res)}</div>}
    </ToolShell>
  );
}

function AgeTool({ onClose }) {
  const [d, setD] = useState('');
  const [res, setRes] = useState(null);
  return (
    <ToolShell title="AGE CALCULATOR" onClose={onClose}>
      <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Date of Birth</label>
      <input className="conv-input" type="date" value={d} onChange={e => setD(e.target.value)} />
      <button className="conv-btn" onClick={() => { try { setRes(calculateAge(d)); } catch (e) { alert(e.message); } }}>Calculate</button>
      {res !== null && <div className="conv-result">{res} years old</div>}
    </ToolShell>
  );
}

function CurrencyTool({ onClose }) {
  const curs = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
  const [amt, setAmt] = useState('');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [res, setRes] = useState(null);
  return (
    <ToolShell title="CURRENCY CONVERTER" onClose={onClose}>
      <input className="conv-input" placeholder="Amount" type="number" value={amt} onChange={e => setAmt(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="conv-select" value={from} onChange={e => setFrom(e.target.value)}>
          {curs.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="conv-select" value={to} onChange={e => setTo(e.target.value)}>
          {curs.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button className="conv-btn" onClick={() => { try { setRes(convertCurrency(Number(amt), from, to)); } catch (e) { alert(e.message); } }}>Convert</button>
      {res !== null && <div className="conv-result">{res.toFixed(4)} {to}</div>}
    </ToolShell>
  );
}

function LengthTool({ onClose }) {
  const units = ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'];
  const [val, setVal] = useState('');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [res, setRes] = useState(null);
  return (
    <ToolShell title="LENGTH CONVERTER" onClose={onClose}>
      <input className="conv-input" placeholder="Value" type="number" value={val} onChange={e => setVal(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="conv-select" value={from} onChange={e => setFrom(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
        <select className="conv-select" value={to} onChange={e => setTo(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <button className="conv-btn" onClick={() => { try { setRes(convertLength(Number(val), from, to)); } catch (e) { alert(e.message); } }}>Convert</button>
      {res !== null && <div className="conv-result">{res.toPrecision(6)} {to}</div>}
    </ToolShell>
  );
}

function WeightTool({ onClose }) {
  const units = ['kg', 'g', 'mg', 'lb', 'oz'];
  const [val, setVal] = useState('');
  const [from, setFrom] = useState('kg');
  const [to, setTo] = useState('lb');
  const [res, setRes] = useState(null);
  return (
    <ToolShell title="WEIGHT CONVERTER" onClose={onClose}>
      <input className="conv-input" placeholder="Value" type="number" value={val} onChange={e => setVal(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="conv-select" value={from} onChange={e => setFrom(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
        <select className="conv-select" value={to} onChange={e => setTo(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <button className="conv-btn" onClick={() => { try { setRes(convertWeight(Number(val), from, to)); } catch (e) { alert(e.message); } }}>Convert</button>
      {res !== null && <div className="conv-result">{res.toPrecision(6)} {to}</div>}
    </ToolShell>
  );
}

function TempTool({ onClose }) {
  const units = ['C', 'F', 'K'];
  const [val, setVal] = useState('');
  const [from, setFrom] = useState('C');
  const [to, setTo] = useState('F');
  const [res, setRes] = useState(null);
  return (
    <ToolShell title="TEMPERATURE CONVERTER" onClose={onClose}>
      <input className="conv-input" placeholder="Value" type="number" value={val} onChange={e => setVal(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="conv-select" value={from} onChange={e => setFrom(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
        <select className="conv-select" value={to} onChange={e => setTo(e.target.value)}>
          {units.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <button className="conv-btn" onClick={() => { try { setRes(convertTemperature(Number(val), from, to)); } catch (e) { alert(e.message); } }}>Convert</button>
      {res !== null && <div className="conv-result">{res.toFixed(4)} °{to}</div>}
    </ToolShell>
  );
}
