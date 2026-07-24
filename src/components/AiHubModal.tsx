import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  HelpCircle, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';

interface AiHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  defaultTab?: 'chat' | 'faq' | 'performance' | 'attendance' | 'courses' | 'timetable';
}

export default function AiHubModal({ isOpen, onClose, user, defaultTab = 'chat' }: AiHubModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'performance' | 'attendance' | 'courses' | 'timetable'>(defaultTab);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `Hello ${user?.name || 'Student'}! I am Nova, your Smart Campus AI Assistant. How can I assist you today with courses, fees, timetables, or academic queries?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // FAQ state
  const [faqCategory, setFaqCategory] = useState('general');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqResult, setFaqResult] = useState<any>(null);
  const [isFaqLoading, setIsFaqLoading] = useState(false);

  // Performance Analysis State
  const [perfGpa, setPerfGpa] = useState(user?.gpa || 3.6);
  const [perfAttendance, setPerfAttendance] = useState(84);
  const [perfAssignment, setPerfAssignment] = useState(88);
  const [perfResult, setPerfResult] = useState<any>(null);
  const [isPerfLoading, setIsPerfLoading] = useState(false);

  // Attendance Prediction State
  const [attCurrent, setAttCurrent] = useState(78);
  const [attAttended, setAttAttended] = useState(28);
  const [attTotal, setAttTotal] = useState(36);
  const [attResult, setAttResult] = useState<any>(null);
  const [isAttLoading, setIsAttLoading] = useState(false);

  // Course Recommendation State
  const [recDepartment, setRecDepartment] = useState('Computer Science');
  const [recInterests, setRecInterests] = useState('Machine Learning, Fullstack, Cloud Security');
  const [recResult, setRecResult] = useState<any>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  // Timetable Generator State
  const [ttCourses, setTtCourses] = useState('CS101, CS102, MATH201, ENG101');
  const [ttPref, setTtPref] = useState('Avoid 8 AM slots, lunch break between 12-1 PM');
  const [ttResult, setTtResult] = useState<any>(null);
  const [isTtLoading, setIsTtLoading] = useState(false);

  if (!isOpen) return null;

  // Handlers
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res: any = await apiClient.post('/ai/chat', {
        message: userMsg,
        history: chatMessages.slice(-6)
      });
      setChatMessages(prev => [...prev, { sender: 'bot', text: res.reply || 'No answer generated.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `AI Service Error: ${err.message || 'Failed to connect to AI server.'}`, time }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRunFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || isFaqLoading) return;
    setIsFaqLoading(true);
    try {
      const res = await apiClient.post('/ai/faq-assistant', {
        question: faqQuestion,
        category: faqCategory
      });
      setFaqResult(res);
    } catch (err: any) {
      alert(`FAQ lookup failed: ${err.message}`);
    } finally {
      setIsFaqLoading(false);
    }
  };

  const handleRunPerformance = async () => {
    setIsPerfLoading(true);
    try {
      const res = await apiClient.post('/ai/analyze-performance', {
        studentName: user?.name || 'Student',
        gpa: perfGpa,
        attendancePct: perfAttendance,
        assignmentAvg: perfAssignment,
        examScores: [85, 90, 82]
      });
      setPerfResult(res);
    } catch (err: any) {
      alert(`Performance analysis failed: ${err.message}`);
    } finally {
      setIsPerfLoading(false);
    }
  };

  const handleRunAttendance = async () => {
    setIsAttLoading(true);
    try {
      const res = await apiClient.post('/ai/predict-attendance', {
        currentPct: attCurrent,
        classesAttended: attAttended,
        totalClasses: attTotal,
        totalUpcoming: 15
      });
      setAttResult(res);
    } catch (err: any) {
      alert(`Attendance prediction failed: ${err.message}`);
    } finally {
      setIsAttLoading(false);
    }
  };

  const handleRunCourseRec = async () => {
    setIsRecLoading(true);
    try {
      const res = await apiClient.post('/ai/recommend-courses', {
        studentName: user?.name || 'Student',
        department: recDepartment,
        gpa: user?.gpa || 3.7,
        interests: recInterests
      });
      setRecResult(res);
    } catch (err: any) {
      alert(`Course recommendation failed: ${err.message}`);
    } finally {
      setIsRecLoading(false);
    }
  };

  const handleRunTimetable = async () => {
    setIsTtLoading(true);
    try {
      const courseList = ttCourses.split(',').map(c => c.trim()).filter(Boolean);
      const res = await apiClient.post('/ai/generate-timetable', {
        courses: courseList,
        preferences: ttPref
      });
      setTtResult(res);
    } catch (err: any) {
      alert(`Timetable generation failed: ${err.message}`);
    } finally {
      setIsTtLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-white w-full max-w-4xl h-[88vh] rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-4 px-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg tracking-tight">Smart Campus AI Hub</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-mono font-semibold text-indigo-200 uppercase">
                  Powered by Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">Contextual intelligence & automated decision engine for students, faculty & staff.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bot size={14} /> AI Campus Chatbot
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'faq' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <HelpCircle size={14} /> AI FAQ Assistant
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'performance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp size={14} /> Performance Analysis
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle size={14} /> Attendance Guardian
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen size={14} /> Course Advisory
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'timetable' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar size={14} /> Timetable Generator
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* 1. CHATBOT */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
                      Nova is thinking...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-slate-200 shrink-0">
                <input
                  type="text"
                  placeholder="Ask Nova about fees, courses, timetables, or campus policies..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-600 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </div>
          )}

          {/* 2. FAQ ASSISTANT */}
          {activeTab === 'faq' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-800">Campus FAQ Search</h4>
                <p className="text-xs text-slate-500">Instant answers regarding institutional regulations, clearance, and administration.</p>
              </div>

              <form onSubmit={handleRunFaq} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Domain Category</label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-slate-50 font-medium"
                  >
                    <option value="general">General Campus Regulations</option>
                    <option value="fees">Fee Structures & Clearance</option>
                    <option value="exams">Examination & Grading Policies</option>
                    <option value="hostel">Hostel & Housing Guidelines</option>
                    <option value="library">Library Digital System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Enter Your Inquiry</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the fine procedure for late tuition payments?"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isFaqLoading || !faqQuestion.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isFaqLoading ? <Zap size={14} className="animate-spin" /> : <Brain size={14} />}
                  Get AI Answer
                </button>
              </form>

              {faqResult && (
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <Sparkles size={14} /> Official Guidance Answer
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {faqResult.confidence}% AI Confidence
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {faqResult.answer}
                  </p>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/80 text-xs">
                    <span className="font-bold text-indigo-900 block mb-0.5">Recommended Action:</span>
                    <span className="text-indigo-700">{faqResult.actionableStep}</span>
                  </div>

                  {faqResult.relatedTopics && (
                    <div className="pt-2 flex flex-wrap gap-1.5 items-center text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Related Topics:</span>
                      {faqResult.relatedTopics.map((topic: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. PERFORMANCE ANALYSIS */}
          {activeTab === 'performance' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-800">AI Academic Diagnostics</h4>
                <p className="text-xs text-slate-500">Evaluates GPA trajectories, risk indicators, and tailored learning paths.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Current GPA</label>
                    <input 
                      type="number" step="0.1" min="0" max="4.0"
                      value={perfGpa}
                      onChange={(e) => setPerfGpa(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Attendance %</label>
                    <input 
                      type="number" min="0" max="100"
                      value={perfAttendance}
                      onChange={(e) => setPerfAttendance(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Assignment Score %</label>
                    <input 
                      type="number" min="0" max="100"
                      value={perfAssignment}
                      onChange={(e) => setPerfAssignment(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunPerformance}
                  disabled={isPerfLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isPerfLoading ? <Zap size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                  Run Academic Diagnostics
                </button>
              </div>

              {perfResult && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Academic Status</span>
                      <h4 className="text-base font-bold text-slate-800">{perfResult.riskStatus}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Predicted Semester GPA</span>
                      <div className="text-xl font-bold font-mono text-indigo-600">{perfResult.predictedSemesterGPA}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Trend Analysis:</span> {perfResult.gpaTrend}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                        <CheckCircle2 size={13} /> Strengths
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-900 text-[11px]">
                        {perfResult.keyStrengths?.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                        <AlertTriangle size={13} /> Focus Areas
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-900 text-[11px]">
                        {perfResult.weakAreas?.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                    <span className="font-bold text-indigo-900 block mb-1">Recommended Action Plan:</span>
                    <ul className="space-y-1 text-indigo-800">
                      {perfResult.actionPlan?.map((plan: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <ArrowRight size={12} className="text-indigo-600 shrink-0" />
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ATTENDANCE GUARDIAN */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-800">AI Attendance Risk Guardian</h4>
                <p className="text-xs text-slate-500">Predicts end-of-term attendance percentage and flags exam eligibility risks.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Classes Attended</label>
                    <input 
                      type="number"
                      value={attAttended}
                      onChange={(e) => setAttAttended(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Total Conducted</label>
                    <input 
                      type="number"
                      value={attTotal}
                      onChange={(e) => setAttTotal(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Current Rate (%)</label>
                    <div className="mt-1 px-3 py-1.5 bg-slate-100 rounded-xl font-mono text-slate-800 font-bold text-center">
                      {Math.round((attAttended / (attTotal || 1)) * 100)}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunAttendance}
                  disabled={isAttLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isAttLoading ? <Zap size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Predict Semester Trajectory
                </button>
              </div>

              {attResult && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Attendance Health Status</span>
                      <div className={`text-base font-bold capitalize ${
                        attResult.status === 'Safe' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {attResult.status} Status
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Predicted Final %</span>
                      <div className="text-xl font-bold font-mono text-indigo-600">{attResult.predictedEndPct}%</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    {attResult.guidance}
                  </p>

                  {attResult.minClassesToAttendToReach75 > 0 && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                      Must attend next {attResult.minClassesToAttendToReach75} consecutive lectures without missing to recover threshold.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. COURSE RECOMMENDATION */}
          {activeTab === 'courses' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-800">AI Elective Course Advisor</h4>
                <p className="text-xs text-slate-500">Recommends electives tailored to career trajectories and student academic profile.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Department</label>
                  <input
                    type="text"
                    value={recDepartment}
                    onChange={(e) => setRecDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Technical Interests & Goals</label>
                  <input
                    type="text"
                    value={recInterests}
                    onChange={(e) => setRecInterests(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleRunCourseRec}
                  disabled={isRecLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isRecLoading ? <Zap size={14} className="animate-spin" /> : <Award size={14} />}
                  Generate Recommended Electives
                </button>
              </div>

              {recResult && recResult.recommendations && (
                <div className="space-y-3 animate-fade-in">
                  {recResult.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600 text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                          {rec.courseCode}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rec.relevanceScore}% Match
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">{rec.courseName}</h5>
                      <p className="text-xs text-slate-600">{rec.matchReason}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Career Impact: <strong className="text-slate-700">{rec.careerImpact}</strong></span>
                        <span className="text-emerald-600 font-semibold">{rec.prerequisiteCheck}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. TIMETABLE GENERATOR */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-slate-800">AI Timetable Scheduler</h4>
                <p className="text-xs text-slate-500">Auto-generates clash-free schedules respecting faculty and lab constraints.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Course Codes (comma-separated)</label>
                  <input
                    type="text"
                    value={ttCourses}
                    onChange={(e) => setTtCourses(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduling Preferences / Constraints</label>
                  <input
                    type="text"
                    value={ttPref}
                    onChange={(e) => setTtPref(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleRunTimetable}
                  disabled={isTtLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isTtLoading ? <Zap size={14} className="animate-spin" /> : <Calendar size={14} />}
                  Generate Conflict-Free Schedule
                </button>
              </div>

              {ttResult && ttResult.schedule && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-4">Day</th>
                        <th className="py-2.5 px-4">Time Slot</th>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Instructor</th>
                        <th className="py-2.5 px-4">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ttResult.schedule.map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-700">{s.day}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{s.timeSlot}</td>
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-slate-800">{s.courseName}</span>
                            <span className="block text-[10px] text-indigo-600 font-mono">{s.courseCode} ({s.type})</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">{s.facultyName}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{s.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
