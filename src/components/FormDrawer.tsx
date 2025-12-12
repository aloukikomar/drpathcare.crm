// src/components/FormDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { customerApi } from "../api/axios"; // adjust path if needed

type Option = { label: string; value: any };

export type FormField =
    | {
        name: string;
        label: string;
        type:
        | "text"
        | "textarea"
        | "number"
        | "select"
        | "date"
        | "time"
        | "file"
        | "checkbox"
        | "switch";
        required?: boolean;
        disabled?: boolean;
        placeholder?: string;
        options?: Option[]; // only for select
        // optional helper text shown below the control
        helper?: string;
        default?: any;
    };

export interface FormDrawerProps {
    open: boolean;
    onClose: () => void;

    heading: string | React.ReactNode;
    subHeading?: string | React.ReactNode;

    apiUrl: string | null; // full endpoint or null (view only local)
    method?: "POST" | "PATCH";
    initialData?: Record<string, any> | null;

    formFields: FormField[];

    // optional transform before sending to API
    transformPayload?: (payload: Record<string, any>) => any | Promise<any>;

    onSuccess?: (resp: any) => void;
    onError?: (err: any) => void;

    // If true, drawer behaves read-only (hides submit)
    readOnly?: boolean;

    // optional className for panel
    className?: string;
}

/**
 * FormDrawer
 *
 * Usage notes:
 * - Provide `apiUrl` as the endpoint to POST or PATCH.
 * - If `initialData` is provided and method is not set, PATCH will be used.
 * - If any field.type === "file", form sends FormData automatically.
 */
