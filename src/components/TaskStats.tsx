
import React from 'react';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { isToday, isPastDue, filterTasksByDueDate } from '@/utils/taskUtils';
import { ChartBar } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const { theme } = useTheme();
  
  // Estadísticas de estado
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  
  const statusData = [
    { name: 'Completadas', value: completedCount, color: theme === 'dark' ? '#22c55e' : '#16a34a' },
    { name: 'Pendientes', value: pendingCount, color: theme === 'dark' ? '#f87171' : '#ef4444' },
  ];
  
  // Estadísticas por prioridad
  const highPriorityCount = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityCount = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityCount = tasks.filter(task => task.priority === 'low').length;
  
  const priorityData = [
    { name: 'Alta', value: highPriorityCount, color: theme === 'dark' ? '#f87171' : '#ef4444' },
    { name: 'Media', value: mediumPriorityCount, color: theme === 'dark' ? '#facc15' : '#eab308' },
    { name: 'Baja', value: lowPriorityCount, color: theme === 'dark' ? '#4ade80' : '#22c55e' },
  ];
  
  // Estadísticas por fecha de vencimiento
  const todayCount = tasks.filter(task => isToday(task.due_date)).length;
  const weekCount = filterTasksByDueDate('week').length;
  const upcomingCount = filterTasksByDueDate('upcoming').length;
  const overdueCount = tasks.filter(task => isPastDue(task.due_date) && !task.completed).length;
  
  const timelineData = [
    { name: 'Hoy', value: todayCount },
    { name: 'Esta semana', value: weekCount },
    { name: 'Próximamente', value: upcomingCount },
    { name: 'Vencidas', value: overdueCount },
  ];

  // Estadísticas por materia
  const subjectCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.subject] = (acc[task.subject] || 0) + 1;
    return acc;
  }, {});

  const subjectData = Object.keys(subjectCounts).map(subject => ({
    name: subject,
    value: subjectCounts[subject],
  }));
  
  const COLORS = theme === 'dark' 
    ? ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#4ade80', '#facc15', '#f87171'] 
    : ['#6366f1', '#8b5cf6', '#d946ef', '#a855f7', '#3b82f6', '#0ea5e9', '#14b8a6'];

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChartBar size={18} />
          Estadísticas de Tareas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gráfico de estado */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-1 text-center">Estado de Tareas</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico por prioridad */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-1 text-center">Tareas por Prioridad</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={priorityData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico por fecha */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-1 text-center">Distribución Temporal</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={timelineData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={theme === 'dark' ? '#9b87f5' : '#8b5cf6'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico por materia */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-1 text-center">Tareas por Materia</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskStats;
