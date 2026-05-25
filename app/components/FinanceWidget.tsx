'use client';
import { useState, useEffect, useCallback } from 'react';

interface Ticker {
  id: string;
  symbol: string;
  type: 'fx' | 'crypto' | 'stock';
}

interface Rate {
  symbol: string;
  price: number;
  change24h?: number;
}

function getTickers(): Ticker[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('hexbrief_tickers');
    if (raw) return JSON.parse(raw);
    return [
      { id: '1', symbol: 'GBP/USD', type: 'fx' },
      { id: '2', symbol: 'GBP/EUR', type: 'fx' },
      { id: '3', symbol: 'BTC',     type: 'crypto' },
    ];
  } catch { return []; }
}

function saveTickers(t: Ticker[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_tickers', JSON.stringify(t));
}

async function fetchRates(tickers: Ticker[]): Promise<Rate[]> {
  const rates: Rate[] = [];

  // FX rates via frankfurter.app (free, no key)
  const fxTickers = tickers.filter(t => t.type === 'fx');
  if (fxTickers.length > 0) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=GBP');
      if (res.ok) {
        const data = await res.json();
        fxTickers.forEach(t => {
          const parts = t.symbol.split('/');
          const to = parts[1];
          if (data.rates[to]) {
            rates.push({ symbol: t.symbol, price: data.rates[to] });
          }
        });
      }
    } catch {}
  }

  // Crypto via CoinGecko free API (no key needed)
  const cryptoTickers = tickers.filter(t => t.type === 'crypto');
  if (cryptoTickers.length > 0) {
    try {
      const ids = cryptoTickers.map(t => {
        const map: Record<string, string> = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 'XRP': 'ripple' };
        return map[t.symbol.toUpperCase()] || t.symbol.toLowerCase();
      }).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=gbp&include_24hr_change=true`);
      if (res.ok) {
        const data = await res.json();
        cryptoTickers.forEach(t => {
          const map: Record<string, string> = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 'XRP': 'ripple' };
          const id = map[t.symbol.toUpperCase()] || t.symbol.toLowerCase();
          if (data[id]) {
            rates.push({
              symbol: t.symbol,
              price: data[id].gbp,
              change24h: data[id].gbp_24h_change,
            });
          }
        });
      }
    } catch {}
  }

  return rates;
}

function fmt(price: number, symbol: string): string {
  if (symbol.includes('/')) return price.toFixed(4);
  if (price > 1000) return price.toLocaleString('en-GB', { maximumFractionDigits: 0 });
  if (price > 1) return price.toFixed(2);
  return price.toFixed(6);
}

export default function FinanceWidget() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [rates, setRates] = useState<Map<string, Rate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newType, setNewType] = useState<Ticker['type']>('fx');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadRates = useCallback(async (t: Ticker[]) => {
    if (!t.length) { setLoading(false); return; }
    setLoading(true);
    try {
      const fetched = await fetchRates(t);
      const map = new Map<string, Rate>();
      fetched.forEach(r => map.set(r.symbol, r));
      setRates(map);
      setLastUpdate(new Date());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = getTickers();
    setTickers(t);
    loadRates(t);
    // Refresh every 5 minutes
    const interval = setInterval(() => loadRates(t), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  function persist(t: Ticker[]) { setTickers(t); saveTickers(t); loadRates(t); }

  function add() {
    if (!newSymbol.trim()) return;
    persist([...tickers, { id: Date.now().toString(), symbol: newSymbol.trim().toUpperCase(), type: newType }]);
    setNewSymbol(''); setAdding(false);
  }

  function remove(id: string) { persist(tickers.filter(t => t.id !== id)); }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>Finance</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdate && <span style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>}
          <button onClick={() => loadRates(tickers)} style={{ ...mono, fontSize: 11, color: 'var(--muted)', background: 'none', border: '1px solid var(--rule)', padding: '2px 7px', cursor: 'pointer', borderRadius: 3 }}>
            {loading ? '...' : 'Refresh'}
          </button>
          <button onClick={() => setAdding(true)} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3 }}>+ Add</button>
        </div>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: 12, background: 'var(--ink3)', border: '1px solid var(--rule)', borderRadius: 4 }}>
          <select value={newType} onChange={e => setNewType(e.target.value as Ticker['type'])} style={{ marginBottom: 6 }}>
            <option value="fx">FX pair (e.g. GBP/EUR)</option>
            <option value="crypto">Crypto (e.g. BTC)</option>
          </select>
          <input type="text" value={newSymbol} onChange={e => setNewSymbol(e.target.value)}
            placeholder={newType === 'fx' ? 'GBP/USD' : 'BTC'}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }}
            autoFocus style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={add} style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
          </div>
          <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.06em' }}>
            FX: frankfurter.app · Crypto: CoinGecko · No API keys needed
          </div>
        </div>
      )}

      {tickers.length === 0 && !adding && (
        <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No tickers — add FX pairs or crypto</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tickers.map(ticker => {
          const rate = rates.get(ticker.symbol);
          return <TickerRow key={ticker.id} ticker={ticker} rate={rate} loading={loading} onRemove={remove} />;
        })}
      </div>
    </div>
  );
}

function TickerRow({ ticker, rate, loading, onRemove }: {
  ticker: Ticker; rate?: Rate; loading: boolean; onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };
  const change = rate?.change24h;
  const changeColor = !change ? 'var(--muted)' : change > 0 ? '#5a9e7c' : '#c25c5c';

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--rule)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ ...mono, fontSize: 12, color: 'var(--paper)', letterSpacing: '0.04em', fontWeight: 400 }}>{ticker.symbol}</div>
        <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>{ticker.type}</div>
      </div>
      {loading ? (
        <div className="skeleton" style={{ width: 60, height: 14 }} />
      ) : rate ? (
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...mono, fontSize: 13, color: 'var(--paper)', fontWeight: 500, letterSpacing: '0.02em' }}>
            {ticker.type === 'crypto' ? '£' : ''}{fmt(rate.price, ticker.symbol)}
          </div>
          {change !== undefined && (
            <div style={{ ...mono, fontSize: 11, color: changeColor, letterSpacing: '0.04em' }}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
          )}
        </div>
      ) : (
        <span style={{ ...mono, fontSize: 11, color: 'var(--dim)' }}>—</span>
      )}
      <button onClick={() => onRemove(ticker.id)}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
    </div>
  );
}
