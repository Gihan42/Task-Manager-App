import {
  useState,
  useEffect,
  type CSSProperties,
  type ReactNode,
  type InputHTMLAttributes,
} from "react";
import {
  CalendarOff,
  FileText,
  ShieldCheck,
  Power,
  Save,
  Trash2,
  Eraser,
  Search,
  Pencil,
  PlusCircle,
  AlertTriangle,
  Archive,
} from "lucide-react";

const border = "1px solid hsl(var(--border))";
const inputBorder = "1px solid hsl(var(--foreground) / 0.35)";

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/+$/, "");

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
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16,
  width: "100%",
};

const themeCss = `
.lt-input { color-scheme: light; }
.dark .lt-input { color-scheme: dark; }
.lt-input {
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
.lt-input::placeholder {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 1;
}
.lt-input:focus {
    border-color: hsl(var(--primary)) !important;
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.25) !important;
}
`;

interface LeaveTypeRow {
  id: string;
  leaveTypeName: string;
  description: string;
  requiresApproval: boolean;
  status: boolean;
}

interface LeaveTypeForm {
  leaveTypeName: string;
  description: string;
  requiresApproval: boolean;
  status: boolean;
}

const emptyForm: LeaveTypeForm = {
  leaveTypeName: "",
  description: "",
  requiresApproval: false,
  status: true,
};

const columns = [
  "ID",
  "Leave Type",
  "Description",
  "Requires Approval",
  "Status",
  "Actions",
];

const toRow = (item: any): LeaveTypeRow => ({
  id: String(item.id ?? item.leaveTypeId ?? item._id ?? ""),
  leaveTypeName: item.leaveTypeName ?? "",
  description: item.description ?? "",
  requiresApproval: Boolean(item.requiresApproval),
  status: Boolean(item.status),
});

const getToken = () =>
  localStorage.getItem("access_token") ?? localStorage.getItem("token") ?? "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const readError = async (response: Response, fallback: string) => {
  const err = await response.json().catch(() => null);
  const msg = Array.isArray(err?.message)
    ? err.message.join(", ")
    : err?.message;
  return `${response.status}: ${msg || fallback}`;
};

const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input className="lt-input" {...props} />
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

const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    style={{
      position: "relative",
      width: 48,
      height: 26,
      padding: 0,
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      flexShrink: 0,
      background: checked ? "#10b981" : "#6b7280",
      transition: "background 0.2s",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: 3,
        left: checked ? 25 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        transition: "left 0.2s",
      }}
    />
  </button>
);

