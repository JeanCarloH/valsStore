'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/cartContext';

export default function CheckoutButton() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // useEffect para esperar a que el carrito se actualice antes de hacer el pago
  useEffect(() => {
    if (isProcessingCheckout) {
      setTimeout(() => {
        handlePayment(); // Llamar a la función de pago solo cuando el carrito se haya actualizado
        setIsProcessingCheckout(false); // Restablecemos la bandera
      }, 500); // Ajusta el tiempo si es necesario
    }
  }, [cart, isProcessingCheckout]); // Se activa cuando cart cambia

  // Función para manejar el pago
  const handlePayment = async () => {
    setLoading(true);
    try {
      const items = cart.map((item) => ({
        title: item.name,
        price: item.price,
        quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity,
        currency_id: 'COP',
      }));

      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      if (data && data.init_point) {
        window.location.href = data.init_point; // Redirige al checkout de Mercado Pago
      } else {
        console.error('No se recibió el init_point de la preferencia.');
      }
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
    } finally {
      setLoading(false);
    }
  };

  // Esta función es llamada cuando el usuario hace clic en el botón de pago
  const handleClick = () => {
    setIsProcessingCheckout(true); // Activa el procesamiento del pago
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary text-white rounded-2xl text-lg hover:bg-secondary transition w-[320px] h-[40px]"
      disabled={loading}
    >
      {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
    </button>
  );
}
