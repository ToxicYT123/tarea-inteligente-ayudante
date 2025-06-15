
import React from 'react';
import { Label } from "@/components/ui/label";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FilterSectionProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ value, title, children }) => {
  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="py-2 text-sm font-medium">{title}</AccordionTrigger>
      <AccordionContent className="pt-2">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FilterSection;