export default function FormDrawer({
    open,
    onClose,
    heading,
    subHeading,
    apiUrl,
    method,
    initialData = null,
    formFields,
    transformPayload,
    onSuccess,
    onError,
    readOnly = false,
    className,
}: FormDrawerProps) {
    // Local state map for fields
    const initialValues = useMemo(() => {
        const map: Record<string, any> = {};

        formFields.forEach((f) => {
            const hasInitial = initialData && initialData[f.name] !== undefined && initialData[f.name] !== null;

            if (hasInitial) {
                map[f.name] = initialData![f.name];
                return;
            }

            // <-- THE IMPORTANT FIX: use field.default if defined
            if (f.default !== undefined) {
                map[f.name] = f.default;
                return;
            }

            // fallback behaviour
            switch (f.type) {
                case "checkbox":
                case "switch":
                    map[f.name] = false;
                    break;
                case "file":
                    map[f.name] = null;
                    break;
                default:
                    map[f.name] = "";
            }
        });

        return map;
    }, [formFields, initialData]);


    const [values, setValues] = useState<Record<string, any>>(initialValues);
    const [fileNames, setFileNames] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // re-sync when initialData or open changes
    useEffect(() => {
        setValues(initialValues);
        setErrors({});
        setGlobalError(null);
        setFileNames({});
        // fill fileNames if initialData contains some preview url/names
        if (initialData) {
            const fnames: Record<string, string> = {};
            formFields.forEach((f) => {
                if (f.type === "file" && initialData[f.name]) {
                    // if API returns a url or name, attempt to show something
                    const val = initialData[f.name];
                    if (typeof val === "string") fnames[f.name] = val;
                }
            });
            setFileNames(fnames);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues, open, initialData]);

    // detect if any file field exists (used to decide FormData)
    const hasFileField = useMemo(
        () => formFields.some((f) => f.type === "file"),
        [formFields]
    );

    const detectMethod = (): "POST" | "PATCH" => {
        if (method) return method;
        // if initialData present, we assume PATCH/update; otherwise create
        return initialData ? "PATCH" : "POST";
    };

    const isViewOnly = readOnly || formFields.every((f) => f.disabled === true);

    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setGlobalError(null);
    };

    const handleFileChange = (name: string, file: File | null) => {
        handleChange(name, file);
        setFileNames((prev) => ({ ...prev, [name]: file ? file.name : "" }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        formFields.forEach((f) => {
            if (f.required && !f.disabled) {
                const val = values[f.name];
                if (f.type === "file") {
                    if (!val) newErrors[f.name] = "Please upload a file.";
                } else if (f.type === "checkbox" || f.type === "switch") {
                    // checkbox may be required true
                    if (val !== true) newErrors[f.name] = "Required";
                } else {
                    if (val === "" || val === null || typeof val === "undefined") {
                        newErrors[f.name] = `${f.label || f.name} is required.`;
                    }
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = async (): Promise<{ body: any; headers?: Record<string, string> }> => {
        // If any file field is present and has a File -> FormData
        const useFormData = hasFileField && Object.values(values).some((v) => v instanceof File);
        if (useFormData) {
            const fd = new FormData();
            Object.keys(values).forEach((k) => {
                const val = values[k];
                // For boolean -> convert to 'true'/'false' (FormData stores strings)
                if (val instanceof File) {
                    fd.append(k, val);
                } else if (typeof val === "boolean") {
                    fd.append(k, val ? "true" : "false");
                } else if (val !== undefined && val !== null) {
                    // arrays or objects — stringify
                    if (Array.isArray(val) || typeof val === "object") {
                        fd.append(k, JSON.stringify(val));
                    } else {
                        fd.append(k, String(val));
                    }
                }
            });

            // allow transformPayload to mutate FormData or return a new FormData
            if (transformPayload) {
                const transformed = await transformPayload(fd as any);
                // if transform returned something, use it
                if (transformed instanceof FormData) {
                    return { body: transformed };
                } else {
                    return { body: fd };
                }
            }

            return { body: fd, headers: { "Content-Type": "multipart/form-data" } };
        }

        // JSON body
        let payload: Record<string, any> = {};
        Object.keys(values).forEach((k) => {
            const val = values[k];
            // if File left in non-file field ignore
            if (val instanceof File) return;
            payload[k] = val;
        });

        if (transformPayload) {
            const transformed = await transformPayload(payload);
            return { body: transformed };
        }

        return { body: payload, headers: { "Content-Type": "application/json" } };
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setGlobalError(null);

        if (isViewOnly) {
            return onClose();
        }

        if (!validate()) {
            setGlobalError("Please fix validation errors.");
            return;
        }

        if (!apiUrl) {
            setGlobalError("No API URL configured for this form.");
            return;
        }

        const httpMethod = detectMethod();
        setLoading(true);

        try {
            const { body, headers } = await buildPayload();

            // choose customerApi; using customerApi so auth header is attached automatically
            const url = apiUrl;

            let resp;
            if (httpMethod === "POST") {
                resp = await customerApi.post(url, body, headers ? { headers } : undefined);
            } else {
                // PATCH
                resp = await customerApi.patch(url, body, headers ? { headers } : undefined);
            }

            setLoading(false);
            onSuccess?.(resp);
            onClose();
        } catch (err: any) {
            console.error("FormDrawer submit error:", err);
            const msg = (err && err.serverMessage) || "Failed to submit";
            setGlobalError(msg);
            onError?.(err);
            setLoading(false);
        }
    };

    // keyboard: close on Escape
    useEffect(() => {
        const handler = (ev: KeyboardEvent) => {
            if (ev.key === "Escape" && open) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Drawer styles: responsive: full screen on xs, panel on md+
    if (!open) return null;

    return (
        <div
            className="fixed !mt-0 inset-0 z-[999] flex"
            aria-modal="true"
            role="dialog"
        >
            {/* backdrop */}
            <div
                className="fixed inset-0 bg-black/40"
                onClick={() => {
                    if (!loading) onClose();
                }}
            />

            {/* Drawer panel */}
            <div
                className={`ml-auto relative bg-white h-full overflow-y-auto ${className ?? ""}`}
                style={{
                    width: "min(100%, 640px)",
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b">
                    <div>
                        <div className="text-lg font-semibold">{heading}</div>
                        {subHeading && <div className="text-sm text-gray-600 mt-1">{subHeading}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                        {loading && (
                            <div className="text-sm text-gray-500 mr-2">Saving...</div>
                        )}
                        <button
                            onClick={() => {
                                if (!loading) onClose();
                            }}
                            aria-label="Close drawer"
                            className="p-2 rounded hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        {formFields.map((field) => {
                            const value = values[field.name];
                            const disabled = !!field.disabled || isViewOnly;
                            const fieldError = errors[field.name];

                            return (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label} {field.required && !disabled && <span className="text-red-500">*</span>}
                                    </label>

                                    {/* Render input by type */}
                                    {field.type === "text" && (
                                        <input
                                            type="text"
                                            value={value ?? ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            disabled={disabled}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                                        />
                                    )}

                                    {field.type === "textarea" && (
                                        <textarea
                                            value={value ?? ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            disabled={disabled}
                                            rows={4}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                                        />
                                    )}

                                    {field.type === "number" && (
                                        <input
                                            type="number"
                                            value={value ?? ""}
                                            onChange={(e) => handleChange(field.name, e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder={field.placeholder}
                                            disabled={disabled}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                                        />
                                    )}

                                    {field.type === "select" && (
                                        <select
                                            value={
                                                values[field.name] !== undefined && values[field.name] !== null
                                                    ? String(values[field.name])
                                                    : ""
                                            }
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            disabled={disabled}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"
                                                }`}
                                        >
                                            <option value="">— Select —</option>

                                            {field.options?.map((opt) => (
                                                <option key={String(opt.value)} value={String(opt.value)}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>

                                    )}


                                    {field.type === "date" && (
                                        <input
                                            type="date"
                                            value={value ?? ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            disabled={disabled}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                                        />
                                    )}

                                    {field.type === "time" && (
                                        <input
                                            type="time"
                                            value={value ?? ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            disabled={disabled}
                                            className={`w-full border rounded px-3 py-2 text-sm ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                                        />
                                    )}

                                    {field.type === "file" && (
                                        <>
                                            <label className={`flex items-center gap-3 ${disabled ? "opacity-70" : ""}`}>
                                                <div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0] ?? null;
                                                            handleFileChange(field.name, f);
                                                        }}
                                                        disabled={disabled}
                                                        className="hidden"
                                                        id={`fd-${field.name}`}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <label
                                                            htmlFor={`fd-${field.name}`}
                                                            className={`inline-block px-3 py-2 rounded border text-sm cursor-pointer ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}
                                                        >
                                                            Choose file
                                                        </label>
                                                        <div className="text-sm text-gray-600">
                                                            {fileNames[field.name] || (typeof value === "string" ? value : "") || "No file chosen"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </>
                                    )}

                                    {(field.type === "checkbox" || field.type === "switch") && (
                                        <div className="flex items-center">
                                            <input
                                                id={`cb-${field.name}`}
                                                type="checkbox"
                                                checked={Boolean(value)}
                                                onChange={(e) => handleChange(field.name, e.target.checked)}
                                                disabled={disabled}
                                                className="h-4 w-4"
                                            />
                                            <label htmlFor={`cb-${field.name}`} className="ml-2 text-sm text-gray-700">
                                                {field.helper || ""}
                                            </label>
                                        </div>
                                    )}

                                    {/* helper / error */}
                                    {field.helper && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
                                    {fieldError && <div className="text-xs text-red-600 mt-1">{fieldError}</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* global error */}
                    {globalError && <div className="mt-4 text-sm text-red-600">{globalError}</div>}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                if (!loading) onClose();
                            }}
                            className="px-3 py-2 rounded border text-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        {!isViewOnly && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded bg-[#635bff] text-white text-sm disabled:opacity-60"
                            >
                                {loading ? "Saving..." : detectMethod() === "POST" ? "Create" : "Update"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
