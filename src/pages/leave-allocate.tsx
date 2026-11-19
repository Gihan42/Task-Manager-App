import {
    useState,
    useEffect,
    type CSSProperties,
    type ReactNode,
    type InputHTMLAttributes,
    type SelectHTMLAttributes,
} from "react";
import {
    BadgeCheck,
    CalendarOff,
    Hash,
    PlusCircle,
    Save,
    Trash2,
    Eraser,
    Pencil,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Archive,
} from "lucide-react";

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");
const border = "1px solid hsl(var(--border))";
const inputBorder = "1px solid hsl(var(--foreground) / 0.35)";
const PAGE_SIZE = 5;

const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "hsl(var(--muted-foreground))",
};

const iconWrapStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "hsl(var(--foreground))",
    pointerEvents: "none",
    zIndex: 2,
};

const btnCommon: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 42,
    padding: "0 20px",
    borderRadius: 6,
    border: "1px solid transparent",
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
};

const btnCreate: CSSProperties = { ...btnCommon, background: "#10b981" };
const btnUpdate: CSSProperties = { ...btnCommon, background: "#3b82f6" };
const btnDelete: CSSProperties = { ...btnCommon, background: "#ef4444" };
const btnClear: CSSProperties = { ...btnCommon, background: "#f59e0b" };

const pageBtn = (active: boolean): CSSProperties => ({
    width: 36,
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    padding: 0,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    border: active ? "1px solid transparent" : inputBorder,
    background: active ? "#3b82f6" : "transparent",
    color: active ? "#ffffff" : "hsl(var(--foreground))",
});

const thStyle: CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    color: "hsl(var(--muted-foreground))",
};

const tdStyle: CSSProperties = {
    padding: "12px 16px",
    fontSize: 14,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
};

const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    width: "100%",
};

const themeCss = `
.la-input { color-scheme: light; }
.dark .la-input { color-scheme: dark; }
.la-input {
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
}
select.la-input { padding-right: 36px !important; }
.la-input::placeholder {
  color: hsl(var(--muted-foreground)) !important;
  opacity: 1;
}
.la-input:focus {
  border-color: hsl(var(--primary)) !important;
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.25) !important;
}
`;

interface Option {
    id: string;
    name: string;
}

interface AllocationRow {
    id: string;
    jobRoleId: string;
    jobRoleName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    annualEntitlement: number;
    status: boolean;
}

interface AllocationForm {
    jobRoleId: string;
    leaveTypeId: string;
    annualEntitlement: string;
}

const emptyForm: AllocationForm = {
    jobRoleId: "",
    leaveTypeId: "",
    annualEntitlement: "",
};

const columns = ["ID", "Job Role", "Leave Type", "Annual Entitlement", "Actions"];

const getToken = () =>
    localStorage.getItem("access_token") ?? localStorage.getItem("token") ?? "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

const readError = async (response: Response, fallback: string) => {
    const err = await response.json().catch(() => null);
    const msg = Array.isArray(err?.message) ? err.message.join(", ") : err?.message;
    return `${response.status}: ${msg || fallback}`;
};

