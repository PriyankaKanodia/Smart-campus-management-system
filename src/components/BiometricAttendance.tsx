import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Scan, CreditCard, CheckCircle2, AlertCircle, Camera, RefreshCw, Download, ShieldCheck, UserCheck, Clock, Layers } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  method: 'QR Code' | 'Face Recognition' | 'RFID Card';
  time: string;
  status: 'Present' | 'Late' | 'Verified';
  confidence?: string;
}

export default function BiometricAttendance() {
  const [activeTab, setActiveTab] = useState<'qr' | 'face' | 'rfid'>('qr');
  const [logs, setLogs] = useState<AttendanceRecord[]>([
    { id: '1', studentId: 'STU101', studentName: 'Alex Rivera', course: 'CSE-301 (AI)', method: 'Face Recognition', time: '09:02 AM', status: 'Present', confidence: '99.2%' },
    { id: '2', studentId: 'STU102', studentName: 'Sophia Chen', course: 'CSE-301 (AI)', method: 'QR Code', time: '09:05 AM', status: 'Present', confidence: '100%' },
    { id: '3', studentId: 'STU103', studentName: 'Marcus Vance', course: 'CSE-301 (AI)', method: 'RFID Card', time: '09:12 AM', status: 'Late', confidence: '100%' }
  ]);

  // QR State
  const [qrToken, setQrToken] = useState('CAMPUS-LECTURE-CSE301-89321');
  const [qrStatus, setQrStatus] = useState<string | null>(null);

  // Face Recognition State
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceMatch, setFaceMatch] = useState<{ name: string; score: string; id: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // RFID State
  const [rfidCardId, setRfidCardId] = useState('');
  const [rfidSuccess, setRfidSuccess] = useState<string | null>(null);

  // Regenerate QR Code token periodically
  const refreshQrToken = () => {
    const newToken = 'CAMPUS-LECTURE-CSE301-' + Math.floor(10000 + Math.random() * 90000);
    setQrToken(newToken);
    setQrStatus('New secure dynamic QR generated (Valid for 30s)');
    setTimeout(() => setQrStatus(null), 3000);
  };

  // Trigger simulated Camera or real video stream if available
  const startFaceRecognition = async () => {
    setIsScanningFace(true);
    setFaceMatch(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      console.log('Camera permission fallback to simulated AI stream');
    }

    setTimeout(() => {
      const detected = {
        name: 'Alex Rivera',
        id: 'STU101',
        score: '98.7%'
      };
      setFaceMatch(detected);
      setIsScanningFace(false);

      // Add to logs
      const newRec: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: detected.id,
        studentName: detected.name,
        course: 'CSE-301 Artificial Intelligence',
        method: 'Face Recognition',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Present',
        confidence: detected.score
      };
      setLogs((prev) => [newRec, ...prev]);
    }, 2500);
  };

  const handleRfidScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidCardId.trim()) return;

    const newRec: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: 'STU-' + rfidCardId.substring(0, 4).toUpperCase(),
      studentName: 'Student #' + rfidCardId.slice(-3),
      course: 'ECE-204 Embedded Systems',
      method: 'RFID Card',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      confidence: '100%'
    };

    setLogs((prev) => [newRec, ...prev]);
    setRfidSuccess(`RFID Card [${rfidCardId}] authenticated successfully!`);
    setRfidCardId('');
    setTimeout(() => setRfidSuccess(null), 4000);
  };

  const exportAttendanceCSV = () => {
    const csvHeader = 'ID,Student ID,Name,Course,Method,Time,Status,Confidence\n';
    const csvRows = logs.map((l) => `${l.id},${l.studentId},${l.studentName},${l.course},${l.method},${l.time},${l.status},${l.confidence || '100%'}`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" /> Automated Campus Gateways
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Biometric & Smart Attendance Suite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-modal verification using dynamic QR, AI Face Recognition, and RFID Smart Cards.
          </p>
        </div>
        <button
          onClick={exportAttendanceCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Download className="w-4 h-4" /> Export Audit Log (.CSV)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'qr'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" /> Dynamic QR Code
        </button>
        <button
          onClick={() => setActiveTab('face')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'face'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Scan className="w-4 h-4" /> AI Face Recognition
        </button>
        <button
          onClick={() => setActiveTab('rfid')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'rfid'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" /> RFID Smart Card
        </button>
      </div>

      {/* Active Mode Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interface Box */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          {activeTab === 'qr' && (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Classroom QR Check-In</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Display this token on the projector. Students scan from their mobile app to register presence.
                </p>
              </div>

              {/* Simulated QR Code Canvas Visual */}
              <div className="relative w-64 h-64 mx-auto bg-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center border-4 border-indigo-500/30 shadow-xl">
                <div className="grid grid-cols-8 gap-1 w-full h-full p-2 bg-white rounded-xl">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        (i * 7 + qrToken.length) % 3 === 0 ? 'bg-slate-900' : (i + 2) % 5 === 0 ? 'bg-indigo-600' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-indigo-600 text-white font-bold text-xs px-2 py-1 rounded shadow">
                    CAMPUS QR
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Token: {qrToken}
                </div>
                {qrStatus && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {qrStatus}
                  </p>
                )}
                <div>
                  <button
                    onClick={refreshQrToken}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh QR Code Token
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'face' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Biometric Face Recognition</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Neural facial mesh scanning for zero-touch gate and classroom access.
                  </p>
                </div>
                <button
                  onClick={startFaceRecognition}
                  disabled={isScanningFace}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> {isScanningFace ? 'Scanning Neural Features...' : 'Scan Face Now'}
                </button>
              </div>

              {/* Scanner Screen Box */}
              <div className="relative w-full h-72 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60" />

                {/* Facial Mesh HUD Overlay */}
                <div className="absolute inset-0 border-2 border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-center text-xs font-mono text-indigo-400">
                    <span>SYSTEM: AI-FACIAL-ENGINE-v4</span>
                    <span>FPS: 60 | CONF: 98.7%</span>
                  </div>

                  {/* Bounding Box */}
                  <div className="relative w-40 h-40 mx-auto border-2 border-dashed border-indigo-400/80 rounded-2xl flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-indigo-400 absolute top-0 left-0"></div>
                    <div className="w-3 h-3 border-t-2 border-r-2 border-indigo-400 absolute top-0 right-0"></div>
                    <div className="w-3 h-3 border-b-2 border-l-2 border-indigo-400 absolute bottom-0 left-0"></div>
                    <div className="w-3 h-3 border-b-2 border-r-2 border-indigo-400 absolute bottom-0 right-0"></div>
                    {isScanningFace && (
                      <span className="text-xs font-mono text-indigo-300 animate-bounce">Analyzing...</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono text-indigo-400">
                    <span>GRID_POINTS: 468 LANDMARKS</span>
                    <span>LIVENESS: VERIFIED</span>
                  </div>
                </div>
              </div>

              {faceMatch && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-full text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{faceMatch.name} ({faceMatch.id})</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Biometric Match Verified with {faceMatch.score} confidence.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/80 px-2.5 py-1 rounded-md">
                    PRESENT
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rfid' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">RFID / NFC Card Reader Terminal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tap physical student ID card on USB/NFC terminal or enter Card Serial Number below.
                </p>
              </div>

              <form onSubmit={handleRfidScan} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    RFID Card Serial / Badge Identifier
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rfidCardId}
                      onChange={(e) => setRfidCardId(e.target.value)}
                      placeholder="e.g. 8492-3021-9981"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    Simulate Card Tap
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfidCardId(`CARD-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Generate Random Card
                  </button>
                </div>
              </form>

              {rfidSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {rfidSuccess}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Attendance Audit Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Live Verification Logs
            </h3>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-medium">
              {logs.length} Logged
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">{log.studentName}</span>
                  <span className="text-slate-400 font-mono">{log.time}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{log.course}</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.method}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 font-mono">ID: {log.studentId}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    {log.status} ({log.confidence})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