const ToggleRow = ({
  icon: Icon,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: any;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      borderRadius: 8,
      border: inputBorder,
      background: "hsl(var(--muted) / 0.2)",
      padding: "12px 16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Icon
        size={20}
        style={{ color: "hsl(var(--foreground))", flexShrink: 0 }}
      />
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{title}</p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

const Badge = ({
  active,
  yes,
  no,
}: {
  active: boolean;
  yes: string;
  no: string;
}) => (
  <span
    style={{
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
      background: active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      color: active ? "#10b981" : "#ef4444",
    }}
  >
    {active ? yes : no}
  </span>
);

export const LeaveType = () => {
  const [form, setForm] = useState<LeaveTypeForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRow[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = leaveTypes.filter((r) =>
    `${r.id} ${r.leaveTypeName} ${r.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    getAllLeaveType();
  }, []);

  const getAllLeaveType = async () => {
    try {
      const response = await fetch(`${API_URL}/leave-type`, {
        method: "GET",
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to load leave types"),
        );
      }

      const resJson = await response.json();
      const list = Array.isArray(resJson) ? resJson : (resJson?.data ?? []);
      setLeaveTypes(list.map(toRow));
    } catch (error: any) {
      console.error("Error fetching leave types:", error);
      setErrorMsg(error.message);
    }
  };

  const createLeaveType = async (formData: LeaveTypeForm) => {
    setErrorMsg("");
    try {
      const response = await fetch(`${API_URL}/leave-type/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          leaveTypeName: formData.leaveTypeName,
          description: formData.description,
          requiresApproval: formData.requiresApproval,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to create leave type"),
        );
      }

      await response.json();
      await getAllLeaveType();
      handleClear();
    } catch (error: any) {
      console.error("Error creating leave type:", error);
      setErrorMsg(error.message);
    }
  };

  const updateLeaveType = async (formData: LeaveTypeForm) => {
    setErrorMsg("");
    if (!selectedId) {
      setErrorMsg("Select a leave type from the table first");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/leave-type/update/${selectedId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            leaveTypeName: formData.leaveTypeName,
            description: formData.description,
            requiresApproval: formData.requiresApproval,
            status: formData.status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to update leave type"),
        );
      }

      await response.json();
      await getAllLeaveType();
      handleClear();
    } catch (error: any) {
      console.error("Error updating leave type:", error);
      setErrorMsg(error.message);
    }
  };

  const deleteLeaveTypePermanently = async () => {
    setErrorMsg("");
    if (!selectedId) {
      setErrorMsg("Select a leave type from the table first");
      setShowDelete(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/leave-type/delete/${selectedId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to delete leave type"),
        );
      }

      await getAllLeaveType();
      handleClear();
    } catch (error: any) {
      console.error("Error deleting leave type:", error);
      setErrorMsg(error.message);
    } finally {
      setShowDelete(false);
    }
  };

  const setLeaveTypeInactive = async () => {
    setErrorMsg("");
    if (!selectedId) {
      setErrorMsg("Select a leave type from the table first");
      setShowDelete(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/leave-type/delete/${selectedId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            leaveTypeName: form.leaveTypeName,
            description: form.description,
            requiresApproval: form.requiresApproval,
            status: false,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to set leave type inactive"),
        );
      }

      await getAllLeaveType();
      handleClear();
    } catch (error: any) {
      console.error("Error setting leave type inactive:", error);
      setErrorMsg(error.message);
    } finally {
      setShowDelete(false);
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setSelectedId(null);
  };

  const handleEdit = (row: LeaveTypeRow) => {
    setErrorMsg("");
    setSelectedId(row.id);
    setForm({
      leaveTypeName: row.leaveTypeName,
      description: row.description,
      requiresApproval: row.requiresApproval,
      status: row.status,
    });
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in" style={{ minWidth: 0 }}>
      <style>{themeCss}</style>

      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Leave Type Manage
        </h1>
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
          <Field label="Leave Type Name" icon={CalendarOff}>
            <TextInput
              placeholder="Annual Leave"
              value={form.leaveTypeName}
              onChange={(e) =>
                setForm({ ...form, leaveTypeName: e.target.value })
              }
            />
          </Field>
          <Field label="Description" icon={FileText}>
            <TextInput
              placeholder="Short description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
        </div>

        <div style={gridStyle}>
          <ToggleRow
            icon={ShieldCheck}
            title="Requires approval"
            subtitle="Leave requests need manager approval"
            checked={form.requiresApproval}
            onChange={() =>
              setForm({ ...form, requiresApproval: !form.requiresApproval })
            }
          />
          <ToggleRow
            icon={Power}
            title="Active status"
            subtitle="Inactive leave types cannot be selected"
            checked={form.status}
            onChange={() => setForm({ ...form, status: !form.status })}
          />
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

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => createLeaveType(form)}
            style={btnCreate}
          >
            <PlusCircle size={18} /> Create
          </button>
          <button
            type="button"
            onClick={() => updateLeaveType(form)}
            style={btnUpdate}
          >
            <Save size={18} /> Update
          </button>
          <button
            type="button"
            style={btnDelete}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={18} /> Delete
          </button>
          <button type="button" style={btnClear} onClick={handleClear}>
            <Eraser size={18} /> Clear
          </button>
        </div>
      </div>

      <div
        className="bg-card shadow-lg"
        style={{ borderRadius: 10, border, minWidth: 0 }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: 16,
            borderBottom: border,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Leave Types
          </h2>
          <div style={{ position: "relative", width: 260, maxWidth: "100%" }}>
            <span style={iconWrapStyle}>
              <Search size={16} />
            </span>
            <TextInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
                {columns.map((c) => (
                  <th key={c} style={thStyle}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
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
                    No leave types found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => handleEdit(r)}
                    style={{
                      borderTop: border,
                      cursor: "pointer",
                      background:
                        selectedId === r.id
                          ? "hsl(var(--muted) / 0.3)"
                          : "transparent",
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{r.id}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.leaveTypeName}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {r.description || "-"}
                    </td>
                    <td style={tdStyle}>
                      <Badge active={r.requiresApproval} yes="Yes" no="No" />
                    </td>
                    <td style={tdStyle}>
                      <Badge active={r.status} yes="Active" no="Inactive" />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(r);
                          }}
                          style={{
                            padding: 6,
                            border: "none",
                            borderRadius: 6,
                            background: "transparent",
                            color: "#f59e0b",
                            cursor: "pointer",
                          }}
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
                          style={{
                            padding: 6,
                            border: "none",
                            borderRadius: 6,
                            background: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
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
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Delete leave type?
              </h3>
            </div>

            <p
              style={{
                margin: "0 0 20px",
                fontSize: 14,
                color: "hsl(var(--muted-foreground))",
                lineHeight: 1.5,
              }}
            >
              You can delete this leave type permanently, or mark it as inactive
              so it stays in the records but can no longer be used.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button
                type="button"
                style={{ ...btnDelete, flex: 1 }}
                onClick={deleteLeaveTypePermanently}
              >
                <Trash2 size={18} /> Permanently
              </button>
              <button
                type="button"
                style={{ ...btnClear, flex: 1 }}
                onClick={setLeaveTypeInactive}
              >
                <Archive size={18} /> Set Inactive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
