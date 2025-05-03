"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useCart } from "@/app/context/cartContext";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import loadingImage from "/public/images/bannervals.jpg"; 
import CheckoutButton from "@/components/CheckoutButton";
export default function ProductInfoPage() {
  type Product = {
    id: string;
    name: string;
    price: number;
    images: string[]; // Ahora es un array de strings (Base64)
    sizes: string | any; // Añadir la propiedad sizes
  };
  const { addToCart2, cart, removeFromCart } = useCart();
  const { id } = useParams();
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    sizes: string[];
  } | null>(null);

  // const [cart, setCart] = useState<{ name: string; price: number; image: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const [loading , setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Product),
          id: doc.id,
        }));

        // Seleccionar 3 productos aleatorios
        const shuffled = productList.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } 
    };

    fetchProducts();
  }, []);
  const toggleSizeSelection = (size: string) => {
    setSelectedSizes((prevSelected) => {
      const updatedSizes = prevSelected.includes(size)
        ? prevSelected.filter((s) => s !== size) // Elimina si ya está seleccionada
        : [...prevSelected, size]; // Agrega si no está

      return [...updatedSizes];
    });
  };
  useEffect(() => {
    console.log("Tallas seleccionadas:", selectedSizes); // ✅ Verificar que se actualiza
  }, [selectedSizes]);

  useEffect(() => {
    if (!id) {
      console.log("No se encontró un ID de producto.");
      setLoading(false);  // 🔹 Si no hay ID, dejamos de cargar.
      return;
    }
  
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as any);
          console.log("Producto encontrado:", docSnap.data());
        } else {
          console.log("No se encontró el producto");
        }
      } catch (error) {
        console.error("Error obteniendo producto:", error);
      } finally {
        setLoading(false); // 🔹 Finaliza la carga siempre, incluso con errores.
      }
    };
  
    fetchProduct();
  }, [id]);
  
  useEffect(() => {
    if (isProcessingCheckout) {
      setTimeout(() => {
        handleCheckout(); // Llamar a la función de pago solo cuando el carrito se haya actualizado
        setIsProcessingCheckout(false); // Restablecemos la bandera
      }, 500); // Ajusta el tiempo si es necesario
    }
  }, [cart]);

 

  // Función para aumentar y disminuir la cantidad
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") setQuantity((prev) => prev + 1);
    if (type === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Agregar producto al carrito
  const handleAddToCart = () => {
    if (!product) return;

    console.log("📦 Enviando al carrito:", {
      id: product.id,
      name: product.name,
      price: product.price,
      sizes: [...selectedSizes], // ✅ Verifica que tiene valores antes de enviarlo
      image: product.images[0],
      quantity: quantity,
    });

    addToCart2({
      id: product.id,
      name: product.name,
      price: product.price,
      sizes: [...selectedSizes], // 🔥 Asegura que se envía una copia actualizada
      image: product.images[0],
      quantity: quantity,
    });
    setIsCartOpen(true);
  };

  const handleAddToCart2 = () => {
    console.log("entre y soy la el producto actual", product)
    if (!product) return;


    addToCart2({
      id: product.id,
      name: product.name,
      price: product.price,
      sizes: [...selectedSizes], // 🔥 Asegura que se envía una copia actualizada
      image: product.images[0],
      quantity: quantity,
    });

  };
  // Calcular el total del carrito
  const totalCartPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const handleCheckout = () => {
    const phoneNumber = "573218516928"; // Número de WhatsApp (sin el +)
    const message = encodeURIComponent(
      `Hola, quiero hacer un pedido:\n\n` +
      cart.map((item) => `🛒 nombre ${item.name} talla ${item.sizes} - cantidad ${item.quantity} x $${item.price}`).join("\n") +
      `\n\n💰 Total: $${totalCartPrice}`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank"); // Abrir en una nueva pestaña
  };

  const botonComprarAhora = () => {
    handleAddToCart2();
    setIsProcessingCheckout(true);
  }
  const botonComprarAhoraPorMercadoPago = () => {
    handleAddToCart2();
  }
  return (
    <>
    {loading ? (
      <div className="flex justify-center items-center min-h-[300px] mt-28">
      <Image src={loadingImage} alt="Cargando..." width={400} height={100} className="animate-pulse rounded-3xl" />
    </div>
  ) : (
    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-10 mt-32">
      {/* Carrusel de imágenes */}
      <div className="lg:w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {product && product.images.map((image, index) => (
              <CarouselItem key={index}>
                <Image src={image} alt={product.name} width={500} height={500} className="rounded-lg object-cover" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Información del producto */}
      <div className="flex flex-col lg:flex-col gap-10 w-full">
        <div className="flex-1 lg:w-[500px] space-y-4 lg:pl-10 xl:pl-10">
          <div className="flex flex-col w-full p-10 gap-4 bg-white rounded-xl shadow-lg ">
            <h1 className="text-3xl font-bold">{product && product.name}</h1>
            <p className="text-2xl text-gray-700 font-semibold">${product && product.price.toFixed(2)}</p>
            <p className="text-gray-600">{product && product.description}</p>

            {/* Tallas */}
            <p className="text-gray-500">Tallas disponibles: <span className="font-semibold">{product && product.sizes.join(", ")}</span></p>

            <div className="flex gap-2 flex-wrap">
              {product && product.sizes.map((size) => (
                <button
                  key={size}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border text-sm font-semibold transition-all ${selectedSizes.includes(size) ? "bg-black text-white" : "border-gray-400 text-gray-600"
                    }`}
                  onClick={() => toggleSizeSelection(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {/* Input de cantidad */}
            <div className="flex items-center mt-4 space-x-4">
              <button onClick={() => handleQuantityChange("decrease")} className="p-2 border rounded-lg hover:bg-gray-100">
                <Minus size={18} />
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button onClick={() => handleQuantityChange("increase")} className="p-2 border rounded-lg hover:bg-gray-100">
                <Plus size={18} />
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-black text-white text-sm sm:text-base md:text-lg hover:bg-gray-900 transition rounded-2xl w-[200px] h-[40px]"
              >
                Agregar al carrito
              </button>

            </div>


            <div className="mt-4 flex gap-4 justify-center">
              <button className="bg-primary text-white  rounded-2xl text-lg hover:bg-secondary transition w-[320px] h-[40px]" onClick={botonComprarAhora}>
                Comprar ahora
              </button>
            </div>
            <div onClick={botonComprarAhoraPorMercadoPago}className="mt-4 flex gap-4 justify-center">
              <CheckoutButton />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">También te puede interesar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="relative w-full h-80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
                onClick={() => router.push(`/productInfo/${product.id}`)}
              >
                {/* Imagen del producto */}
                {product.images.length > 0 && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-3xl"
                  />
                )}

                {/* Nombre y precio con degradado */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-300">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Sheet del carrito */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button className="fixed bottom-4 right-4 bg-primary hover:bg-secondary text-white flex items-center px-4 py-2  shadow-lg transition-all duration-300 transform hover:scale-110 rounded-2xl">
            <ShoppingCart className="mr-2" /> Carrito ({cart.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-5">
          <DialogTitle className="text-2xl font-semibold">Carrito de compras</DialogTitle>

          {cart.length === 0 ? (
            <p className="text-gray-500 mt-4">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul className="mt-4 space-y-4">
                {cart.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500">
                        ${item.price} x {item.quantity} = <span className="font-bold">${item.price * item.quantity}</span>
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 transition">
                      ✖
                    </button>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="mt-6 p-4 bg-gray-200 rounded-lg text-lg font-semibold flex justify-between">
                <span>Total:</span>
                <span>${totalCartPrice.toFixed(2)}</span>
              </div>

              {/* Botón "Ir a Pagar" */}
              <Button className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition" onClick={handleCheckout}>
                Ir a Pagar
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div >
  )}
    </>
  );
}