const getList = async (path: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/${path}`, { headers: authHeaders() });
    if (!response.ok) throw new Error(await readError(response, "Request failed"));
    const resJson = await response.json();
    return Array.isArray(resJson) ? resJson : (resJson?.data ?? []);
};

const toAllocationRow = (item: any): AllocationRow => ({
    id: String(item.id),
    jobRoleId: String(item.jobRoleId),
    jobRoleName: item.jobRoleName ?? "",
    leaveTypeId: String(item.leaveTypeId),
    leaveTypeName: item.leaveTypeName ?? "",
    annualEntitlement: Number(item.annualEntitlement),
    status: Boolean(item.status),
});

const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input className="la-input" {...props} />
);

const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className="la-input" {...props} />
);

const Field = ({
                   label,
                   icon: Icon,
                   children,
               }: {
    label: string;
    icon: any;
    children: ReactNode;
}) => (
    <div style={{ minWidth: 0 }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: "relative" }}>
      <span style={iconWrapStyle}>
        <Icon size={16} />
      </span>
            {children}
        </div>
    </div>
);

export const LeaveAllocate = () => {
    const [form, setForm] = useState<AllocationForm>(emptyForm);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDelete, setShowDelete] = useState(false);
    const [page, setPage] = useState(1);
    const [errorMsg, setErrorMsg] = useState("");

    const [jobRoles, setJobRoles] = useState<Option[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<Option[]>([]);
    const [allocations, setAllocations] = useState<AllocationRow[]>([]);

    const totalPages = Math.max(1, Math.ceil(allocations.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = allocations.slice(start, start + PAGE_SIZE);
    const from = allocations.length === 0 ? 0 : start + 1;
    const to = start + pageRows.length;

    const loadJobRoles = async () => {
        try {
            const list = await getList("job-role/leave-type-id-name");
            setJobRoles(list.map((i) => ({ id: String(i.id), name: i.jobRole })));
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const loadLeaveTypes = async () => {
        try {
            const list = await getList("leave-type/leave-type-id-name");
            setLeaveTypes(list.map((i) => ({ id: String(i.id), name: i.roleType })));
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const loadAllocations = async () => {
        try {
            const list = await getList("leave-allocate/get-all");
            setAllocations(list.map(toAllocationRow));
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    useEffect(() => {
        loadJobRoles();
        loadLeaveTypes();
        loadAllocations();
    }, []);

    const handleClear = () => {
        setForm(emptyForm);
        setSelectedId(null);
    };

    const handleEdit = (row: AllocationRow) => {
        setErrorMsg("");
        setSelectedId(row.id);
        setForm({
            jobRoleId: row.jobRoleId,
            leaveTypeId: row.leaveTypeId,
            annualEntitlement: String(row.annualEntitlement),
        });
    };

    const isFormValid = () => {
        if (!form.jobRoleId || !form.leaveTypeId || form.annualEntitlement === "") {
            setErrorMsg("Job role, leave type and annual entitlement are required");
            return false;
        }
        return true;
    };

    const buildPayload = (status: boolean) => ({
        jobRoleId: Number(form.jobRoleId),
        leaveTypeId: Number(form.leaveTypeId),
        annualEntitlement: Number(form.annualEntitlement),
        status,
    });

    const createLeaveAllocate = async () => {
        setErrorMsg("");
        if (!isFormValid()) return;

        try {
            const response = await fetch(`${API_URL}/leave-allocate/create`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(buildPayload(true)),
            });

            if (!response.ok) {
                throw new Error(await readError(response , "Failed to create leave allocation"));
            }

            await loadAllocations();
            handleClear();
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const updateLeaveAllocate = async () => {
        setErrorMsg("");
        if (!selectedId) {
            setErrorMsg("Select an allocation from the table first");
            return;
        }
        if (!isFormValid()) return;

        const current = allocations.find((a) => a.id === selectedId);

        try {
            const response = await fetch(`${API_URL}/leave-allocate/update/${selectedId}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(buildPayload(current?.status ?? true)),
            });

            if (!response.ok) {
                throw new Error(await readError(response, "Failed to update leave allocation"));
            }

            await loadAllocations();
            handleClear();
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const deleteLeaveAllocate = async () => {
        setErrorMsg("");
        if (!selectedId) {
            setShowDelete(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/leave-allocate/delete/${selectedId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!response.ok) {
                throw new Error(await readError(response, "Failed to delete leave allocation"));
            }

            await loadAllocations();
            handleClear();
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setShowDelete(false);
        }
    };

    const setLeaveAllocateInactive = async () => {
        setErrorMsg("");
        if (!selectedId) {
            setShowDelete(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/leave-allocate/update/${selectedId}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(buildPayload(false)),
            });

            if (!response.ok) {
                throw new Error(await readError(response, "Failed to set allocation inactive"));
            }

            await loadAllocations();
            handleClear();
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setShowDelete(false);
        }
    };

    const openDeleteConfirm = () => {
        if (!selectedId) {
            setErrorMsg("Select an allocation from the table first");
            return;
        }
        setShowDelete(true);
    };

    return (
        <div className="p-4 space-y-6 animate-fade-in" style={{ minWidth: 0 }}>
            <style>{themeCss}</style>

            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Leave Allocate</h1>
            </div>

            <div
                className="bg-card shadow-lg"
                style={{
                    borderRadius: 10,
                    border,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    minWidth: 0,
                }}
            >
                <div style={gridStyle}>
                    <Field label="Job Role" icon={BadgeCheck}>
                        <SelectInput
                            value={form.jobRoleId}
                            onChange={(e) => setForm({ ...form, jobRoleId: e.target.value })}
                        >
                            <option value="" disabled>Select job role</option>
                            {jobRoles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </SelectInput>
                    </Field>

                    <Field label="Leave Type" icon={CalendarOff}>
                        <SelectInput
                            value={form.leaveTypeId}
                            onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                        >
                            <option value="" disabled>Select leave type</option>
                            {leaveTypes.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </SelectInput>
                    </Field>

                    <Field label="Annual Entitlement" icon={Hash}>
                        <TextInput
                            inputMode="numeric"
                            placeholder="14"
                            value={form.annualEntitlement}
                            onChange={(e) =>
                                setForm({ ...form, annualEntitlement: e.target.value.replace(/\D/g, "") })
                            }
                        />
                    </Field>
                </div>

                {errorMsg && (
                    <div
                        style={{
                            borderRadius: 6,
                            padding: "10px 14px",
                            fontSize: 13,
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                        }}
                    >
                        {errorMsg}
                    </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                    <button type="button" style={btnCreate} onClick={createLeaveAllocate}>
                        <PlusCircle size={18} /> Create
                    </button>
                    <button type="button" style={btnUpdate} onClick={updateLeaveAllocate}>
                        <Save size={18} /> Update
                    </button>
                    <button type="button" style={btnDelete} onClick={openDeleteConfirm}>
                        <Trash2 size={18} /> Delete
                    </button>
                    <button type="button" style={btnClear} onClick={handleClear}>
                        <Eraser size={18} /> Clear
                    </button>
                </div>
            </div>

            <div className="bg-card shadow-lg" style={{ borderRadius: 10, border, minWidth: 0 }}>
                <div style={{ padding: 16, borderBottom: border }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Leave Allocations</h2>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
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
                                        textAlign: "center",
                                        padding: "40px 16px",
                                        color: "hsl(var(--muted-foreground))",
                                    }}
                                >
                                    No leave allocations found
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((r) => (
                                <tr
                                    key={r.id}
                                    onClick={() => handleEdit(r)}
                                    style={{
                                        borderTop: border,
                                        cursor: "pointer",
                                        background: selectedId === r.id ? "hsl(var(--muted) / 0.3)" : "transparent",
                                    }}
                                >
                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{r.id}</td>
                                    <td style={tdStyle}>{r.jobRoleName}</td>
                                    <td style={tdStyle}>{r.leaveTypeName}</td>
                                    <td style={tdStyle}>{r.annualEntitlement}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(r);
                                                }}
                                                style={{ padding: 6, border: "none", borderRadius: 6, background: "transparent", color: "#f59e0b", cursor: "pointer" }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(r);
                                                    setShowDelete(true);
                                                }}
                                                style={{ padding: 6, border: "none", borderRadius: 6, background: "transparent", color: "#ef4444", cursor: "pointer" }}
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

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: 16,
                        borderTop: border,
                    }}
                >
                    <p style={{ margin: 0, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                        Showing {from} to {to} of {allocations.length} allocations
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button type="button" style={pageBtn(false)} onClick={() => setPage(Math.max(1, currentPage - 1))}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} type="button" style={pageBtn(currentPage === i + 1)} onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </button>
                        ))}
                        <button type="button" style={pageBtn(false)} onClick={() => setPage(Math.min(totalPages, currentPage + 1))}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {showDelete && (
                <div
                    onClick={() => setShowDelete(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        background: "rgba(0,0,0,0.6)",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: 440,
                            borderRadius: 12,
                            border: inputBorder,
                            background: "hsl(var(--card))",
                            padding: 24,
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span
                  style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                  }}
              >
                <AlertTriangle size={22} />
              </span>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Delete leave allocation?</h3>
                        </div>

                        <p style={{ margin: "0 0 20px", fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
                            You can delete this allocation permanently, or set it as inactive so it stays in the records but is no longer used.
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            <button type="button" style={{ ...btnDelete, flex: 1 }} onClick={deleteLeaveAllocate}>
                                <Trash2 size={18} /> Deleted
                            </button>
                            <button type="button" style={{ ...btnClear, flex: 1 }} onClick={setLeaveAllocateInactive}>
                                <Archive size={18} /> Set Inactive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};