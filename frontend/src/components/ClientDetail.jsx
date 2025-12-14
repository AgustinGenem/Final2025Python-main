import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientById } from '../services/api';

const ClientDetail = () => {
    const [client, setClient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchClient = async () => {
            try {
                setIsLoading(true);
                const clientData = await getClientById(id);
                setClient(clientData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    if (isLoading) {
        return <div className="text-center mt-10">Cargando cliente...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    }

    if (!client) {
        return <div className="text-center mt-10">Cliente no encontrado.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalle del Cliente</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 font-semibold">ID:</p>
                        <p className="text-lg">{client.id_key}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Nombre:</p>
                        <p className="text-lg">{client.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Email:</p>
                        <p className="text-lg">{client.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Teléfono:</p>
                        <p className="text-lg">{client.phone}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <Link to="/admin" className="text-blue-500 hover:underline">
                        &larr; Volver a la lista de clientes
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;
