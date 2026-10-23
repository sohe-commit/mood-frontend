'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const FACES = ['😢', '🙁', '😐', '🙂', '😄'];
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

type Mood = { date: string; mood: number; note: string };

const pad = (n: number) => String(n).padStart(2, '0');
// 로컬 시간 기준 오늘 날짜 (YYYY-MM-DD)
const todayStr = () => new Date().toLocaleDateString('sv-SE');

export default function Home() {
  const [ym, setYm] = useState(() => todayStr().slice(0, 7)); // 보고 있는 달 'YYYY-MM'
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selected, setSelected] = useState(todayStr());
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState('');

  const [year, month] = ym.split('-').map(Number);
  const byDate = new Map(moods.map((m) => [m.date, m]));

  async function load() {
    const list: Mood[] = await fetch(`${API}/moods?month=${ym}`).then((r) => r.json());
    setMoods(list);
  }

  useEffect(() => {
    load();
  }, [ym]);

  // 날짜를 고르면 그 날의 기록을 입력창에 채운다
  useEffect(() => {
    const m = byDate.get(selected);
    setMood(m?.mood ?? 0);
    setNote(m?.note ?? '');
  }, [selected, moods]);

  function moveMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYm(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }

  async function save() {
    if (!mood) return;
    await fetch(`${API}/moods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selected, mood, note }),
    });
    load();
  }

  const firstDow = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];

  const avg = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0;

  return (
    <main>
      <h1>오늘 기분 기록기</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => moveMonth(-1)}>◀</button>
        <strong>
          {year}년 {month}월
        </strong>
        <button onClick={() => moveMonth(1)}>▶</button>
      </div>
      <p style={{ textAlign: 'center', color: '#666', margin: '4px 0 12px' }}>
        기록 {moods.length}일{moods.length > 0 && ` · 평균 ${FACES[Math.round(avg) - 1]} ${avg.toFixed(1)}`}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {DOW.map((d) => (
          <div key={d} style={{ color: '#888', fontSize: 12 }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = `${ym}-${pad(day)}`;
          const m = byDate.get(date);
          return (
            <button
              key={i}
              onClick={() => setSelected(date)}
              title={m?.note}
              style={{
                aspectRatio: '1',
                cursor: 'pointer',
                borderRadius: 8,
                border: selected === date ? '2px solid #333' : '1px solid #ddd',
                background: date === todayStr() ? '#fff7d6' : '#fff',
                padding: 0,
              }}
            >
              <div style={{ fontSize: 11, color: '#888' }}>{day}</div>
              <div style={{ fontSize: 20 }}>{m ? FACES[m.mood - 1] : ''}</div>
            </button>
          );
        })}
      </div>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>
        {selected}
        {selected === todayStr() && ' (오늘)'}
      </h2>
      <div style={{ display: 'flex', gap: 8 }}>
        {FACES.map((f, i) => (
          <button
            key={f}
            onClick={() => setMood(i + 1)}
            style={{
              fontSize: 32,
              padding: 6,
              cursor: 'pointer',
              border: mood === i + 1 ? '2px solid #333' : '2px solid transparent',
              borderRadius: 12,
              background: 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
        placeholder="한 줄 메모 (선택)"
        style={{ width: '100%', margin: '12px 0', padding: 8, boxSizing: 'border-box' }}
      />
      <button onClick={save} disabled={!mood} style={{ padding: '8px 16px' }}>
        저장
      </button>
    </main>
  );
}
