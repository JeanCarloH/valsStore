"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import Image from "next/image";
import loadingImage from "/public/images/bannervals.jpg"; 
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../../firebase";
import Swal from "sweetalert2";  // Asegúrate de tener esta importación
export default function VerProductos() {
  interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };



const deleteProduct = async (product: Product) => {
  // Mostrar el popup de confirmación usando SweetAlert2
  const result = await Swal.fire({
    title: `¿Seguro que quieres eliminar ${product.name}?`, // Usamos el nombre del producto
    text: "¡Esta acción no se puede deshacer!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  // Si el usuario no confirma la acción, salimos de la función
  if (!result.isConfirmed) return;

  try {
    // Eliminar imágenes del Storage
    const deleteImagePromises = product.images.map(async (imageUrl) => {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    });

    // Esperar a que todas las imágenes se eliminen
    await Promise.all(deleteImagePromises);

    // Luego eliminar el producto de Firestore
    await deleteDoc(doc(db, "products", product.id));

    // Actualizar estado para reflejar cambios en UI
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    // Mostrar un mensaje de éxito
    Swal.fire({
      icon: "success",
      title: "Producto eliminado",
      text: `${product.name} ha sido eliminado correctamente.`,
    });
  } catch (error) {
    console.error("Error al eliminar producto o imágenes:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un problema al eliminar el producto.",
    });
  }
};

  return (
    <div className="max-w-4xl mx-auto mt-20 p-4">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">Administrar Productos</h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
        <Image src={loadingImage} alt="Cargando..." width={400} height={100} className="animate-pulse rounded-3xl" />
      </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300 sx:text-xs sm:text-sm md:text-lg lg:text-lg ">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Imagen</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Categoría</th>
              <th className="border p-2">Precio</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="text-center">
                  <td className="border p-2">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                  </td>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.category}</td>
                  <td className="border p-2">${product.price}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteProduct(product)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      ❌ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No hay productos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
