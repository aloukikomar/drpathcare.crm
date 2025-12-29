// src/components/LabPackageDrawer.tsx
import React, { useEffect, useState, useCallback } from "react";
import { X, Search } from "lucide-react";
import { customerApi } from "../api/axios";

interface Props {
    open: boolean;
    onClose: () => void;
    initialData?: any; // null = create, object = edit
    onSuccess: () => void;
}

interface LabTest {
    id: number;
    name: string;
    test_code?: string;
}

const LabPackageDrawer: React.FC<Props> = ({ open, onClose, initialData, onSuccess }) => {
    const isEdit = !!initialData;

    // ------------------------------
    // FORM STATE
    // ------------------------------
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<number | null>(null);
    const [price, setPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);

    const [tests, setTests] = useState<LabTest[]>([]);
    const [testSearch, setTestSearch] = useState("");
    const [testResults, setTestResults] = useState<LabTest[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isAdmin = Boolean(user?.role?.name == 'Admin');

    // ------------------------------
    // LOAD CATEGORIES
    // ------------------------------
    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const res = await customerApi.get("/crm/lab-category/", {
                    params: { entity_type: "package", page_size: 500 },
                });
                setCategories(res.data.results || res.data || []);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        })();
    }, [open]);

    // ------------------------------
    // LOAD INITIAL VALUES (EDIT)
    // ------------------------------
    useEffect(() => {
        if (!open) return;

        if (isEdit && initialData) {
            setName(initialData.name || "");
            setDescription(initialData.description || "");
            setCategory(initialData.category || null);
            setPrice(initialData.price || "");
            setOfferPrice(initialData.offer_price || "");
            setIsFeatured(initialData.is_featured || false);
            setTests(initialData.tests || []);
        } else {
            // Reset create mode
            setName("");
            setDescription("");
            setCategory(null);
            setPrice("");
            setOfferPrice("");
            setIsFeatured(false);
            setTests([]);
        }
    }, [open, initialData]);

    // ------------------------------
    // SEARCH LAB TESTS (debounced)
    // ------------------------------
    useEffect(() => {
        if (!open) return;
        if (!testSearch.trim()) {
            setTestResults([]);
            return;
        }

        const t = setTimeout(async () => {
            setLoadingTests(true);
            try {
                const res = await customerApi.get("/crm/lab-tests/", {
                    params: { search: testSearch, page_size: 20 },
                });
                setTestResults(res.results || res.data || []);
            } catch (err) {
                console.error("Failed search tests", err);
            }
            setLoadingTests(false);
        }, 300);

        return () => clearTimeout(t);
    }, [testSearch, open]);

    // ------------------------------
    // ADD TEST
    // ------------------------------
    const addTest = (test: LabTest) => {
        if (tests.find((t) => t.id === test.id)) return;
        setTests([...tests, test]);
    };

    // ------------------------------
    // REMOVE TEST
    // ------------------------------
    const removeTest = (id: number) => {
        setTests(tests.filter((t) => t.id !== id));
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        const ok = window.confirm(
            "Are you sure you want to delete this lab package? This action cannot be undone."
        );
        if (!ok) return;

        try {
            await customerApi.delete(`crm/lab-packages/${initialData.id}/`);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete lab test");
        }
    };

    // ------------------------------
    // SUBMIT HANDLER
    // ------------------------------
    const handleSubmit = async () => {
        if (!name.trim()) return alert("Name is required");
        // if (!category) return alert("Category is required");
        if (!price.trim()) return alert("Price is required");
        if (tests.length === 0) return alert("At least one test is required");

        const payload = {
            name,
            description,
            category,
            price,
            offer_price: offerPrice,
            is_featured: isFeatured,
            test_ids: tests.map((t) => t.id),
        };

        try {
            if (isEdit) {
                await customerApi.patch(`/crm/lab-packages/${initialData.id}/`, payload);
            } else {
                await customerApi.post(`/crm/lab-packages/`, payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert("Failed to save package");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 z-[100]"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl flex flex-col z-[110]"
                role="dialog"
            >
                {/* HEADER */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Package" : "Create Package"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">

                    {/* NAME */}
                    <div>
                        <label className="font-medium">Name *</label>
                        <input
                            className="w-full border px-3 py-2 rounded mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="font-medium">Description</label>
                        <textarea
                            className="w-full border px-3 py-2 rounded mt-1"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="font-medium">Category *</label>
                        <select
                            className="w-full border px-3 py-2 rounded mt-1"
                            value={category ?? ""}
                            onChange={(e) => setCategory(Number(e.target.value))}
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PRICE + OFFER PRICE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium">Price *</label>
                            <input
                                type="number"
                                className="w-full border px-3 py-2 rounded mt-1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="font-medium">Offer Price</label>
                            <input
                                type="number"
                                className="w-full border px-3 py-2 rounded mt-1"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* FEATURED */}
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={() => setIsFeatured(!isFeatured)}
                        />
                        <label className="font-medium">Featured Package</label>
                    </div>

                    {/* ------------------------- */}
                    {/* SELECTED TESTS */}
                    {/* ------------------------- */}
                    <div>
                        <label className="font-medium">Tests *</label>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {tests.length === 0 ? (
                                <p className="text-gray-500 text-sm">No tests added</p>
                            ) : (
                                tests.map((t) => (
                                    <span
                                        key={t.id}
                                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs flex items-center gap-2"
                                    >
                                        {t.name}
                                        <button
                                            onClick={() => removeTest(t.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ------------------------- */}
                    {/* TEST SEARCH */}
                    {/* ------------------------- */}
                    <div>
                        <label className="font-medium">Add Test</label>

                        <div className="relative mt-1">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                                className="w-full border px-3 py-2 pl-10 rounded"
                                placeholder="Search tests…"
                                value={testSearch}
                                onChange={(e) => setTestSearch(e.target.value)}
                            />
                        </div>

                        {/* Search Results */}
                        {testSearch && (
                            <div className="border rounded mt-2 max-h-56 overflow-auto">
                                {loadingTests ? (
                                    <div className="p-3 text-gray-500 text-sm">Searching…</div>
                                ) : testResults.length === 0 ? (
                                    <div className="p-3 text-gray-500 text-sm">No results</div>
                                ) : (
                                    testResults.map((test) => (
                                        <button
                                            key={test.id}
                                            onClick={() => addTest(test)}
                                            className="w-full p-2 text-left hover:bg-gray-50 border-b"
                                        >
                                            {test.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end gap-3">
                    {isEdit && isAdmin && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border rounded text-sm border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            {/* <Trash2 className="w-4 h-4" /> */}
                            Delete
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary text-white rounded text-sm"
                    >
                        {isEdit ? "Save Changes" : "Create Package"}
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default LabPackageDrawer;
