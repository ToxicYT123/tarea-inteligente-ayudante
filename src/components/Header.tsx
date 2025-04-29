
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`${theme === 'dark' ? 'bg-gradient-app-dark' : 'bg-gradient-app'} text-white p-4 sm:p-6 transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-10 w-auto">
            <img 
              src="/haby-logo.png" 
              alt="HABY" 
              className="h-full w-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">HABY TareaAssist</h1>
            <p className="text-gray-100 mt-1">Organiza tus tareas escolares de forma fácil y eficiente</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white/80"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
