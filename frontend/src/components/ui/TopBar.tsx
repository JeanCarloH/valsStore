"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Menu, Sun, Moon } from "lucide-react";
import LogoKiichain from "/public/images/Logo_KiiChain_2024.png";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useAuth } from "@/app/context/authContext";
import ListItem from "@/components/ui/ListItem";

export default function TopBar() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const { user, logout } = useAuth();
  console.log("data de user", user)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
    }
  }, []);
  const categories = [
    "Basicas-americanas",
    "Sets",
    "Jeans-americanos",
    "Faldas",
    "Shorts",
    "Vestidos",
    "Bodys",
    "Deportivos",
    "Calzado",
    "Bolsos",
    "Camisetas"
  ];
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    window.dispatchEvent(new Event("storage"));
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`fixed top-0 left-0 w-full shadow-md z-50 border-black border-b-2 transition-all duration-300 ${isDark ? "bg-rosa text-white" : "bg-white text-black"}`}>
      {/* Contenedor Principal */}
      <div className="flex justify-between items-center px-4 md:px-8 py-3">

        {/* Logo */}
        <div className="border-r-2 border-black pr-4">
          <Link href="/">
          <Image src="/images/logovals.jpeg" alt="vals" width={200} height={1} className={`cursor-pointer transition-all duration-300 ${isDark ? "" : ""}`} style={{ height: "65px" }} />
          </Link>
        </div>

        {/* Menú Desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/gender/Hombre" className="text-lg font-semibold hover:underline">
                    Hombres
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/gender/Mujer" className="text-lg font-semibold hover:underline">
                    Mujeres
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-lg font-semibold hover:underline">Categorías</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-rosa p-4 rounded-3xl shadow-lg !w-[400px] radix-navigation-menu-content" >

                  <ul className="grid w-[100px] gap-3 p-4 md:w-[100px] md:grid-cols-2 lg:w-[380px] ml-3">
                    {categories.map((category, index) => (
                      <ListItem key={index}    href={`/category/${category}`} title={category}  className="text-lg font-semibold hover:bg-rosaHover bg-transparent">
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>


              {user ? (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/addProduct" className="text-lg font-semibold hover:underline">
                      Agregar Productos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ) : (
                <div></div>
              )}
                   {user ? (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/seeProducts" className="text-lg font-semibold hover:underline">
                     Ver productos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ) : (
                <div></div>
              )}

            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="w-[1px] h-[60px]  border-r-2 border-black hidden md:flex mr-4"></div>
        {/* Botón de Cambio de Tema
        <div className="hidden md:flex items-center px-4 cursor-pointer" onClick={toggleTheme}>
          {isDark ? <Sun size={26} className="text-yellow-400 transition-all duration-300 hover:scale-110" /> : <Moon size={26} className="text-gray-800 transition-all duration-300 hover:scale-110" />}
        </div> */}
        <div>
          {user ? (
            <Button onClick={logout} className="hidden md:block rounded-xl">
              Cerrar Sesión
            </Button>
          ) : (
            <Button className="hidden md:block rounded-xl">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          )}
        </div>

        {/* Menú Responsive (Móvil) */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={`${isDark ? "bg-rosa text-white" : "bg-white text-black"}`}>
              <DialogTitle className="text-2xl font-semibold">Menú</DialogTitle>

              <div className="flex flex-col gap-6 p-4">
                <Link href="/hombres" className="text-lg font-semibold hover:underline">Hombres</Link>
                <Link href="/mujeres" className="text-lg font-semibold hover:underline">Mujeres</Link>

                {/* Dropdown de Categorías */}
                <div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-lg font-semibold hover:underline flex justify-between items-center w-full"
                  >
                    Categorías
                    <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="bg-rosa p-4 rounded-md shadow-lg mt-2">
                      <ul className="grid w-[300px] gap-3 p-4 overflow-y-auto max-h-[300px] hide-scrollbar">
                        {categories.map((category, index) => (
                          <li key={index}>
                            <Link
                             href={`/category/${category}`} 
                               className="block p-2 font-semibold text-[clamp(12px, 4vw, 18px)] "
                            >
                              {category}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {user && (
                  <Link href="/addProduct" className="text-lg font-semibold hover:underline">Agregar Productos</Link>
                )}

                {user ? (
                  <button onClick={logout} className="text-lg font-semibold hover:underline">
                    Cerrar Sesión
                  </button>
                ) : (
                  <Link href="/login" className="text-lg font-semibold hover:underline">Inicia Sesión</Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </div>
  );
}
