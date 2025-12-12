import React, { useCallback, useEffect, useState } from "react";
import { X, Plus, Search as SearchIcon } from "lucide-react";
import { customerApi } from "../api/axios";
import SelectedPatientChip from "./SelectedPatientChip";

type Product = any;
type Patient = any;

export interface ItemRow {
    id: number;
    patient: Patient;
    itemType: "lab_test" | "lab_package";
    item: Product;
    price: string;
    offer_price: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    customer: any;
    items: ItemRow[];
    setItems: (items: ItemRow[]) => void;
    onOpenAddPatient?: () => void;
    refreshKey: number;
}

const DEBOUNCE_MS = 250;

export default function PatientTestsDrawer({
    open,
    onClose,
    customer,
    items,
    setItems,
    onOpenAddPatient,
    refreshKey,
}: Props) {
    const [mode, setMode] = useState<"lab_test" | "lab_package">("lab_test");
    const [query, setQuery] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);

    // ------------------------
    // DEBOUNCE SEARCH
    // ------------------------
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [query]);

    // ------------------------
    // FETCH PRODUCTS
    // ------------------------
    const fetchProducts = useCallback(async () => {
        if (!open) return;
        setLoadingProducts(true);

        try {
            const endpoint =
                mode === "lab_test" ? "/crm/lab-tests/" : "/crm/lab-packages/";
            const res = await customerApi.get(endpoint, {
                params: { page_size: 10, search: debouncedQ || undefined },
            });

            const list = res?.results ?? res?.data?.results ?? res?.data ?? [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Product fetch error:", err);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, [open, mode, debouncedQ]);

    useEffect(() => {
        if (open) fetchProducts();
    }, [open, mode, debouncedQ, refreshKey, fetchProducts]);

    // ------------------------
    // FETCH PATIENTS
    // ------------------------
    const fetchPatients = useCallback(async () => {
        if (!open || !customer?.id) return;
        setLoadingPatients(true);

        try {
            const res = await customerApi.get("/crm/patients/", {
                params: { page_size: 10, customer: customer.id },
            });

            const list = res?.results ?? res?.data ?? [];
            setPatients(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Patient fetch error:", err);
            setPatients([]);
        } finally {
            setLoadingPatients(false);
        }
    }, [open, customer]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients, refreshKey]);

    // ------------------------
    // PATIENT SELECTION
    // ------------------------
    const togglePatient = (p: Patient) => {
        setSelectedPatients((prev) =>
            prev.find((x) => x.id === p.id)
                ? prev.filter((x) => x.id !== p.id)
                : [...prev, p]
        );
    };

    const removePatient = (p: Patient) =>
        setSelectedPatients((prev) => prev.filter((x) => x.id !== p.id));

    // ------------------------
    // SAVE
    // ------------------------
    const handleSave = () => {
        if (!selectedProduct) return alert("Select a test/package first");
        if (selectedPatients.length === 0)
            return alert("Select at least one patient");

        const batch: ItemRow[] = selectedPatients.map((p) => ({
            id: Date.now() + Math.random(),
            patient: p,
            itemType: mode,
            item: selectedProduct,
            price: String(selectedProduct.price ?? selectedProduct.offer_price ?? "0"),
            offer_price: String(
                selectedProduct.offer_price ?? selectedProduct.price ?? "0"
            ),
        }));

        setItems([...items, ...batch]);
        setSelectedProduct(null)
        setSelectedPatients([])
        onClose();
    };

    const productLabel = (p: Product) => p?.name ?? p?.title ?? `Item #${p.id}`;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            {/* DRAWER PANEL */}
            <aside className="
        relative ml-auto w-full sm:w-[600px] md:w-[660px] 
        h-full bg-white shadow-xl flex flex-col
      ">
                {/* ---------------- HEADER ---------------- */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="text-lg font-semibold">Add Item</div>

                    <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* ---------------- CONTENT ---------------- */}
                <div className="flex-1 overflow-auto p-4 space-y-4">

                    {/* INLINE MODE + SEARCH + ADD PATIENT */}
                    <div className="flex items-center gap-2">
                        <select
                            className="border px-3 py-2 rounded text-sm"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                        >
                            <option value="lab_test">Lab Tests</option>
                            <option value="lab_package">Lab Packages</option>
                        </select>

                        <div className="relative flex-1">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search tests or packages..."
                                className="w-full border rounded px-3 py-2 pl-10 text-sm"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>


                    </div>

                    {/* PRODUCT LIST OR SELECTED PRODUCT CARD */}
                    {!selectedProduct ? (
                        <div className="space-y-2 max-h-[300px] overflow-auto">
                            {loadingProducts ? (
                                <div className="text-sm text-gray-500 py-4 text-center">
                                    Loading…
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-sm text-gray-500 py-4 text-center">
                                    No results found
                                </div>
                            ) : (
                                products.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedProduct(p)}
                                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">{productLabel(p)}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {mode === "lab_package" &&
                                                    `Contains ${(p.tests || []).length} tests`}
                                            </div>
                                        </div>

                                        <div className="text-right text-sm font-semibold">
                                            ₹{p.offer_price ?? p.price}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="p-3 border rounded bg-primary/5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{productLabel(selectedProduct)}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ₹{selectedProduct.offer_price ?? selectedProduct.price}
                                    </div>
                                </div>

                                <button
                                    className="text-xs text-red-600"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PATIENT LIST */}
                    <div>
                        {/* Header Row */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Patients</div>

                            <button
                                onClick={() => onOpenAddPatient?.()}
                                className="px-3 py-2 bg-primary text-white rounded flex items-center gap-1 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>

                        {/* Patient List */}
                        <div className="mt-2 max-h-[200px] overflow-auto space-y-2">
                            {loadingPatients ? (
                                <div className="text-sm text-gray-500 py-4">Loading…</div>
                            ) : patients.length === 0 ? (
                                <div className="text-sm text-gray-500 py-4">No patients</div>
                            ) : (
                                patients.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePatient(p)}
                                        className={`
            w-full text-left border rounded px-3 py-2 text-sm flex items-center justify-between 
            ${selectedPatients.find((x) => x.id === p.id)
                                                ? "bg-primary/10 border-primary"
                                                : "hover:bg-gray-50"}
          `}
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {p.first_name} {p.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {p.user_mobile}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {p.age} • {p.gender}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>


                    {/* SELECTED PATIENT CHIPS */}
                    <div>
                        <div className="text-sm font-semibold mb-1">Selected Patients</div>
                        <div className="flex flex-wrap gap-2">
                            {selectedPatients.length === 0 ? (
                                <p className="text-xs text-gray-500">None</p>
                            ) : (
                                selectedPatients.map((p) => (
                                    <SelectedPatientChip
                                        key={p.id}
                                        patient={p}
                                        onRemove={() => removePatient(p)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-3 py-2 border rounded text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!selectedProduct || selectedPatients.length === 0}
                        className={`
              px-4 py-2 rounded text-white text-sm 
              ${!selectedProduct || selectedPatients.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"}
            `}
                    >
                        Add Item
                    </button>
                </div>
            </aside>
        </div>
    );
}
