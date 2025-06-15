
import React from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdvancedFilters from '../AdvancedFilters';

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  uniqueSubjects: string[];
  onAdvancedFiltersChange: (filters: any) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  todayCount: number;
  weekCount: number;
  upcomingCount: number;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  sort,
  setSort,
  uniqueSubjects,
  onAdvancedFiltersChange,
  hasActiveFilters,
  clearFilters,
  todayCount,
  weekCount,
  upcomingCount
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex flex-grow items-center gap-2">
          <Input
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          
          <AdvancedFilters 
            onFiltersChange={onAdvancedFiltersChange}
            subjects={uniqueSubjects}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:w-auto w-full">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-[150px] w-full">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="today">Hoy ({todayCount})</SelectItem>
              <SelectItem value="upcoming">Próximamente ({weekCount + upcomingCount})</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-[150px] w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Fecha de entrega</SelectItem>
              <SelectItem value="priority">Prioridad</SelectItem>
              <SelectItem value="subject">Materia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-xs h-8"
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
