'use client'

import { useState, useRef, useCallback } from 'react'

interface RoastResult {
  score: number
  scoreLabel: string
  roastOpening: string
  categories: {
    format: number
    content: number
    impact: number
    ats: number
    relevance: number
  }
  issues: Array<{
    severity: 'fatal' | 'major' | 'minor'
    title: string
    roast: string
    fix: string
  }>
  strengths: string[]
  topFix: string
  verdict: string
}

const severityConfig = {
  fatal: { label: 'FATAL', color: '#ff4d00', bg: 'rgba(255,77,0,0.08)', icon: '💀' },
  major: { label: 'MAJOR', color: '#ff8c00', bg: 'rgba(255,140,0,0.08)', icon: '⚠️' },
  minor: { label: 'MINOR', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', icon: '📌' },
}

const categoryLabels: Record<string, string> = {
  format: 'Format & Desain',
  content: 'Konten & Bahasa',
  impact: 'Impact & Achievement',
  ats: 'ATS Friendly',
  relevance: 'Relevansi',
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s <= 30) return '#ff4d00'
    if (s <= 50) return '#ff8c00'
    if (s <= 70) return '#fbbf24'
    if (s <= 85) return '#4ade80'
    return '#22d3ee'
  }
  const color = getColor(score)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ textAlign: 'center', animation: 'scoreCount 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="#1f1a30" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{score}</div>
          <div style={{ fontSize: 11, color: '#7a6d8f', fontWeight: 600, letterSpacing: '0.08em' }}>/100</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s <= 40) return '#ff4d00'
    if (s <= 60) return '#ff8c00'
    if (s <= 75) return '#fbbf24'
    return '#4ade80'
  }
  const color = getColor(score)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#7a6d8f', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 6, background: '#1f1a30', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          width: `${score}%`,
          transition: 'width 1.5s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 0 8px ${color}66`
        }} />
      </div>
    </div>
  )
}

