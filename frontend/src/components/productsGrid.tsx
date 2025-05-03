"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import loadingImage from "/public/images/bannervals.jpg"; 
export default function ProductGrid() {
  const { addToCart, cart, removeFromCart } = useCart();
  const [loading , setLoading] = useState(true);
  type Product = {
    id: string;
    name: string;
    price: number;
    images: string[]; // Ahora es un array de strings (Base64)
    sizes: string | any; // Añadir la propiedad sizes
  };

  //const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Product),
          id: doc.id,
        }));
        console.log("Productos:", productList);
        setProducts(productList);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  


  // Calcular el total del carrito
  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };
  const handleCheckout = () => {
    const phoneNumber = "573218516928"; // Número de WhatsApp (sin el +)
    const message = encodeURIComponent(
      `Hola, quiero hacer un pedido:\n\n` +
        cart.map((item) => `🛒 ${item.name} ${item.sizes} - ${item.quantity} x $${item.price}`).join("\n") +
        `\n\n💰 Total: $${getTotal()}`
    );
  
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank"); // Abrir en una nueva pestaña
  };
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 2; 
   // 📌 Calcular los productos a mostrar en la página actual
   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const router = useRouter();
  return (
    <div >
      {/* Grid de productos */}
      <div className="w-full p-16">
      {/* Grid de productos */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
        <Image src={loadingImage} alt="Cargando..." width={400} height={100} className="animate-pulse rounded-3xl" />
      </div>
    ) : (
      <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden min-w-[235.2px]"
            onClick={() => router.push(`/productInfo/${product.id}`)}
          >
            {/* 🔹 Imagen como fondo */}
            {product.images.length > 0 && (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={400}
                height={500}
                className="w-full h-96 object-cover transition-transform group-hover:scale-105 duration-300 "
              />
            )}

            {/* 🔹 Degradado con nombre y precio */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
              <h3 className="text-white text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-300">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    )}
    </div>
    {/* 📌 PAGINACIÓN CON SHADCN */}
    <div className="flex justify-center mt-6 mb-6">
        <Pagination>
          <PaginationContent>
            {/* Botón Anterior */}
            <PaginationItem>
              <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage((prev) => Math.max(prev - 1, 1))} />
            </PaginationItem>

            {/* Números de página */}
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Botón Siguiente */}
            <PaginationItem>
              <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button className="fixed bottom-4 right-4 bg-primary hover:bg-secondary text-white flex items-center px-4 py-2  shadow-lg transition-all duration-300 transform hover:scale-110 rounded-2xl">
            <ShoppingCart className="mr-2" /> Carrito ({cart.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <DialogTitle className="text-2xl font-semibold">Carrito de compras</DialogTitle>
          <h2 className="text-lg font-semibold mb-4">Carrito de Compras</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500">
                        ${item.price} x {item.quantity} = <span className="font-bold">${item.price * item.quantity}</span>
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="text-red-500">✖</button>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="mt-6 p-4 bg-gray-200 rounded-lg text-lg font-semibold flex justify-between">
                <p className="text-lg font-semibold">Total: ${getTotal()}</p>
              </div>

              {/* Botón "Ir a Pagar" */}
              <Button className="w-full mt-4 bg-black text-white py-2 rounded-lg" onClick={handleCheckout}>
                Ir a Pagar
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
