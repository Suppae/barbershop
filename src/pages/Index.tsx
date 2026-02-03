import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    time: "",
    email: "",
    phoneNumber: "",
    haircutType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const { toast } = useToast();

  // Define available time slots (9h às 19h, excluindo 13h - hora de almoço)
  const allTimeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Fetch available time slots when date changes (using secure function)
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date) {
        setAvailableTimeSlots(allTimeSlots);
        return;
      }

      try {
        // Use the secure function to get only occupied time slots (no personal data)
        const { data: occupiedSlots, error } = await supabase
          .rpc('get_occupied_time_slots_secure', { target_date: formData.date });

        if (error) {
          console.error('Error fetching occupied slots:', error);
          setAvailableTimeSlots(allTimeSlots);
          return;
        }

        const occupiedTimes = occupiedSlots?.map(slot => {
          // Convert "11:00:00" to "11:00" format
          return slot.time_slot?.substring(0, 5);
        }).filter(Boolean) || [];
        
        const available = allTimeSlots.filter(time => !occupiedTimes.includes(time));
        setAvailableTimeSlots(available);

        // Reset time if currently selected time is no longer available
        if (formData.time && !available.includes(formData.time)) {
          setFormData(prev => ({ ...prev, time: "" }));
        }
      } catch (error) {
        console.error('Error:', error);
        setAvailableTimeSlots(allTimeSlots);
      }
    };

    fetchAvailableSlots();
  }, [formData.date, formData.time]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.date || !formData.time || !formData.email || !formData.phoneNumber || !formData.haircutType) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      toast({
        title: "Sucesso!",
        description: "Marcação guardada e dados enviados com sucesso.",
      });

      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        date: "",
        time: "",
        email: "",
        phoneNumber: "",
        haircutType: ""
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-luxury border-primary/10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Contacte-nos
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os seus dados para entrarmos em contacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Primeiro Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="João"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Último Nome</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Silva"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Select 
                value={formData.time} 
                onValueChange={(value) => handleInputChange("time", value)}
                disabled={!formData.date}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={formData.date ? "Selecione uma hora" : "Primeiro selecione uma data"} />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {availableTimeSlots.length === 0 && formData.date ? (
                    <SelectItem value="__no_slots__" disabled>
                      Não há horários disponíveis
                    </SelectItem>
                  ) : (
                    availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="exemplo@email.com"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Número de Telemóvel</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="+351 912 345 678"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="haircutType">Tipo de Corte</Label>
              <Input
                id="haircutType"
                type="text"
                value={formData.haircutType}
                onChange={(e) => handleInputChange("haircutType", e.target.value)}
                placeholder="Corte clássico, degradê, etc."
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "A enviar..." : "Enviar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
