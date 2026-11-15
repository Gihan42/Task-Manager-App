import { useState, type CSSProperties, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import {
    UserPlus, Save, Trash2, Eraser, Search, Pencil,
    ChevronLeft, ChevronRight, IdCard, Mail, CalendarDays, User,
    Fingerprint, MapPin, Briefcase, Phone, ShieldCheck, BadgeCheck, CalendarClock,
    Building2,
} from 'lucide-react';

/* ---------- shared styles ---------- */
const border = '1px solid hsl(var(--border))';
const inputBorder = '1px solid hsl(var(--foreground) / 0.35)';

const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
};

const iconWrapStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'hsl(var(--foreground))', // dark: white, light: black
    pointerEvents: 'none',
    zIndex: 2,
};

const btnCommon: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    padding: '0 20px',
    borderRadius: 6,
    border: '1px solid transparent',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
};

const btnCreate: CSSProperties = { ...btnCommon, background: '#10b981', color: '#ffffff' };
const btnUpdate: CSSProperties = { ...btnCommon, background: '#3b82f6', color: '#ffffff' };
const btnDelete: CSSProperties = { ...btnCommon, background: '#ef4444', color: '#ffffff' };
const btnClear: CSSProperties = { ...btnCommon, background: '#f59e0b', color: '#ffffff' };

const pageBtn = (active: boolean): CSSProperties => ({
    width: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 0,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? '1px solid transparent' : inputBorder,
    background: active ? 'hsl(var(--primary))' : 'transparent',
    color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
});

const thStyle: CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    color: 'hsl(var(--muted-foreground))',
};

const tdStyle: CSSProperties = {
    padding: '12px 16px',
    whiteSpace: 'nowrap',
    fontSize: 14,
};

/* Sidebar collapse unath layout eka ekama widiyata thiyenna auto-fill grid */
const gridStyle = (min: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
    gap: 16,
    width: '100%',
});

/* Input / select / date okkoma ekama style (global CSS override karanna !important) */
const themeCss = `
.emp-input { color-scheme: light; }
.dark .emp-input { color-scheme: dark; }

.emp-input {
    position: static !important;
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    height: 44px !important;
    box-sizing: border-box !important;
    border: 1px solid hsl(var(--foreground) / 0.35) !important;
    border-radius: 6px !important;
    background: hsl(var(--background)) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    color: hsl(var(--foreground)) !important;
    padding: 0 12px 0 48px !important;
    margin: 0 !important;
    font-size: 14px !important;
    outline: none !important;
    text-indent: 0 !important;
}
select.emp-input {
    padding-right: 36px !important;
}
.emp-input::placeholder {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 1;
}
.emp-input:focus {
    border-color: hsl(var(--primary)) !important;
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.25) !important;
}
.emp-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
`;

/* ---------- small input components ---------- */
const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input className="emp-input" {...props} />
);

const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className="emp-input" {...props} />
);

