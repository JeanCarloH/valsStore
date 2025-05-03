"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import Swal from "sweetalert2"; // Importamos SweetAlert2
export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    gender: "",
    images: [] as string[], // Lista de imágenes en archivos
    sizes: [] as string[], // Lista de tallas disponibles
  });

  const [sizeInput, setSizeInput] = useState(""); // Para agregar tallas dinámicamente
  const [previewImages, setPreviewImages] = useState<string[]>([]); // URLs de previsualización de imágenes
  const [loading, setLoading] = useState(false);
  // Manejo de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };
  const storage = getStorage();

  // Manejar selección de imágenes
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
  
    const selectedFiles = Array.from(e.target.files);
    setLoading(true);
  
    try {
      const uploadedImageUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          // Verificar si la imagen no supera 1MB
          if (file.size > 1024 * 1024) {
            Swal.fire("Error", "La imagen no debe superar 1MB", "error");
            return null;
          }
  
          const storageRef = ref(storage, `productos/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );
  
      // Filtrar URLs no válidas (caso de imágenes rechazadas por tamaño)
      const validUrls = uploadedImageUrls.filter((url) => url !== null) as string[];
  
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...validUrls], // Guardamos las URLs en lugar de archivos
      }));
  
      setPreviewImages((prev) => [...prev, ...validUrls]); // Previsualización
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      Swal.fire("Error", "No se pudieron subir las imágenes", "error");
    }
  
    setLoading(false);
  };

  // Eliminar una imagen de la lista
  const handleRemoveImage = (index: number) => {
    setProduct({
      ...product,
      images: product.images.filter((_, i) => i !== index),
    });

    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // Agregar talla
  const handleAddSize = () => {
    if (sizeInput.trim() && !product.sizes.includes(sizeInput)) {
      setProduct({ ...product, sizes: [...product.sizes, sizeInput] });
      setSizeInput("");
    }
  };

  // Eliminar talla
  const handleRemoveSize = (size: string) => {
    setProduct({ ...product, sizes: product.sizes.filter((s) => s !== size) });
  };
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };


  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const newProduct = {
        name: product.name,
        price: parseFloat(product.price),
        description: product.description,
        category: product.category,
        gender: product.gender,
        images: product.images, // Ahora ya son URLs, no base64
        sizes: product.sizes,
      };
  
      const docRef = await addDoc(collection(db, "products"), newProduct);
  
      Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `El producto ha sido agregado con éxito! ID: ${docRef.id}`,
      });
  
      setProduct({ name: "", price: "", description: "", category: "", gender: "", images: [], sizes: [] });
      setPreviewImages([]);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Swal.fire("Error", "Hubo un problema al agregar el producto.", "error");
    }
  
    setLoading(false);
  };
  



  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-36 mb-10">
      <h2 className="text-2xl font-bold mb-4">Agregar Producto</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block font-medium">Nombre del Producto</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block font-medium">Precio</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-medium">Descripción</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          ></textarea>
        </div>

        {/* Categoría */}
        <div>
          <label className="block font-medium">Categoría</label>
          <select name="category" value={product.category} onChange={handleChange} required className="w-full p-2 border rounded-md">
            <option value="">Seleccionar categoría</option>
            <option value="Basicas-americanas">Básicas americanas</option>
            <option value="Sets">Sets</option>
            <option value="Jeans-americanos">Jeans americanos</option>
            <option value="Faldas">Faldas</option>
            <option value="Shorts">Shorts</option>
            <option value="Vestidos">Vestidos</option>
            <option value="Bodys">Bodys</option>
            <option value="Deportivos">Deportivos</option>
            <option value="Calzado">Calzado</option>
            <option value="Bolsos">Bolsos</option>
            <option value="Camisetas">Camisetas</option>
          </select>

        </div>
        {/* Género (Hombre o Mujer) */}
        <div>
          <label className="block font-medium">Género</label>
          <select name="gender" value={product.gender} onChange={handleChange} required className="w-full p-2 border rounded-md">
            <option value="">Seleccionar género</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </select>
        </div>
        {/* Subir Imágenes */}
        <div>
          <label className="block font-medium">Imágenes del Producto</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
             <p className="text-sm text-gray-500 mt-1">Máximo 1MB por imagen</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previewImages.map((src, index) => (
              <div key={index} className="relative">
                <Image src={src} alt={`Imagen ${index}`} width={64} height={64} className="w-16 h-16 object-cover rounded-md border" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tallas dinámicas */}
        <div>
          <label className="block font-medium">Tallas disponibles</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="Ej: S, M, L, 42, 44..."
              className="w-full p-2 border rounded-md"
            />
            <button type="button" onClick={handleAddSize} className="px-3 py-1 bg-blue-500 text-white rounded-md">+</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((size, index) => (
              <div key={index} className="flex items-center bg-gray-200 p-1 rounded-md">
                <span className="px-2">{size}</span>
                <button type="button" onClick={() => handleRemoveSize(size)} className="text-red-500 text-sm">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Enviar */}
        <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">
          Agregar Producto
        </button>
      </form>
    </div>
  );
}
