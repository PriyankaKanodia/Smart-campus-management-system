import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Radar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Building2,
  Award,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

export default function AnalyticsDashboards() {
  const [activeTab, setActiveTab] = useState<
    'attendance' | 'fees' | 'performance' | 'department' | 'faculty' | 'library' | 'reports'
  >('attendance');

  // --- SEED ANALYTICS DATASETS ---
  const attendanceMonthly = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Computer Science (%)',
        data: [92, 89, 94, 88, 91, 95, 93],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Electrical Engg (%)',
        data: [88, 86, 90, 85, 87, 89, 91],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Business Admin (%)',
        data: [85, 83, 87, 82, 86, 88, 89],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const feeAnalyticsData = {
    labels: ['Tuition Fee', 'Hostel Fee', 'Library Fee', 'Lab Fee', 'Exam Fee'],
    datasets: [
      {
        label: 'Collected ($)',
        data: [450000, 120000, 35000, 80000, 60000],
        backgroundColor: '#10b981'
      },
      {
        label: 'Pending ($)',
        data: [50000, 15000, 5000, 10000, 8000],
        backgroundColor: '#f43f5e'
      }
    ]
  };

  const feeMethodBreakdown = {
    labels: ['Credit Card / Debit', 'Online Banking / UPI', 'Wire Transfer', 'Cash Counter'],
    datasets: [
      {
        data: [45, 35, 15, 5],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      }
    ]
  };

  const studentGpaDistribution = {
    labels: ['3.8 - 4.0 (A+)', '3.5 - 3.7 (A)', '3.0 - 3.4 (B)', '2.5 - 2.9 (C)', '< 2.5 (Risk)'],
    datasets: [
      {
        label: 'Student Count',
        data: [120, 340, 480, 150, 45],
        backgroundColor: ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#f43f5e']
      }
    ]
  };

  const departmentPerformanceData = {
    labels: ['Computer Science', 'Electrical Engg', 'Mechanical Engg', 'Civil Engg', 'Business Admin'],
    datasets: [
      {
        label: 'Avg Student GPA',
        data: [3.65, 3.48, 3.35, 3.28, 3.52],
        backgroundColor: '#6366f1'
      },
      {
        label: 'Research Papers Published',
        data: [28, 19, 14, 11, 22],
        backgroundColor: '#06b6d4'
      }
    ]
  };

  const facultyRadarData = {
    labels: ['Teaching Evaluation', 'Research Output', 'Class Attendance %', 'Punctuality', 'Student Mentorship', 'Course Completion'],
    datasets: [
      {
        label: 'Prof. Turing (CS)',
        data: [95, 90, 94, 98, 92, 96],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1'
      },
      {
        label: 'Department Average',
        data: [85, 78, 88, 90, 84, 89],
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#94a3b8',
        pointBackgroundColor: '#94a3b8'
      }
    ]
  };

  const libraryUsageData = {
    labels: ['Computer Science & AI', 'Physics & Electronics', 'Mathematics', 'Literature & Fiction', 'Economics & Management'],
    datasets: [
      {
        data: [420, 280, 190, 150, 310],
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
      }
    ]
  };

  // --- EXPORT PDF FUNCTION ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Header Title
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('SMART CAMPUS EXECUTIVE ANALYTICS REPORT', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${timestamp} | Confidential Campus Record`, 14, 25);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('1. Key Campus KPIs Overview', 14, 42);

    doc.setFontSize(10);
    doc.text('• Overall Campus Attendance Rate: 91.8%', 14, 50);
    doc.text('• Total Fee Revenue Collected: $745,000 (92.4% realization rate)', 14, 57);
    doc.text('• Average Student Cumulative GPA: 3.46 / 4.0', 14, 64);
    doc.text('• Total Library Book Circulations this Month: 1,350 volumes', 14, 71);

    doc.setFontSize(14);
    doc.text('2. Department Performance Summary', 14, 85);

    // Render Table Header & Rows
    const startY = 92;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Department Name', 18, startY + 5);
    doc.text('Avg GPA', 85, startY + 5);
    doc.text('Attendance', 120, startY + 5);
    doc.text('Fee Realized', 160, startY + 5);

    const rows = [
      ['Computer Science', '3.65', '93%', '$280,000'],
      ['Electrical Engineering', '3.48', '91%', '$195,000'],
      ['Mechanical Engineering', '3.35', '88%', '$140,000'],
      ['Business Administration', '3.52', '89%', '$130,000']
    ];

    rows.forEach((row, idx) => {
      const y = startY + 14 + idx * 8;
      doc.text(row[0], 18, y);
      doc.text(row[1], 85, y);
      doc.text(row[2], 120, y);
      doc.text(row[3], 160, y);
    });

    doc.save(`SmartCampus_Analytics_Report_${Date.now()}.pdf`);
  };

  // --- EXPORT EXCEL FUNCTION ---
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Attendance
    const attendanceSheetData = [
      { Month: 'Jan', 'Computer Science %': 92, 'Electrical Engg %': 88, 'Business Admin %': 85 },
      { Month: 'Feb', 'Computer Science %': 89, 'Electrical Engg %': 86, 'Business Admin %': 83 },
      { Month: 'Mar', 'Computer Science %': 94, 'Electrical Engg %': 90, 'Business Admin %': 87 },
      { Month: 'Apr', 'Computer Science %': 88, 'Electrical Engg %': 85, 'Business Admin %': 82 },
      { Month: 'May', 'Computer Science %': 91, 'Electrical Engg %': 87, 'Business Admin %': 86 },
      { Month: 'Jun', 'Computer Science %': 95, 'Electrical Engg %': 89, 'Business Admin %': 88 },
      { Month: 'Jul', 'Computer Science %': 93, 'Electrical Engg %': 91, 'Business Admin %': 89 }
    ];
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceSheetData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance Trends');

    // Sheet 2: Fees
    const feeSheetData = [
      { Category: 'Tuition Fee', Collected: 450000, Pending: 50000 },
      { Category: 'Hostel Fee', Collected: 120000, Pending: 15000 },
      { Category: 'Library Fee', Collected: 35000, Pending: 5000 },
      { Category: 'Lab Fee', Collected: 80000, Pending: 10000 },
      { Category: 'Exam Fee', Collected: 60000, Pending: 8000 }
    ];
    const wsFees = XLSX.utils.json_to_sheet(feeSheetData);
    XLSX.utils.book_append_sheet(wb, wsFees, 'Fee Financial Ledger');

    // Save Workbook
    XLSX.writeFile(wb, `SmartCampus_Executive_Data_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-400" /> Chart.js Powered Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display mt-2">Executive Campus Dashboards</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time visual intelligence on Attendance, Fees, GPA Performance, Faculty Evaluation, and Library Circulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <FileText size={16} /> Export Executive PDF
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'attendance', label: 'Attendance Analytics', icon: Calendar },
          { id: 'fees', label: 'Fee Revenue Ledger', icon: DollarSign },
          { id: 'performance', label: 'Student Performance', icon: GraduationCap },
          { id: 'department', label: 'Department Rankings', icon: Building2 },
          { id: 'faculty', label: 'Faculty Evaluation', icon: Award },
          { id: 'library', label: 'Library Circulation', icon: BookOpen },
          { id: 'reports', label: 'Monthly Summary', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Dashboard View Container */}
      <div className="space-y-6">
        {/* TAB 1: ATTENDANCE ANALYTICS */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold font-display text-slate-900 text-base">Monthly Attendance Trends (%)</h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +2.4% vs last term
                </span>
              </div>
              <div className="h-72">
                <Line
                  data={attendanceMonthly}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold font-display text-slate-900 text-base">Attendance Risk Watchlist</h3>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Alex Johnson</span>
                    <span className="text-slate-500 text-[11px]">Roll: CS2023-042 • CS Dept</span>
                  </div>
                  <span className="px-2 py-1 bg-rose-600 text-white font-mono font-bold rounded-lg text-[11px]">
                    71.5%
                  </span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Priya Sharma</span>
                    <span className="text-slate-500 text-[11px]">Roll: EE2023-019 • EE Dept</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-600 text-white font-mono font-bold rounded-lg text-[11px]">
                    74.2%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs">
                  💡 Automated email warnings trigger when student attendance drops below 75%.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FEE ANALYTICS */}
        {activeTab === 'fees' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold font-display text-slate-900 text-base">Fee Collection vs Pending Balances ($)</h3>
              <div className="h-72">
                <Bar
                  data={feeAnalyticsData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold font-display text-slate-900 text-base">Payment Method Preferences (%)</h3>
              <div className="h-72 flex items-center justify-center">
                <Doughnut
                  data={feeMethodBreakdown}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold font-display text-slate-900 text-base">GPA Range Distribution Across Campus</h3>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                Total Enrolled Students: 1,130
              </span>
            </div>
            <div className="h-80">
              <Bar
                data={studentGpaDistribution}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: DEPARTMENT PERFORMANCE */}
        {activeTab === 'department' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold font-display text-slate-900 text-base">
              Department Academic Performance & Research Output
            </h3>
            <div className="h-80">
              <Bar
                data={departmentPerformanceData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: FACULTY EVALUATION */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold font-display text-slate-900 text-base">Faculty Peer Evaluation Radar</h3>
              <div className="h-72">
                <Radar
                  data={facultyRadarData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold font-display text-slate-900 text-base">Top Rated Faculty Members</h3>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Alan Turing', dept: 'Computer Science', score: '4.95 / 5.0', classes: 42 },
                  { name: 'Prof. Marie Curie', dept: 'Electrical Engg', score: '4.88 / 5.0', classes: 38 },
                  { name: 'Dr. Nikola Tesla', dept: 'Mechanical Engg', score: '4.82 / 5.0', classes: 35 }
                ].map((f, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{f.name}</span>
                      <span className="text-slate-500 text-[11px] block">{f.dept} • {f.classes} lectures conducted</span>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg font-mono">
                      ⭐ {f.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIBRARY USAGE */}
        {activeTab === 'library' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold font-display text-slate-900 text-base">
              Book Circulations by Genre / Subject Category
            </h3>
            <div className="h-80 flex items-center justify-center">
              <Pie
                data={libraryUsageData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
        )}

        {/* TAB 7: MONTHLY REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-slate-900 text-base">Monthly Campus Executive Summary</h3>
                <p className="text-xs text-slate-500">Integrated audit report covering all major university divisions</p>
              </div>
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Download size={14} /> Download Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Attendance Rate</span>
                <div className="text-2xl font-bold font-display text-slate-900">91.8%</div>
                <span className="text-[11px] text-emerald-600 font-semibold">Healthy target range</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Fee Realization</span>
                <div className="text-2xl font-bold font-display text-slate-900">$745,000</div>
                <span className="text-[11px] text-emerald-600 font-semibold">92.4% collected</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Campus GPA Avg</span>
                <div className="text-2xl font-bold font-display text-slate-900">3.46</div>
                <span className="text-[11px] text-indigo-600 font-semibold">Top 15% regional band</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Library Issued</span>
                <div className="text-2xl font-bold font-display text-slate-900">1,350</div>
                <span className="text-[11px] text-slate-600 font-semibold">Active circulations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
