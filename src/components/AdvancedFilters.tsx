import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { useTheme } from '@/hooks/use-theme';
import { Badge } from '@/components/ui/badge';
import FilterSection from './filters/FilterSection';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    priority: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
    subject: string;
    status: string;
  }) => void;
  subjects: string[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange, subjects }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    subject: 'all',
    status: 'all',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const updateActiveFilters = (newFilters: typeof filters) => {
    const active: string[] = [];
    
    if (newFilters.search) active.push('Búsqueda');
    if (newFilters.priority !== 'all') active.push('Prioridad');
    if (newFilters.dateRange.from || newFilters.dateRange.to) active.push('Fechas');
    if (newFilters.subject !== 'all') active.push('Materia');
    if (newFilters.status !== 'all') active.push('Estado');
    
    setActiveFilters(active);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      priority: 'all',
      dateRange: {
        from: undefined as Date | undefined,
        to: undefined as Date | undefined,
      },
      subject: 'all',
      status: 'all',
    };
    
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setActiveFilters([]);
  };

  const themeClasses = theme === 'dark' ? 'bg-gray-800 border-gray-700' : '';
  const inputThemeClasses = theme === 'dark' ? 'bg-gray-700 border-gray-600' : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative flex items-center gap-2 h-10"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilters.length > 0 && (
            <Badge 
              className="ml-1 h-5 px-1.5 text-xs" 
              variant="secondary"
            >
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`w-80 p-0 ${themeClasses}`}
        align="start"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Filtros Avanzados</h3>
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs flex items-center gap-1"
              onClick={resetFilters}
            >
              <X className="h-3 w-3" /> Limpiar
            </Button>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
            <Input 
              id="search" 
              placeholder="Título, descripción..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`h-9 ${inputThemeClasses}`}
            />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <FilterSection value="priority" title="Prioridad">
              <Select 
                value={filters.priority} 
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger className={`h-9 ${inputThemeClasses}`}>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent className={themeClasses}>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection value="date" title="Rango de fechas">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs mb-1 block">Desde</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !filters.dateRange.from && "text-muted-foreground"
                          } ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
                        >
                          {filters.dateRange.from ? (
                            filters.dateRange.from.toLocaleDateString()
                          ) : (
                            "Seleccionar"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className={`w-auto p-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`} align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => 
                            handleFilterChange('dateRange', { ...filters.dateRange, from: date })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-xs mb-1 block">Hasta</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !filters.dateRange.to && "text-muted-foreground"
                          } ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
                        >
                          {filters.dateRange.to ? (
                            filters.dateRange.to.toLocaleDateString()
                          ) : (
                            "Seleccionar"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className={`w-auto p-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`} align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => 
                            handleFilterChange('dateRange', { ...filters.dateRange, to: date })
                          }
                          disabled={(date) => 
                            filters.dateRange.from ? date < filters.dateRange.from : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleFilterChange('dateRange', { from: undefined, to: undefined })}
                  >
                    Limpiar fechas
                  </Button>
                )}
              </div>
            </FilterSection>
            
            <FilterSection value="subject" title="Materia">
              <Select 
                value={filters.subject} 
                onValueChange={(value) => handleFilterChange('subject', value)}
              >
                <SelectTrigger className={`h-9 ${inputThemeClasses}`}>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent className={themeClasses}>
                  <SelectItem value="all">Todas</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection value="status" title="Estado">
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className={`h-9 ${inputThemeClasses}`}>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className={themeClasses}>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>
          </Accordion>
          
          <Button 
            className="w-full mt-4"
            onClick={() => setIsOpen(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedFilters;
