import React, { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { globalApi } from "../../api/axios";
import { debounce } from "lodash";

interface LabTestDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess?: () => void;
}

const LabTestDrawer: React.FC<LabTestDrawerProps> = ({
    isOpen,
    onClose,
    initialData,
    onSuccess,
}) => {
    const isEdit = Boolean(initialData?.id);

    /* ------------------ FORM STATE ------------------ */
    const [form, setForm] = useState<any>({
        name: "",
        test_code: "",
        sample_type: "",
        temperature: "",
        description: "",
        special_instruction: "",
        method: "",
        reported_on: "",
        price: "",
        offer_price: "",
        category: "",
        child_tests: [] as string[],
    });

    /* ------------------ CATEGORY ------------------ */
    const [categories, setCategories] = useState<any[]>([]);

    /* ------------------ CHILD TEST SEARCH ------------------ */
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    /* ------------------ INIT ------------------ */
    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                category: initialData.category?.toString() || "",
                child_tests: initialData.child_tests || [],
            });
        }
    }, [initialData]);

    useEffect(() => {
        fetchCategories();
    }, []);

    /* ------------------ API CALLS ------------------ */

    const fetchCategories = async () => {
        try {
            const res = await globalApi.get(
                "crm/lab-category/?page=1&page_size=100"
            );
            setCategories(res.results || []);
        } catch {
            setCategories([]);
        }
    };

    const debouncedSearch = useMemo(
        () =>
            debounce(async (val: string) => {
                if (!val) {
                    setSearchResults([]);
                    return;
                }
                setLoadingSearch(true);
                try {
                    const res = await globalApi.get(
                        `crm/lab-tests/?page=1&page_size=10&search=${val}`
                    );
                    setSearchResults(res.results || []);
                } finally {
                    setLoadingSearch(false);
                }
            }, 400),
        []
    );

    /* ------------------ HANDLERS ------------------ */

    const handleChange = (key: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
    };

    const addChildTest = (name: string) => {
        if (form.child_tests.includes(name)) return;
        handleChange("child_tests", [...form.child_tests, name]);
        setSearch("");
        setSearchResults([]);
    };

    const removeChildTest = (name: string) => {
        handleChange(
            "child_tests",
            form.child_tests.filter((t: string) => t !== name)
        );
    };

    const handleSubmit = async () => {
        try {
            if (isEdit) {
                await globalApi.put(`crm/lab-tests/${initialData.id}/`, form);
            } else {
                await globalApi.post("crm/lab-tests/", form);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Lab test save failed", err);
            alert("Failed to save lab test");
        }
    };

    const addManualChildTest = () => {
        const value = search.trim();
        if (!value) return;

        if (!form.child_tests.includes(value)) {
            handleChange("child_tests", [...form.child_tests, value]);
        }

        setSearch("");
        setSearchResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* BACKDROP */}
            <div className="flex-1 bg-black/40" onClick={onClose} />

            {/* DRAWER */}
            <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-xl p-6">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {isEdit ? "Edit Lab Test" : "Create Lab Test"}
                    </h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* FORM */}
                <div className="space-y-4">
                    <Input label="Test Name" value={form.name} onChange={(v) => handleChange("name", v)} />
                    <Input label="Test Code" value={form.test_code} onChange={(v) => handleChange("test_code", v)} />

                    <Select
                        label="Category"
                        value={form.category}
                        onChange={(v) => handleChange("category", v)}
                        options={categories.map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                    />

                    <Input label="Sample Type" value={form.sample_type} onChange={(v) => handleChange("sample_type", v)} />
                    <Input label="Temperature" value={form.temperature} onChange={(v) => handleChange("temperature", v)} />
                    <Input label="Method" value={form.method} onChange={(v) => handleChange("method", v)} />
                    <Input label="Reported On" value={form.reported_on} onChange={(v) => handleChange("reported_on", v)} />
                    <Input label="Price" value={form.price} onChange={(v) => handleChange("price", v)} />
                    <Input label="Offer Price" value={form.offer_price} onChange={(v) => handleChange("offer_price", v)} />

                    {/* CHILD TEST SEARCH */}
                    <div>
                        <label className="text-sm font-medium">Add Child Tests</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    debouncedSearch(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addManualChildTest();
                                    }
                                }}
                                className="w-full pl-9 pr-3 py-2 border rounded-md"
                                placeholder="Search or type test name and press Enter"
                            />
                            {search.trim() && (
                                <button
                                    type="button"
                                    onClick={addManualChildTest}
                                    className="mt-2 text-sm text-primary hover:underline"
                                >
                                    + Add “{search}”
                                </button>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                                {searchResults.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => addChildTest(t.name)}
                                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    >
                                        {t.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TAGS */}
                    {form.child_tests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.child_tests.map((t: string) => (
                                <span
                                    key={t}
                                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {t}
                                    <button onClick={() => removeChildTest(t)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ACTION */}
                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-primary text-white py-2 rounded-lg"
                        >
                            {isEdit ? "Update Lab Test" : "Create Lab Test"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ------------------ REUSABLE INPUTS ------------------ */

const Input = ({ label, value, onChange }: any) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
        />
    </div>
);

const Select = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md"
        >
            <option value="">Select</option>
            {options.map((o: any) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

export default LabTestDrawer;
