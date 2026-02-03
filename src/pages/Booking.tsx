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

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;

  const parseYMDToLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameLocalDay = (dateStr: string) => {
    const selected = parseYMDToLocalDate(dateStr);
    const now = new Date();
    return (
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate()
    );
  };

  const isPastTimeSlot = (dateStr: string, timeStr: string) => {
    if (!isSameLocalDay(dateStr)) return false;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return now >= slotTime;
  };

  const isPastDate = (dateStr: string) => {
    const selected = parseYMDToLocalDate(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return selected < today;
  };

  const getTodayYMD = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMaxDateYMD = () => {
    const now = new Date();
    const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, "0");
    const day = String(maxDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Define available time slots (9h às 19h, excluindo 13h - hora de almoço)
  const allTimeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Fetch available time slots when date changes (using secure function)
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date || !formData.hairdresser) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        // Buscar horários disponíveis do Google Calendar via backend
        const response = await fetch(
          `${apiBaseUrl}/horarios-disponiveis?hairdresser=${encodeURIComponent(formData.hairdresser)}&date=${formData.date}`
        );

        if (!response.ok) {
          console.error('Error fetching available slots');
          setAvailableTimeSlots([]);
          return;
        }

        const data = await response.json();
        const availableHours = data.horarios || [];
        const filteredHours = formData.date
          ? availableHours.filter((time: string) => !isPastTimeSlot(formData.date, time))
          : availableHours;
        setAvailableTimeSlots(filteredHours);

        // Reset time if currently selected time is no longer available
        if (formData.time && !filteredHours.includes(formData.time)) {
          setFormData(prev => ({ ...prev, time: "" }));
        }
      } catch (error) {
        console.error('Error:', error);
        setAvailableTimeSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [formData.date, formData.hairdresser]);

  const isMoreThan30DaysAhead = (dateStr: string) => {
    const today = new Date();
    const selectedDate = new Date(dateStr);
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    return selectedDateOnly > maxDateOnly;
  };

  const handleInputChange = (field: string, value: string) => {
    // Validar se é domingo quando o campo é data
    if (field === "date" && value) {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay();
      
      if (dayOfWeek === 0) { // 0 = domingo
        toast({
          title: "Data Inválida",
          description: "Não é possível agendar aos domingos.",
          variant: "destructive",
        });
        return;
      }

      if (isPastDate(value)) {
        toast({
          title: "Data Inválida",
          description: "Não é possível agendar em datas passadas.",
          variant: "destructive",
        });
        return;
      }

      if (isMoreThan30DaysAhead(value)) {
        toast({
          title: "Data Inválida",
          description: "Marcação tem um prazo de 30 dias.",
          variant: "destructive",
        });
        return;
      }
    }
    
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

    if (formData.date && isPastDate(formData.date)) {
      toast({
        title: "Data Inválida",
        description: "Não é possível agendar em datas passadas.",
        variant: "destructive",
      });
      return;
    }

    if (formData.date && formData.time && isPastTimeSlot(formData.date, formData.time)) {
      toast({
        title: "Horário Indisponível",
        description: "Não é possível marcar em horário já passado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const webhookUrl = `${apiBaseUrl}/criar-agendamento`;  

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        })
      });

      const responseData = await response.json();

      if (response.status === 409) {
        // Horário já ocupado
        toast({
          title: "Horário Indisponível",
          description: responseData.erro || "O cabeleireiro não tem disponibilidade neste horário.",
          variant: "destructive",
        });
      } else if (response.ok) {
        // Sucesso
        toast({
          title: "Sucesso!",
          description: "Marcação guardada e dados enviados com sucesso.",
        });

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
      } else {
        // Outro erro
        toast({
          title: "Erro",
          description: responseData.erro || "Erro ao enviar dados. Tente novamente.",
          variant: "destructive",
        });
      }

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
              <Label htmlFor="hairdresser" className="font-bold">Barbeiro</Label>
              <Select 
                value={formData.hairdresser} 
                onValueChange={(value) => handleInputChange("hairdresser", value)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione o Barbeiro" />
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
                min={getTodayYMD()}
                disabled={!formData.hairdresser}
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
                  {formData.date && availableTimeSlots.length === 0 ? (
                    <SelectItem value="__no_slots__" disabled className="text-muted-foreground">
                      Não há horários disponíveis
                    </SelectItem>
                  ) : (
                    allTimeSlots.map((time) => {
                      const isAvailable = formData.date ? availableTimeSlots.includes(time) : false;
                      const isDisabled = !formData.date || !isAvailable;
                      return (
                        <SelectItem
                          key={time}
                          value={time}
                          disabled={isDisabled}
                          className={isDisabled ? "text-muted-foreground" : ""}
                        >
                          {time}
                        </SelectItem>
                      );
                    })
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