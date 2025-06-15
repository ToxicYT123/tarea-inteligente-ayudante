
import React from 'react';
import { Task } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface StatsCardsProps {
  tasks: Task[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ tasks }) => {
  const { theme } = useTheme();
  
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.due_date);
    return taskDate.toDateString() === today.toDateString();
  }).length;
  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.due_date);
    return taskDate < today && !task.completed;
  }).length;

  const stats = [
    {
      title: 'Tareas Pendientes',
      value: pendingTasks,
      icon: Clock,
      color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      bgColor: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
    },
    {
      title: 'Completadas',
      value: completedTasks,
      icon: CheckCircle2,
      color: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
    },
    {
      title: 'Para Hoy',
      value: todayTasks,
      icon: Calendar,
      color: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      bgColor: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
    },
    {
      title: 'Vencidas',
      value: overdueTasks,
      icon: AlertTriangle,
      color: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`transition-all duration-300 hover:scale-105 ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
            : 'bg-white/80 border-gray-200 hover:bg-white/90'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
