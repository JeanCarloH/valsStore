import React from 'react';

const PendingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100 mt[100px]">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">Pago Pendiente</h1>
        <p className="text-lg text-yellow-800">Tu pago está en proceso. Te notificaremos una vez que se haya completado.</p>
      </div>
    </div>
  );
};

export default PendingPage;