export default function Home() {
  const [cvText, setCvText] = useState('')
  const [jobTarget, setJobTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCvText(text.slice(0, 8000))
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRoast = async () => {
    if (!cvText.trim()) { setError('Paste CV lo dulu atau upload file-nya!'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobTarget }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi error. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#09070f', minHeight: '100vh', fontFamily: 'Syne, sans-serif', color: '#f2eaf8' }}>

      {/* BG atmosphere */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 50% at 80% 0%, rgba(255,77,0,0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(155,61,232,0.08) 0%, transparent 55%)'
      }} />

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <div style={{ paddingTop: 56, paddingBottom: 48, textAlign: 'center' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)',
            borderRadius: 100, padding: '6px 18px', marginBottom: 24,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#ff8c00', animation: 'fadeUp 0.6s ease both'
          }}>
            🔥 AI CV Reviewer
          </div>

          <h1 style={{
            fontFamily: 'Instrument Serif, serif', fontWeight: 400,
            fontSize: 'clamp(2.4rem, 9vw, 3.4rem)', lineHeight: 1.1,
            marginBottom: 16, animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0,
            animationFillMode: 'forwards'
          }}>
            CV lo layak<br />
            <em style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #ff4d00, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              di-roast nggak?
            </em>
          </h1>

          <p style={{ fontSize: 16, color: '#7a6d8f', lineHeight: 1.65, marginBottom: 40, animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            Upload CV lo, AI kasih <strong style={{ color: '#f2eaf8' }}>roast jujur + skor + feedback actionable</strong> buat ningkatin peluang lo dipanggil interview.
          </p>

          {/* INPUT FORM */}
          <div style={{ animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0, animationFillMode: 'forwards' }}>

            {/* Job target */}
            <input
              value={jobTarget}
              onChange={e => setJobTarget(e.target.value)}
              placeholder="Target posisi? (opsional — cth: Software Engineer, Marketing)"
              style={{
                width: '100%', background: '#110e1c', border: '1px solid #1f1a30',
                borderRadius: 12, padding: '14px 18px', color: '#f2eaf8', fontSize: 14,
                fontFamily: 'Syne, sans-serif', marginBottom: 12, outline: 'none',
              }}
            />

            {/* Drop zone / paste */}
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{ marginBottom: 12, padding: '28px 24px', cursor: 'pointer', textAlign: 'center',
                background: dragOver ? 'rgba(255,77,0,0.04)' : 'transparent'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f2eaf8', marginBottom: 4 }}>
                {fileName || 'Drag & drop CV lo di sini'}
              </div>
              <div style={{ fontSize: 12, color: '#3d3452' }}>
                {fileName ? '✓ File berhasil diload' : 'atau klik untuk upload · .txt, .pdf (text), .doc'}
              </div>
              <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#3d3452', marginBottom: 12 }}>— atau —</div>

            {/* Paste text */}
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              placeholder="Paste isi CV lo langsung di sini..."
              rows={6}
              style={{
                width: '100%', background: '#110e1c', border: '1px solid #1f1a30',
                borderRadius: 14, padding: '16px 18px', color: '#f2eaf8', fontSize: 13,
                fontFamily: 'Syne, sans-serif', resize: 'vertical', outline: 'none',
                marginBottom: 16, lineHeight: 1.6
              }}
            />

            {error && (
              <div style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ff8c00', marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleRoast}
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#1f1a30' : 'linear-gradient(135deg, #ff4d00, #ff8c00)',
                border: 'none', borderRadius: 14, color: 'white', fontSize: 16,
                fontWeight: 800, padding: '18px 24px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em',
                boxShadow: loading ? 'none' : '0 8px 30px rgba(255,77,0,0.35)',
                transition: 'all 0.25s', textShadow: '0 1px 4px rgba(0,0,0,0.4)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span>AI lagi baca CV lo...</span>
                </span>
              ) : '🔥 Roast CV Gue Sekarang'}
            </button>

            <p style={{ fontSize: 12, color: '#3d3452', marginTop: 12, textAlign: 'center' }}>
              🔒 CV lo tidak disimpan di server manapun
            </p>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div ref={resultRef} style={{ paddingBottom: 80 }}>

            {/* Score header */}
            <div style={{
              background: '#110e1c', border: '1px solid #1f1a30', borderRadius: 24,
              padding: '32px 28px', marginBottom: 16, textAlign: 'center',
              animation: 'fadeUp 0.6s ease both'
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d3452', marginBottom: 20 }}>
                🔥 HASIL ROAST CV LO
              </div>
              <ScoreCircle score={result.score} label={result.scoreLabel} />
              <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,77,0,0.06)', borderRadius: 14, border: '1px solid rgba(255,77,0,0.15)' }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#f2eaf8', fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
                  "{result.roastOpening}"
                </p>
              </div>
            </div>

            {/* Category scores */}
            <div style={{ background: '#110e1c', border: '1px solid #1f1a30', borderRadius: 20, padding: '24px 24px', marginBottom: 16, animation: 'fadeUp 0.6s 0.1s ease both' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d3452', marginBottom: 18 }}>📊 Breakdown Skor</div>
              {Object.entries(result.categories).map(([key, val]) => (
                <CategoryBar key={key} label={categoryLabels[key]} score={val} />
              ))}
            </div>

            {/* Issues */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d3452', marginBottom: 12 }}>💀 Yang Perlu Lo Fix</div>
              {result.issues.map((issue, i) => {
                const cfg = severityConfig[issue.severity]
                return (
                  <div key={i} style={{
                    background: cfg.bg, border: `1px solid ${cfg.color}33`,
                    borderLeft: `3px solid ${cfg.color}`, borderRadius: 14,
                    padding: '16px 18px', marginBottom: 10,
                    animation: `fadeUp 0.5s ${0.1 * i}s ease both`, opacity: 0, animationFillMode: 'forwards'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cfg.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f2eaf8' }}>{issue.title}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#7a6d8f', marginBottom: 10, lineHeight: 1.6, fontStyle: 'italic' }}>"{issue.roast}"</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: 6, padding: '2px 8px', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>FIX</span>
                      <p style={{ fontSize: 13, color: '#a0e0b8', lineHeight: 1.6 }}>{issue.fix}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div style={{ background: '#110e1c', border: '1px solid #1f1a30', borderRadius: 20, padding: '24px', marginBottom: 16, animation: 'fadeUp 0.6s 0.3s ease both' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d3452', marginBottom: 14 }}>✅ Yang Udah Bagus</div>
                {result.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: '#4ade80', fontSize: 14, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#7a6d8f', lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top fix + verdict */}
            <div style={{ background: 'rgba(255,77,0,0.06)', border: '1px solid rgba(255,77,0,0.2)', borderRadius: 20, padding: '24px', marginBottom: 16, animation: 'fadeUp 0.6s 0.4s ease both' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff8c00', marginBottom: 10 }}>⚡ PRIORITAS UTAMA</div>
              <p style={{ fontSize: 14, color: '#f2eaf8', lineHeight: 1.7, fontWeight: 600 }}>{result.topFix}</p>
            </div>

            <div style={{ background: '#110e1c', border: '1px solid #1f1a30', borderRadius: 20, padding: '24px', animation: 'fadeUp 0.6s 0.5s ease both' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d3452', marginBottom: 12 }}>📝 VERDICT</div>
              <p style={{ fontSize: 15, color: '#7a6d8f', lineHeight: 1.8, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{result.verdict}</p>
            </div>

            {/* CTA retry */}
            <button
              onClick={() => { setResult(null); setCvText(''); setFileName(''); setJobTarget(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                display: 'block', width: '100%', marginTop: 24,
                background: 'transparent', border: '1px solid #1f1a30',
                borderRadius: 14, color: '#7a6d8f', fontSize: 14,
                fontWeight: 600, padding: '14px', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', transition: 'all 0.2s'
              }}
            >
              🔄 Roast CV Lain
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
