import { useEffect, useState } from "react";
import axios from "axios";

const useFetchUserDetails = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/auth/me", {
                    withCredentials: true,
                });
                setUser(res.data.user);
            } catch (error:any) {
                setUser(null);
                setError(error.response?.data?.message || "Failed to fetch user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading, error };
};

export default useFetchUserDetails;
