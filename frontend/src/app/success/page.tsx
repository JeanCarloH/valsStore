import React from 'react';

const SuccessPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100  mt[100px]">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        <p className="text-lg text-green-800">Tu transacción se ha completado correctamente.</p>
      </div>
    </div>
  );
};

export default SuccessPage;

