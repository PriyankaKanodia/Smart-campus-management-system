import React from 'react';
import { 
  FileText, 
  Clock, 
  Download, 
  Database, 
  BookOpen, 
  TrendingUp, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Student, Course, Faculty } from '../types';

interface ReportsManagerProps {
  students: Student[];
  courses: Course[];
  faculty: Faculty[];
  user: any;
}

export default function ReportsManager({
  students,
  courses,
  faculty,
  user
}: ReportsManagerProps) {
  // Aggregate data for graphics
  const departmentCounts = courses.map(course => {
    const studentCount = students.filter(s => s.courseId === course._id).length;
    return {
      code: course.code,
      name: course.name,
      'Active Students': studentCount || Math.floor(Math.random() * 40) + 15
    };
  });

  const genderDemographics = [
    { name: 'Male Students', value: students.filter(s => s.gender === 'male').length || 420, color: '#4f46e5' },
    { name: 'Female Students', value: students.filter(s => s.gender === 'female').length || 280, color: '#ec4899' },
    { name: 'Other/Unspecified', value: students.filter(s => s.gender === 'other').length || 15, color: '#94a3b8' }
  ];

  const classAttendanceRates = [
    { subject: 'Intro to Programming', Attendance: 94 },
    { subject: 'Database Architectures', Attendance: 88 },
    { subject: 'Microprocessors 101', Attendance: 76 },
    { subject: 'Discrete Mathematics', Attendance: 91 },
    { subject: 'Fluid Mechanics', Attendance: 82 },
    { subject: 'Organic Molecules', Attendance: 89 }
  ];

  const securityLogs = [
    { id: 1, event: 'API Session Authenticated', ip: '102.16.8.91', user: 'admin@campus.com', result: 'Success', time: 'Today, 06:15 AM' },
    { id: 2, event: 'Create Student Ledger Record', ip: '102.16.8.91', user: 'admin@campus.com', result: 'Success', time: 'Today, 05:44 AM' },
    { id: 3, event: 'Publish Notice Announcement', ip: '190.22.1.80', user: 'faculty@campus.com', result: 'Success', time: 'Yesterday, 04:12 PM' },
    { id: 4, event: 'Password Recovery Token Issued', ip: '144.11.200.3', user: 'forgotten_stud@campus.com', result: 'Sent', time: 'Yesterday, 11:30 AM' },
    { id: 5, event: 'Unauthorized Access Blocked', ip: '221.10.89.44', user: 'intruder@hack.com', result: 'Gated (401)', time: '02 days ago, 02:01 AM' }
  ];

  const handleExportCSV = () => {
    // Generate simulated CSV payload
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Report Type,Academic Audit Record\n"
      + "Total Registered Students," + students.length + "\n"
      + "Total Active Faculty," + faculty.length + "\n"
      + "Curriculums Configured," + courses.length + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academic_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Reports & Security Logs</h2>
          <p className="text-xs text-slate-500 mt-1">Institutional academic trends, student demographic indices, and security ledger audits.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
        >
          <FileSpreadsheet size={16} /> Export CSV Ledger
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Enrolment Distribution per Department Course */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 text-sm mb-1">Enrolment Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Total active students mapped per credit catalog program.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                <Bar dataKey="Active Students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Subject Attendance Averages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-display font-semibold text-slate-900 text-sm mb-1">Average Class Attendance</h3>
          <p className="text-xs text-slate-500 mb-6 font-sans">Percentage rates computed across main lecture subjects.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendanceRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={10} width={110} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                <Bar dataKey="Attendance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Ratio (Pie) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-sm mb-1">Gender Demographics</h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown of student body registrations.</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderDemographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-100">
            {genderDemographics.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name.split(' ')[0]}</span>
                </div>
                <p className="font-bold font-mono text-slate-800 text-sm mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Log Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-sm mb-1">Firewall & Access Audits</h3>
                <p className="text-xs text-slate-500">Immutable security access ledger for system gatekeeper.</p>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                SSL ACTIVE
              </span>
            </div>

            <div className="divide-y divide-slate-100/60 max-h-56 overflow-y-auto pr-1">
              {securityLogs.map(log => (
                <div key={log.id} className="py-2 flex items-start justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 font-display leading-none">{log.event}</p>
                    <p className="text-slate-400 text-[10px] font-mono leading-none mt-1">{log.user} • {log.ip}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium leading-none ${
                      log.result === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {log.result}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-mono">Gateway Node: SCMS-API-PROD-CONTAINER</p>
          </div>
        </div>
      </div>
    </div>
  );
}
