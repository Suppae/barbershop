import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    time: "",
    email: "",
    phoneNumber: "",
    haircutType: "",
    hairdresser: "",
    extras:""
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
    if (!formData.firstName || !formData.lastName || !formData.date || !formData.time || !formData.email || !formData.phoneNumber || !formData.haircutType || !formData.hairdresser) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to Supabase first
      const { error: supabaseError } = await supabase
        .from('Marcações')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          appointment_date: formData.date,
          appointment_time: formData.time,
          email: formData.email,
          phone_number: formData.phoneNumber,
          haircut_type: formData.haircutType,
          hairdresser: formData.hairdresser,
          ip: null // You can add IP detection if needed
        });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      // Send to webhook as before
      const webhookUrl = 'https://ruimiranda12.app.n8n.cloud/webhook-test/52a058b1-25e9-4bf1-a573-78a5d89ea5ee';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          date: formData.date,
          time: formData.time,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          haircutType: formData.haircutType,
          hairdresser: formData.hairdresser,
          timestamp: new Date().toISOString(),
          source: 'lovable-app'
        })
      });

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
        haircutType: "",
        hairdresser: "",
        extras:""
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
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Agendar Horário
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha com os seus dados para agendar o seu horário
          </CardDescription>
        </CardHeader>
        <CardContent>

          <div className="space-y-2 mb-5">
              <Label htmlFor="haircutType" className="font-bold">Tipo de Corte</Label>
              <Select 
                value={formData.haircutType} 
                onValueChange={(value) => handleInputChange("haircutType", value)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione o tipo de corte" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="corte clássico">Clássico</SelectItem>
                  <SelectItem value="degradê">Degradê</SelectItem>
                  <SelectItem value="barba">Personalizado</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2 mb-5">
              <Label htmlFor="extras" className="font-bold">Extras</Label>
              
              <Select 
                value={formData.extras} 
                onValueChange={(value) => handleInputChange("extras", value)}
                disabled={!formData.haircutType}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={formData.extras ? "Selecione um extra" : "Primeiro selecione um tipo de corte"} />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="Sobrancelhas e barba">Sobrancelhas + Barba</SelectItem>
                  <SelectItem value="Barba">Barba</SelectItem>
                  <SelectItem value="BarbaSpa">Barba Spa</SelectItem>
                  <SelectItem value="Sobrancelhas">Sobrancelhas</SelectItem>
                  <SelectItem value="Nenhum">Nenhum</SelectItem>
                </SelectContent>
              </Select>
          </div>

            <div className="space-y-2 mb-5">
              <Label htmlFor="hairdresser" className="font-bold">Cabeleireiro</Label>
              <Select 
                value={formData.hairdresser} 
                onValueChange={(value) => handleInputChange("hairdresser", value)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione o cabeleireiro" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="júlio">Júlio</SelectItem>
                  <SelectItem value="brando">Brando</SelectItem>
                </SelectContent>
              </Select>
            </div>


          <form onSubmit={handleSubmit} className="space-y-2">
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
                    <SelectItem value="" disabled>
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


            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "A enviar..." : "Agendar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Booking;