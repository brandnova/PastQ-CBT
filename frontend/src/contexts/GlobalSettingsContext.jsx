import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GlobalSettingsContext = createContext();

export const GlobalSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/globalsettings');
            setSettings(response.data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch global settings", error);
            setError("Failed to fetch global settings. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const value = {
        settings,
        loading,
        error,
        refetch: fetchSettings
    };

    return (
        <GlobalSettingsContext.Provider value={value}>
            {children}
        </GlobalSettingsContext.Provider>
    );
};

export const useGlobalSettings = () => {
    const context = useContext(GlobalSettingsContext);
    if (context === undefined) {
        throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider');
    }
    return context;
};