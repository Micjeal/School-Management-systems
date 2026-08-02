import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalConditionTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  isPlatformView: boolean;
}

export function MedicalConditionTabs({ value, onValueChange, isPlatformView }: MedicalConditionTabsProps) {
  if (isPlatformView) {
    return (
      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="global">Global catalogue</TabsTrigger>
          <TabsTrigger value="school">School-specific entries</TabsTrigger>
          <TabsTrigger value="all">All entries</TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="available">Available to this school</TabsTrigger>
        <TabsTrigger value="school-specific">School-specific</TabsTrigger>
        <TabsTrigger value="global">Global</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
