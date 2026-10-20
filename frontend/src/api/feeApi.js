const BASE_URL = import.meta.env.VITE_API_URL || "https://assign-6-mern-fee-collection-receipt-g7gj.onrender.com/api";

const getHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
});

export const getFeesApi = async (token) => {
    const res = await fetch(`${BASE_URL}/fees`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch fees");
    return data;
};

export const getFeeByIdApi = async (token, id) => {
    const res = await fetch(`${BASE_URL}/fees/${id}`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch fee");
    return data;
};

export const createFeeApi = async (token, formData) => {
    const res = await fetch(`${BASE_URL}/fees`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create fee");
    return data;
};

export const updateFeeApi = async (token, id, formData) => {
    const res = await fetch(`${BASE_URL}/fees/${id}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update fee");
    return data;
};

export const deleteFeeApi = async (token, id) => {
    const res = await fetch(`${BASE_URL}/fees/${id}`, {
        method: "DELETE",
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete fee");
    return data;
};

export const recordPaymentApi = async (token, formData) => {
    const res = await fetch(`${BASE_URL}/payments`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to record payment");
    return data;
};

export const getMyPaymentsApi = async (token) => {
    const res = await fetch(`${BASE_URL}/payments/my`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch payments");
    return data;
};

export const getStudentPaymentsApi = async (token, studentId) => {
    const res = await fetch(`${BASE_URL}/payments/student/${studentId}`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch student payments");
    return data;
};

export const getReceiptApi = async (token, receiptNo) => {
    const res = await fetch(`${BASE_URL}/payments/receipt/${receiptNo}`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch receipt");
    return data;
};

export const getStudentsApi = async (token) => {
    const res = await fetch(`${BASE_URL}/payments/students`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data;
};

export const getStudentFeeSummaryApi = async (token, studentId) => {
    const res = await fetch(`${BASE_URL}/payments/students/${studentId}/fees`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch fee summary");
    return data;
};

export const getDashboardApi = async (token) => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
        headers: getHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard data");
    return data;
};
