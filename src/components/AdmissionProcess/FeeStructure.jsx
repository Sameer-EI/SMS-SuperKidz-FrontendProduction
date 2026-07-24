import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { fetchSchoolYear, fetchYearLevels } from "../../services/api/Api";

const initialFormState = {
    school_year: "",
    master_fee: "",
    fee_type: "",
    fee_amount: "",
    year_level: [],
};

const normalizeYearLevels = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item));
    }

    return [];
};

const formatAmount = (value) => {
    return String(value || 0);
};

const FeeStructure = () => {
    const { axiosInstance } = useContext(AuthContext);

    const [schoolYears, setSchoolYears] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [masterFees, setMasterFees] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [selectAll, setSelectAll] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: "",
        title: "",
        message: "",
        onConfirm: null,
        confirmText: "",
        cancelText: "",
        isConfirmButtonDanger: false,
    });

    const loadFormOptions = async () => {
        try {
            const [schoolYearsResponse, yearLevelsResponse, masterFeesResponse] = await Promise.all([
                fetchSchoolYear(),
                fetchYearLevels(),
                axiosInstance.get("/d/masterfees/"),
            ]);

            const normalizedSchoolYears = Array.isArray(schoolYearsResponse)
                ? schoolYearsResponse
                : schoolYearsResponse?.results || [];
            const normalizedYearLevels = Array.isArray(yearLevelsResponse)
                ? yearLevelsResponse
                : yearLevelsResponse?.results || [];
            const normalizedMasterFees = Array.isArray(masterFeesResponse?.data)
                ? masterFeesResponse.data
                : masterFeesResponse?.data?.results || [];

            setSchoolYears(normalizedSchoolYears);
            setYearLevels(normalizedYearLevels);
            setMasterFees(normalizedMasterFees);
        } catch (err) {
            console.error("Failed to load fee structure options", err);
            showModalMessage("error", "Error", "Unable to load school years or class levels right now.");
        }
    };

    const loadFeeStructures = async () => {
        try {
            const response = await axiosInstance.get("/d/feestructures/");
            const payload = response?.data;
            const list = Array.isArray(payload)
                ? payload
                : payload?.results || [];

            const normalizedList = list.map(item => ({
                ...item,
                student_fee_count: item.student_fee_count ?? 0,
                can_delete: item.can_delete ?? true,
            }));

            setFeeStructures(normalizedList);
        } catch (err) {
            console.error("Failed to load fee structures", err);
            showModalMessage("error", "Error", "Unable to load fee structures right now.");
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            await Promise.all([loadFormOptions(), loadFeeStructures()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        const allYearLevelIds = yearLevels
            .map(item => Number(item.id ?? item.year_level_id ?? item.value))
            .filter(id => !isNaN(id));

        const allSelected = allYearLevelIds.length > 0 &&
            allYearLevelIds.every(id => formData.year_level.includes(id));

        setSelectAll(allSelected);
    }, [formData.year_level, yearLevels]);

    const summaryCards = useMemo(() => {
        const totalFeeTypes = feeStructures.length;
        const uniqueYearLevels = new Set(
            feeStructures.flatMap((item) => normalizeYearLevels(item.year_level))
        );

        return [
            { label: "Fee structures", value: totalFeeTypes, icon: "fa-solid fa-list-ul" },
            { label: "Classes covered", value: uniqueYearLevels.size, icon: "fa-solid fa-school" },
            { label: "School years", value: schoolYears.length, icon: "fa-solid fa-calendar-days" },
        ];
    }, [feeStructures, schoolYears.length]);

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setErrorMessage("");
        setSuccessMessage("");
        setSelectAll(false);
    };

    const showModalMessage = (type, title, message, onConfirm = null, confirmText = "OK", cancelText = "Cancel", isConfirmButtonDanger = false) => {
        setModalConfig({
            type,
            title,
            message,
            onConfirm,
            confirmText,
            cancelText,
            isConfirmButtonDanger,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalConfig({
            type: "",
            title: "",
            message: "",
            onConfirm: null,
            confirmText: "",
            cancelText: "",
            isConfirmButtonDanger: false,
        });
    };

    const handleModalConfirm = () => {
        if (modalConfig.onConfirm) {
            modalConfig.onConfirm();
        }
        closeModal();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleYearLevelToggle = (yearLevelId) => {
        const value = Number(yearLevelId);
        setFormData((prev) => {
            const current = prev.year_level || [];
            const exists = current.includes(value);
            return {
                ...prev,
                year_level: exists
                    ? current.filter((item) => item !== value)
                    : [...current, value],
            };
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setFormData(prev => ({ ...prev, year_level: [] }));
        } else {
            const allIds = yearLevels
                .map(item => Number(item.id ?? item.year_level_id ?? item.value))
                .filter(id => !isNaN(id));
            setFormData(prev => ({ ...prev, year_level: allIds }));
        }
    };

    const handleEdit = (structure) => {
        setEditingId(structure.id);
        setFormData({
            school_year: structure.school_year?.toString() || "",
            master_fee: structure.master_fee?.toString() || "",
            fee_type: structure.fee_type || "",
            fee_amount: structure.fee_amount?.toString() || "",
            year_level: normalizeYearLevels(structure.year_level),
        });
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleDelete = (structure) => {
        if (structure.can_delete === false) {
            showModalMessage(
                "error",
                "Structure in Use",
                `This fee structure "${structure.fee_type || 'Unnamed fee'}" cannot be deleted because it is currently in use. ${structure.student_fee_count || 0} student(s) have already been assigned this fee structure.`,
                null,
                "OK",
                ""
            );
            return;
        }

        showModalMessage(
            "delete",
            "Confirm Deletion",
            `Are you sure you want to delete the fee structure "${structure.fee_type || 'Unnamed fee'}"? This action cannot be undone.`,
            () => confirmDelete(structure.id),
            "Delete",
            "Cancel",
            true
        );
    };

    const confirmDelete = async (id) => {
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/d/feestructures/${id}/`);
            showModalMessage(
                "success",
                "Success",
                "Fee structure deleted successfully.",
                null,
                "OK",
                ""
            );
            await refreshData();
        } catch (err) {
            console.error("Delete failed", err);
            showModalMessage(
                "error",
                "Error",
                "Unable to delete this fee structure right now."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!formData.school_year) {
            showModalMessage("error", "Validation Error", "Please select a school year.");
            return;
        }
        if (!formData.master_fee) {
            showModalMessage("error", "Validation Error", "Please select a master fee.");
            return;
        }
        if (!formData.fee_type.trim()) {
            showModalMessage("error", "Validation Error", "Please enter the fee type.");
            return;
        }
        if (!formData.fee_amount) {
            showModalMessage("error", "Validation Error", "Please enter the fee amount.");
            return;
        }
        if (!formData.year_level.length) {
            showModalMessage("error", "Validation Error", "Please select at least one class level.");
            return;
        }

        const amountNum = Number(formData.fee_amount);
        if (isNaN(amountNum) || amountNum < 0) {
            showModalMessage("error", "Validation Error", "Please enter a valid fee amount.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                school_year: Number(formData.school_year),
                master_fee: Number(formData.master_fee),
                fee_type: formData.fee_type.trim(),
                fee_amount: formatAmount(formData.fee_amount),
                year_level: formData.year_level.map((item) => Number(item)),
            };

            let response;
            if (editingId) {
                response = await axiosInstance.put(`/d/feestructures/${editingId}/`, payload);
                showModalMessage(
                    "success",
                    "Success",
                    "Fee structure updated successfully.",
                    null,
                    "OK",
                    ""
                );
            } else {
                response = await axiosInstance.post("/d/feestructures/", payload);
                showModalMessage(
                    "success",
                    "Success",
                    "Fee structure created successfully.",
                    null,
                    "OK",
                    ""
                );
            }

            resetForm();
            await refreshData();
        } catch (err) {
            console.error("Fee structure submit failed", err);
            console.error("Error response:", err?.response?.data);

            let errorMessage = "The request could not be completed.";
            if (err?.response?.data) {
                if (typeof err.response.data === "string") {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else {
                    const fieldErrors = Object.entries(err.response.data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
                        .join("\n");
                    if (fieldErrors) {
                        errorMessage = fieldErrors;
                    }
                }
            }

            showModalMessage(
                "error",
                "Error",
                errorMessage
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Modal Component
    const Modal = () => {
        if (!showModal) return null;

        const isDelete = modalConfig.type === "delete";
        const isError = modalConfig.type === "error";
        const isSuccess = modalConfig.type === "success";

        let icon = "";
        let iconColor = "";

        if (isDelete) {
            icon = "fa-solid fa-triangle-exclamation";
            iconColor = "text-amber-600";
        } else if (isError) {
            icon = "fa-solid fa-circle-xmark";
            iconColor = "text-red-600";
        } else if (isSuccess) {
            icon = "fa-solid fa-circle-check";
            iconColor = "text-emerald-600";
        }

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-start gap-3">
                        <div className={`text-3xl ${iconColor} mt-1`}>
                            <i className={icon} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900">
                                {modalConfig.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {modalConfig.message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        {modalConfig.onConfirm ? (
                            <>
                                <button
                                    onClick={handleModalConfirm}
                                    className={`flex-1 rounded-2xl px-4 py-3 font-semibold text-white transition ${modalConfig.isConfirmButtonDanger
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-violet-600 hover:bg-violet-700"
                                        }`}
                                >
                                    {modalConfig.confirmText}
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    {modalConfig.cancelText}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={closeModal}
                                className="w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
                            >
                                {modalConfig.confirmText || "OK"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto flex max-w-7xl items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
                    <div className="text-center">
                        <i className="fa-solid fa-spinner fa-spin text-3xl text-violet-600" />
                        <p className="mt-3 text-sm text-slate-600">Loading fee structures...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                    Fee Structure Configuration
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    Define and manage institutional fees, school years and applicable grade levels.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {editingId ? "Update fee structure" : "Create fee structure"}
                                    </h2>
                                </div>
                                {editingId ? (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-500 hover:text-violet-700"
                                    >
                                        Cancel edit
                                    </button>
                                ) : null}
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="space-y-2 text-sm font-medium text-slate-700">
                                        <span>School year</span>
                                        <select
                                            name="school_year"
                                            value={formData.school_year}
                                            onChange={handleInputChange}
                                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                                        >
                                            <option value="">Select school year</option>
                                            {schoolYears.map((item) => (
                                                <option key={item.id || item.year_name} value={item.id || item.year_name}>
                                                    {item.year_name || item.name || item.school_year_name || item.id}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2 text-sm font-medium text-slate-700">
                                        <span>Master category</span>
                                        <select
                                            name="master_fee"
                                            value={formData.master_fee}
                                            onChange={handleInputChange}
                                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                                        >
                                            <option value="">Select master category</option>
                                            {masterFees.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.payment_structure || item.name || item.master_fee_name || item.label || `Master Fee ${item.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="space-y-2 text-sm font-medium text-slate-700">
                                        <span>Fee type</span>
                                        <select
                                            name="fee_type"
                                            value={formData.fee_type}
                                            onChange={handleInputChange}
                                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                                        >
                                            <option value="">Select fee type</option>
                                            <option value="Admission Fee">Admission Fee</option>
                                            <option value="Caution Fee">Caution Fee</option>
                                            <option value="Tuition Fee">Tuition Fee</option>
                                            <option value="Exam Fee">Exam Fee</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Form Fee">Form Fee</option>
                                            <option value="Annual Charges">Annual Charges</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </label>

                                    <label className="space-y-2 text-sm font-medium text-slate-700">
                                        <span>Fee amount</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            name="fee_amount"
                                            value={formData.fee_amount}
                                            onChange={handleInputChange}
                                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                                            placeholder="2500"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-700">Applicable Year Levels</p>
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline transition"
                                        >
                                            {selectAll ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {yearLevels.map((item) => {
                                            const value = Number(item.id ?? item.year_level_id ?? item.value);
                                            const label = item.name || item.year_level_name || item.level_name || item.year_name || item.id;
                                            if (!value) return null;

                                            return (
                                                <label key={value} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.year_level.includes(value)}
                                                        onChange={() => handleYearLevelToggle(value)}
                                                        className="h-3 w-3 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                    />
                                                    <span className="text-xs">{label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-2xl bgTheme px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {submitting ? "Saving..." : editingId ? "Update fee structure" : "Create fee structure"}
                                </button>
                            </form>
                        </section>
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Existing Fee structures</h2>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {feeStructures.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                        No fee structures found yet. Create one from the form to get started.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Fee Type</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">Year</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Master Category</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Amount</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">Levels</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">In Use</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {feeStructures.map((structure) => {
                                                    const isInUse = structure.can_delete === false;
                                                    const studentCount = structure.student_fee_count || 0;
                                                    const schoolYear = schoolYears.find(year => year.id === structure.school_year);
                                                    const schoolYearName = schoolYear ? schoolYear.year_name : structure.school_year || "—";
                                                    const masterFee = masterFees.find(fee => fee.id === structure.master_fee);
                                                    const masterFeeName = masterFee ? (masterFee.payment_structure || masterFee.name || masterFee.master_fee_name || masterFee.label) : structure.master_fee || "—";
                                                    const yearLevelLabels = normalizeYearLevels(structure.year_level).length
                                                        ? normalizeYearLevels(structure.year_level).map((yearLevelId) => {
                                                            const matchingLevel = yearLevels.find((level) => Number(level.id ?? level.year_level_id ?? level.value) === yearLevelId);
                                                            return matchingLevel
                                                                ? matchingLevel.name || matchingLevel.year_level_name || matchingLevel.level_name || matchingLevel.year_name || yearLevelId
                                                                : yearLevelId;
                                                        }).join(', ')
                                                        : 'No classes linked';

                                                    return (
                                                        <tr key={structure.id} className="hover:bg-slate-50 transition">
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                                {structure.fee_type || "Unnamed fee"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-600">{schoolYearName}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 text-center">{masterFeeName}</td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">₹{formatAmount(structure.fee_amount)}</td>
                                                            <td className="px-4 py-3 text-sm text-slate-600">{yearLevelLabels}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {isInUse ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                                                                        <i className="fa-solid fa-users text-[10px]" />
                                                                        Yes ({studentCount})
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
                                                                        <i className="fa-solid fa-check-circle text-[10px]" />
                                                                        No
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEdit(structure)}
                                                                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-violet-500 hover:text-violet-700 hover:bg-violet-50"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(structure)}
                                                                        disabled={deletingId === structure.id || isInUse}
                                                                        className={`rounded-xl px-3 py-1.5 text-sm font-medium text-white transition ${isInUse
                                                                            ? "bg-slate-300 cursor-not-allowed opacity-60"
                                                                            : "bg-red-600 hover:bg-red-700"
                                                                            }`}
                                                                        title={isInUse ? `Cannot delete - ${studentCount} student(s) assigned` : ""}
                                                                    >
                                                                        {deletingId === structure.id ? "Deleting..." : "Delete"}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal />
        </>
    );
};

export default FeeStructure;