
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface AcademicContextFormData {
  educationLevel: string;
  semester: number;
  term: number;
  week: number;
}

const AcademicContextForm = () => {
  const form = useForm<AcademicContextFormData>({
    defaultValues: {
      educationLevel: 'preparatoria',
      semester: 4,
      term: 1,
      week: 1,
    },
  });

  const onSubmit = async (data: AcademicContextFormData) => {
    try {
      const { error } = await supabase
        .from('academic_contexts')
        .insert([
          {
            education_level: data.educationLevel,
            semester: data.semester,
            term: data.term,
            week: data.week,
            is_active: true,
          },
        ]);

      if (error) throw error;

      toast.success('Contexto académico guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar el contexto académico');
      console.error('Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel educativo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel educativo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="preparatoria">Preparatoria</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semestre</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={6} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parcial</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={4} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semana</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={20} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Guardar contexto académico
        </Button>
      </form>
    </Form>
  );
};

export default AcademicContextForm;
