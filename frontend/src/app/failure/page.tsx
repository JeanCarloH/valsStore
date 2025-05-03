import React from 'react';

const FailurePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-100 mt[100px]">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Fallido</h1>
        <p className="text-lg text-red-800">Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.</p>
      </div>
    </div>
  );
};

export default FailurePage;