/* ---------- field wrapper ---------- */
const Field = ({ label, icon: Icon, children }: { label: string; icon: any; children: ReactNode }) => (
    <div style={{ minWidth: 0 }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
            <span style={iconWrapStyle}>
                <Icon size={16} />
            </span>
            {children}
        </div>
    </div>
);

/* ---------- types / table ---------- */
interface EmployeeRow {
    employeeId: string;
    email: string;
    joinDate: string;
    fullName: string;
    nic: string;
    address1: string;
    address2: string;
    empType: string;
    contact1: string;
    contact2: string;
    department: string;
    google: boolean;
    jobRole: string;
    startDate: string;
    endDate: string;
}

const columns = [
    'Employee ID', 'Email', 'Join Date', 'Full Name', 'NIC', 'Address 1', 'Address 2',
    'Type', 'Contact 1', 'Contact 2', 'Department', 'Google', 'Job Role', 'Role Start', 'Role End', 'Actions',
];

const PAGE_SIZE = 5;

export const Employee = () => {
    const [isGoogle, setIsGoogle] = useState(false);
    const [page, setPage] = useState(1);

    // Backend integrate karaddi methanata data set karanna
    const [employees] = useState<EmployeeRow[]>([]);

    const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const pageRows = employees.slice(start, start + PAGE_SIZE);
    const from = employees.length === 0 ? 0 : start + 1;
    const to = start + pageRows.length;

    return (
        <div className="p-4 space-y-6 animate-fade-in" style={{ minWidth: 0 }}>
            <style>{themeCss}</style>

            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Employee Manage</h1>
            </div>

            {/* ================= FORM ================= */}
            <div
                className="bg-card shadow-lg"
                style={{ borderRadius: 10, border, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}
            >
                <div style={gridStyle(260)}>
                    <Field label="Employee ID" icon={IdCard}>
                        <TextInput value="EMP-AUTO" disabled readOnly />
                    </Field>
                    <Field label="Email" icon={Mail}>
                        <TextInput type="email" placeholder="m@example.com" />
                    </Field>
                    <Field label="Join Date" icon={CalendarDays}>
                        <TextInput type="date" />
                    </Field>
                    <Field label="Full Name" icon={User}>
                        <TextInput placeholder="John Doe" />
                    </Field>
                    <Field label="NIC" icon={Fingerprint}>
                        <TextInput placeholder="NIC number" />
                    </Field>
                    <Field label="Employee Type" icon={Briefcase}>
                        <SelectInput defaultValue="">
                            <option value="" disabled>Select type</option>
                            <option>Permanent</option>
                            <option>Contract</option>
                            <option>Intern</option>
                            <option>Part Time</option>
                        </SelectInput>
                    </Field>
                    <Field label="Address 1" icon={MapPin}>
                        <TextInput placeholder="Address line 1" />
                    </Field>
                    <Field label="Address 2" icon={MapPin}>
                        <TextInput placeholder="Address line 2" />
                    </Field>
                    <Field label="Contact 1" icon={Phone}>
                        <TextInput placeholder="07X XXX XXXX" />
                    </Field>
                    <Field label="Contact 2" icon={Phone}>
                        <TextInput placeholder="07X XXX XXXX" />
                    </Field>
                    <Field label="Department" icon={Building2}>
                        <SelectInput defaultValue="">
                            <option value="" disabled>Select department</option>
                            <option>Human Resources</option>
                            <option>Finance</option>
                            <option>IT</option>
                            <option>Marketing</option>
                            <option>Operations</option>
                        </SelectInput>
                    </Field>
                </div>

                {/* Horizontal line 1: Google toggle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 8,
                        border: inputBorder,
                        background: 'hsl(var(--muted) / 0.2)',
                        padding: '12px 16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ShieldCheck size={20} style={{ color: 'hsl(var(--foreground))', flexShrink: 0 }} />
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Is this a Google account?</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
                                Google accounts sign in without a password
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={isGoogle}
                        onClick={() => setIsGoogle(!isGoogle)}
                        style={{
                            position: 'relative',
                            width: 48,
                            height: 26,
                            padding: 0,
                            borderRadius: 999,
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                            background: isGoogle ? '#10b981' : '#6b7280',
                            transition: 'background 0.2s',
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                top: 3,
                                left: isGoogle ? 25 : 3,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                transition: 'left 0.2s',
                            }}
                        />
                    </button>
                </div>

                {/* Horizontal line 2: Job role */}
                <div
                    style={{
                        ...gridStyle(220),
                        borderRadius: 8,
                        border: inputBorder,
                        background: 'hsl(var(--muted) / 0.2)',
                        padding: 16,
                        boxSizing: 'border-box',
                    }}
                >
                    <Field label="Job Role" icon={BadgeCheck}>
                        <SelectInput defaultValue="">
                            <option value="" disabled>Select job role</option>
                            <option>Employee</option>
                            <option>Developer</option>
                            <option>Manager</option>
                            <option>Admin</option>
                        </SelectInput>
                    </Field>
                    <Field label="Job Role Start Date" icon={CalendarClock}>
                        <TextInput type="date" />
                    </Field>
                    <Field label="Job Role End Date" icon={CalendarClock}>
                        <TextInput type="date" />
                    </Field>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                    <button type="button" style={btnCreate}><UserPlus size={18} /> Create</button>
                    <button type="button" style={btnUpdate}><Save size={18} /> Update</button>
                    <button type="button" style={btnDelete}><Trash2 size={18} /> Delete</button>
                    <button type="button" style={btnClear}><Eraser size={18} /> Clear</button>
                </div>
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-card shadow-lg" style={{ borderRadius: 10, border, minWidth: 0 }}>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: 16,
                        borderBottom: border,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Employees</h2>
                    <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
                        <span style={iconWrapStyle}>
                            <Search size={16} />
                        </span>
                        <TextInput placeholder="Search..." />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: 'hsl(var(--muted) / 0.4)' }}>
                            {columns.map((c) => (
                                <th key={c} style={thStyle}>{c}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    style={{
                                        ...tdStyle,
                                        textAlign: 'center',
                                        padding: '40px 16px',
                                        color: 'hsl(var(--muted-foreground))',
                                    }}
                                >
                                    No employees found
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((r) => (
                                <tr key={r.employeeId} style={{ borderTop: border }}>
                                    <td style={{ ...tdStyle, fontWeight: 500, color: 'hsl(var(--primary))' }}>{r.employeeId}</td>
                                    <td style={tdStyle}>{r.email}</td>
                                    <td style={tdStyle}>{r.joinDate}</td>
                                    <td style={tdStyle}>{r.fullName}</td>
                                    <td style={tdStyle}>{r.nic}</td>
                                    <td style={tdStyle}>{r.address1}</td>
                                    <td style={tdStyle}>{r.address2}</td>
                                    <td style={tdStyle}>{r.empType}</td>
                                    <td style={tdStyle}>{r.contact1}</td>
                                    <td style={tdStyle}>{r.contact2}</td>
                                    <td style={tdStyle}>{r.department}</td>
                                    <td style={tdStyle}>
                                            <span
                                                style={{
                                                    padding: '2px 10px',
                                                    borderRadius: 999,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    background: r.google ? 'rgba(16,185,129,0.15)' : 'hsl(var(--muted))',
                                                    color: r.google ? '#10b981' : 'hsl(var(--muted-foreground))',
                                                }}
                                            >
                                                {r.google ? 'Yes' : 'No'}
                                            </span>
                                    </td>
                                    <td style={tdStyle}>{r.jobRole}</td>
                                    <td style={tdStyle}>{r.startDate}</td>
                                    <td style={tdStyle}>{r.endDate}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                type="button"
                                                title="Edit"
                                                style={{ padding: 6, border: 'none', borderRadius: 6, background: 'transparent', color: '#f59e0b', cursor: 'pointer' }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete"
                                                style={{ padding: 6, border: 'none', borderRadius: 6, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: 16,
                        borderTop: border,
                    }}
                >
                    <p style={{ margin: 0, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
                        Showing {from} to {to} of {employees.length} employees
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button type="button" style={pageBtn(false)} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} type="button" style={pageBtn(page === i + 1)} onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </button>
                        ))}
                        <button type="button" style={pageBtn(false)} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};