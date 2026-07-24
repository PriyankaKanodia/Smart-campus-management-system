import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  GraduationCap, 
  Bus, 
  Home, 
  Package, 
  Award, 
  DollarSign, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Check, 
  X,
  PieChart as PieIcon,
  BarChart3,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { useToast } from './Toast';

interface AdminModulesManagerProps {
  activeModule: 'departments' | 'admissions' | 'hostel' | 'transport' | 'inventory' | 'scholarships' | 'payroll' | 'analytics';
  onNavigate?: (module: string) => void;
}

export default function AdminModulesManager({ activeModule }: AdminModulesManagerProps) {
  const { toast } = useToast();

  // --- 1. DEPARTMENT MANAGEMENT STATE ---
  const [departments, setDepartments] = useState([
    { id: 'd1', name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Alan Turing', building: 'Tech Block A', facultyCount: 18, studentCount: 380, budget: '$250,000' },
    { id: 'd2', name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Claude Shannon', building: 'Tech Block B', facultyCount: 14, studentCount: 220, budget: '$180,000' },
    { id: 'd3', name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. James Watt', building: 'Engineering Complex', facultyCount: 10, studentCount: 150, budget: '$160,000' },
    { id: 'd4', name: 'Civil Engineering', code: 'CE', hod: 'Dr. Isambard Kingdom', building: 'Structure Wing', facultyCount: 8, studentCount: 110, budget: '$140,000' },
    { id: 'd5', name: 'Biotechnology & Life Sciences', code: 'BT', hod: 'Dr. Rosalind Franklin', building: 'Bio Science Lab', facultyCount: 6, studentCount: 85, budget: '$130,000' }
  ]);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', hod: '', building: 'Tech Block A', budget: '$150,000' });

  // --- 2. ADMISSION MANAGEMENT STATE ---
  const [admissions, setAdmissions] = useState([
    { id: 'adm_1', applicantName: 'Sophia Martinez', email: 'sophia.m@gmail.com', phone: '+1 555-0192', program: 'B.Tech CSE', gpa: '3.92', status: 'under_review', appliedDate: '2026-07-10' },
    { id: 'adm_2', applicantName: 'Lucas Henderson', email: 'lucas.h@gmail.com', phone: '+1 555-0841', program: 'B.Tech ECE', gpa: '3.85', status: 'accepted', appliedDate: '2026-07-08' },
    { id: 'adm_3', applicantName: 'Emma Watson', email: 'emma.w@gmail.com', phone: '+1 555-0312', program: 'M.Tech CSE AI', gpa: '3.98', status: 'accepted', appliedDate: '2026-07-05' },
    { id: 'adm_4', applicantName: 'Ethan Carter', email: 'ethan.c@gmail.com', phone: '+1 555-0774', program: 'B.Tech Mechanical', gpa: '3.40', status: 'rejected', appliedDate: '2026-07-02' }
  ]);

  // --- 3. HOSTEL MANAGEMENT STATE ---
  const [hostels, setHostels] = useState([
    { id: 'h1', name: 'Newton Boys Residence', type: 'Boys', totalRooms: 120, occupiedRooms: 104, warden: 'Mr. Robert Ford', phone: '+1 555-9011' },
    { id: 'h2', name: 'Curie Girls Hostel', type: 'Girls', totalRooms: 100, occupiedRooms: 88, warden: 'Dr. Sarah Connor', phone: '+1 555-9022' },
    { id: 'h3', name: 'Post-Graduate Scholars Block', type: 'Co-Ed', totalRooms: 60, occupiedRooms: 52, warden: 'Prof. Charles Xavier', phone: '+1 555-9033' }
  ]);

  // --- 4. TRANSPORT MANAGEMENT STATE ---
  const [routes, setRoutes] = useState([
    { id: 'r1', routeName: 'Route 1: Downtown Express', busNo: 'BUS-101', driverName: 'John Doe', driverPhone: '+1 555-1122', capacity: 50, allocated: 46, stops: ['Central Station', 'North Plaza', 'Campus Gate 1'] },
    { id: 'r2', routeName: 'Route 2: Westside Suburban', busNo: 'BUS-102', driverName: 'Michael Smith', driverPhone: '+1 555-3344', capacity: 50, allocated: 48, stops: ['West Mall', 'Oakridge', 'Campus Gate 2'] },
    { id: 'r3', routeName: 'Route 3: Metro Connector', busNo: 'BUS-103', driverName: 'David Lee', driverPhone: '+1 555-5566', capacity: 40, allocated: 32, stops: ['Metro Hub', 'University Heights', 'Main Gate'] }
  ]);

  // --- 5. INVENTORY MANAGEMENT STATE ---
  const [inventory, setInventory] = useState([
    { id: 'inv1', itemName: 'Dell OptiPlex i7 Workstations', category: 'Computing Lab', quantity: 120, unitPrice: '$850', location: 'CS Lab 1 & 2', status: 'in_stock' },
    { id: 'inv2', itemName: 'Digital Storage Oscilloscopes', category: 'Electronics Lab', quantity: 45, unitPrice: '$600', location: 'ECE HW Lab', status: 'in_stock' },
    { id: 'inv3', itemName: 'Epson High-Lumen Projectors', category: 'Lecture Halls', quantity: 8, unitPrice: '$1,200', location: 'Main Auditorium', status: 'low_stock' },
    { id: 'inv4', itemName: 'Ergonomic Mesh Lab Chairs', category: 'Furniture', quantity: 250, unitPrice: '$120', location: 'All Blocks', status: 'in_stock' }
  ]);

  // --- 6. SCHOLARSHIP MANAGEMENT STATE ---
  const [scholarships, setScholarships] = useState([
    { id: 'sch1', title: 'Presidential Academic Excellence Grant', amount: '$5,000 / yr', recipients: 24, minGpa: '3.80', status: 'Active' },
    { id: 'sch2', title: 'STEM Women in Technology Fellowship', amount: '$4,000 / yr', recipients: 15, minGpa: '3.60', status: 'Active' },
    { id: 'sch3', title: 'National Sports & Athletic Merit Fund', amount: '$3,000 / yr', recipients: 10, minGpa: '3.20', status: 'Active' }
  ]);

  // --- 7. PAYROLL MANAGEMENT STATE ---
  const [payrolls, setPayrolls] = useState([
    { id: 'pay1', facultyName: 'Dr. Alan Turing', employeeId: 'FAC-1001', month: 'July 2026', basicSalary: 8500, allowance: 1200, deductions: 950, netPay: 8750, status: 'Paid' },
    { id: 'pay2', facultyName: 'Dr. Claude Shannon', employeeId: 'FAC-1002', month: 'July 2026', basicSalary: 8200, allowance: 1100, deductions: 900, netPay: 8400, status: 'Paid' },
    { id: 'pay3', facultyName: 'Dr. Rosalind Franklin', employeeId: 'FAC-1003', month: 'July 2026', basicSalary: 7800, allowance: 1000, deductions: 850, netPay: 7950, status: 'Pending' }
  ]);

  // --- HANDLERS ---
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    setDepartments([
      ...departments,
      {
        id: `d_${Date.now()}`,
        name: deptForm.name,
        code: deptForm.code.toUpperCase(),
        hod: deptForm.hod || 'TBD',
        building: deptForm.building,
        facultyCount: 0,
        studentCount: 0,
        budget: deptForm.budget
      }
    ]);
    setIsAddDeptModalOpen(false);
    setDeptForm({ name: '', code: '', hod: '', building: 'Tech Block A', budget: '$150,000' });
    toast('Department created successfully!', 'success');
  };

  const handleUpdateAdmissionStatus = (id: string, newStatus: 'accepted' | 'rejected') => {
    setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast(`Applicant status updated to ${newStatus.toUpperCase()}`, newStatus === 'accepted' ? 'success' : 'info');
  };

  const handleRunPayroll = (id: string) => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid' } : p));
    toast('Payroll funds disbursed and payslip dispatched!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. DEPARTMENT MANAGEMENT */}
      {activeModule === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Academic Department Management</h2>
              <p className="text-xs text-slate-500 mt-1">Configure academic divisions, heads of departments, faculty allocation, and annual operating budgets.</p>
            </div>
            <button
              onClick={() => setIsAddDeptModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-600/10"
            >
              <Plus size={16} /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {dept.code}
                    </span>
                    <h3 className="font-display font-bold text-slate-900 text-base mt-2">{dept.name}</h3>
                  </div>
                  <Building className="h-6 w-6 text-indigo-500 shrink-0" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong>Head of Dept:</strong> {dept.hod}</p>
                  <p><strong>Building Location:</strong> {dept.building}</p>
                  <p><strong>Annual Operating Budget:</strong> <span className="font-mono text-emerald-600 font-bold">{dept.budget}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Faculty</span>
                    <strong className="text-slate-800 text-base font-mono">{dept.facultyCount}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Students</span>
                    <strong className="text-slate-800 text-base font-mono">{dept.studentCount}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ADMISSION MANAGEMENT */}
      {activeModule === 'admissions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Admissions & Applicant Portal</h2>
              <p className="text-xs text-slate-500 mt-1">Process new student applications, verify credentials, and approve enrollment.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
              {admissions.length} New Applicants
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Contact Email</th>
                  <th className="p-3">High School / Prior GPA</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900">{adm.applicantName}</td>
                    <td className="p-3 font-medium text-indigo-600">{adm.program}</td>
                    <td className="p-3 text-slate-500">{adm.email}</td>
                    <td className="p-3 font-mono font-bold">{adm.gpa} / 4.0</td>
                    <td className="p-3 text-slate-500">{adm.appliedDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        adm.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        adm.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {adm.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {adm.status === 'under_review' && (
                        <>
                          <button
                            onClick={() => handleUpdateAdmissionStatus(adm.id, 'accepted')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateAdmissionStatus(adm.id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. HOSTEL MANAGEMENT */}
      {activeModule === 'hostel' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">Campus Residence & Hostel Facilities</h2>
            <p className="text-xs text-slate-500 mt-1">Hostel block occupancy, room allocations, warden management, and student safety logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hostels.map((h) => {
              const occPercent = Math.round((h.occupiedRooms / h.totalRooms) * 100);
              return (
                <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                        {h.type}
                      </span>
                      <h3 className="font-display font-bold text-slate-900 text-base mt-2">{h.name}</h3>
                    </div>
                    <Home className="h-6 w-6 text-indigo-500 shrink-0" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><strong>Chief Warden:</strong> {h. warden}</p>
                    <p><strong>Emergency Contact:</strong> {h.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span>Room Occupancy</span>
                      <span>{h.occupiedRooms} / {h.totalRooms} ({occPercent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${occPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TRANSPORT MANAGEMENT */}
      {activeModule === 'transport' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">Fleet & Transport Fleet Management</h2>
            <p className="text-xs text-slate-500 mt-1">Campus shuttle routes, driver schedules, vehicle capacity, and student bus pass tracking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {routes.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                      {r.busNo}
                    </span>
                    <h3 className="font-display font-bold text-slate-900 text-base mt-2">{r.routeName}</h3>
                  </div>
                  <Bus className="h-6 w-6 text-emerald-500 shrink-0" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong>Assigned Driver:</strong> {r.driverName}</p>
                  <p><strong>Contact:</strong> {r.driverPhone}</p>
                  <p><strong>Passenger Seat Allocations:</strong> {r.allocated} / {r.capacity} seats</p>
                </div>

                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Route Stops:</p>
                  <p className="text-xs text-slate-700 font-medium">{r.stops.join(' → ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INVENTORY MANAGEMENT */}
      {activeModule === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Campus Asset & Inventory Control</h2>
              <p className="text-xs text-slate-500 mt-1">Track laboratory equipment, computing hardware, furniture, and reorder thresholds.</p>
            </div>
            <button 
              onClick={() => toast('Inventory audit report exported as CSV.', 'success')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-2"
            >
              <Download size={14} /> Export Asset Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">In-Stock Quantity</th>
                  <th className="p-3">Unit Valuation</th>
                  <th className="p-3">Building Location</th>
                  <th className="p-3">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900">{inv.itemName}</td>
                    <td className="p-3 font-medium text-slate-600">{inv.category}</td>
                    <td className="p-3 font-mono font-bold">{inv.quantity} units</td>
                    <td className="p-3 font-mono">{inv.unitPrice}</td>
                    <td className="p-3 text-slate-500">{inv.location}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        inv.status === 'in_stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SCHOLARSHIP MANAGEMENT */}
      {activeModule === 'scholarships' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">Scholarships & Financial Aid Grants</h2>
            <p className="text-xs text-slate-500 mt-1">Manage institutional merit grants, need-based aid, and disbursement records.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scholarships.map((sch) => (
              <div key={sch.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-bold text-slate-900 text-base">{sch.title}</h3>
                  <Award className="h-6 w-6 text-amber-500 shrink-0" />
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong>Grant Amount:</strong> <span className="font-mono text-emerald-600 font-bold">{sch.amount}</span></p>
                  <p><strong>Minimum Required GPA:</strong> <span className="font-mono">{sch.minGpa}</span></p>
                  <p><strong>Active Beneficiaries:</strong> {sch.recipients} students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PAYROLL MANAGEMENT */}
      {activeModule === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Faculty & Staff Payroll Ledger</h2>
              <p className="text-xs text-slate-500 mt-1">Process faculty salaries, calculate allowances, tax deductions, and issue digital payslips.</p>
            </div>
            <button 
              onClick={() => toast('All pending payrolls processed successfully.', 'success')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10"
            >
              Run Batch Payroll
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Faculty Name</th>
                  <th className="p-3">Emp ID</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Basic Salary</th>
                  <th className="p-3">Allowances</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Payable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900">{pay.facultyName}</td>
                    <td className="p-3 font-mono text-slate-500">{pay.employeeId}</td>
                    <td className="p-3 text-slate-500">{pay.month}</td>
                    <td className="p-3 font-mono">${pay.basicSalary}</td>
                    <td className="p-3 font-mono text-emerald-600">+${pay.allowance}</td>
                    <td className="p-3 font-mono text-rose-600">-${pay.deductions}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">${pay.netPay}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {pay.status === 'Pending' ? (
                        <button
                          onClick={() => handleRunPayroll(pay.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-xs"
                        >
                          Disburse
                        </button>
                      ) : (
                        <button
                          onClick={() => toast(`Downloading payslip for ${pay.facultyName}`, 'info')}
                          className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                        >
                          Payslip
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD DEPARTMENT MODAL */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-slate-900 text-base">Add New Academic Department</h3>
            <form onSubmit={handleAddDept} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dept Code</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. AIR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Head of Dept</label>
                  <input
                    type="text"
                    value={deptForm.hod}
                    onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })}
                    placeholder="e.g. Dr. John McCarthy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
