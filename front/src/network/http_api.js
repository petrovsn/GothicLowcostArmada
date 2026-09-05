const API_URL = import.meta.env.VITE_API_URL || "";


export async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        let detail;

        try {
            detail = await response.json();
        } catch {
            detail = await response.text();
        }

        const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
        );

        error.status = response.status;
        error.detail = detail;

        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


