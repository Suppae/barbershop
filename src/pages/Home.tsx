import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Clock, Star, MapPin, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(() =>
    // iniciar com "Clássico" ativo
    [
      "Degradê",
      "Clássico",
      "Personalizado",
      "Clássico + Barba",
      "Degradê + Barba",
    ].indexOf("Clássico")
  );
  // header / hero scroll detection
  const heroRef = useRef<HTMLElement | null>(null);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      const headerHeight = 72; // ajustar se necessário
      if (hero) {
        const bottom = hero.getBoundingClientRect().bottom;
        setIsHeaderSolid(bottom <= headerHeight);
      } else {
        setIsHeaderSolid(window.scrollY > 20);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const services = [
    {
      name: "Degradê",
      price: "€14",
      duration: "(45min)",
      icon: Scissors,
      description:
        "Degradê moderno com transição suave. Ideal para quem gosta de um acabamento limpo e atual.",
    },
    {
      name: "Clássico",
      price: "€12",
      duration: "(30min)",
      icon: Scissors,
      description:
        "Corte clássico tradicional, perfeito para um look sóbrio e elegante. Corte preciso às tesouras e máquina.",
    },
    {
      name: "Personalizado",
      price: "€16",
      duration: "(60min)",
      icon: Scissors,
      description:
        "Sessão personalizada: consulta e execução conforme o estilo desejado, inclui acabamento detalhado.",
    },
    {
      name: "Clássico + Barba",
      price: "€18",
      duration: "(60min)",
      icon: Scissors,
      description:
        "Corte clássico acompanhado de tratamento e modelagem de barba para um look completo.",
    },
    {
      name: "Degradê + Barba",
      price: "€20",
      duration: "(60min)",
      icon: Scissors,
      description:
        "Degradê com acabamento de barba profissional. Ideal para renovar visual e barba ao mesmo tempo.",
    },
  ];

  const features = [
    { icon: Clock, title: "Horário Flexível", description: "Segunda a Domingo (Dom até 13h)" },
    { icon: Star, title: "Qualidade Premium", description: "Profissionais experientes" },
    { icon: MapPin, title: "Localização Central", description: "Fácil acesso e estacionamento" },
  ];

  // Resolve icons para componentes JSX (JSX exige identificadores que começam por maiúscula)
  const ActiveIcon = services[activeServiceIndex]?.icon ?? Scissors;

  return (
    <>
      {/* Header: transparente sobre a hero, fica sólido após scroll */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${isHeaderSolid ? 'bg-background shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src="/images/logo2.png" alt="JB Barber Shop" className="w-36 h-auto object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white" onClick={() => document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })}>
              Serviços
            </Button>
            <Button size="lg" className="bg-gradient-primary px-4 py-2" onClick={() => navigate("/booking")}>
              Marcar Agendamento
            </Button>
          </div>
        </div>
      </header>
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <Scissors className="absolute top-20 left-10 w-8 h-8 text-primary/20 floating-scissors" style={{ animationDelay: '0s' }} />
          <Scissors className="absolute top-40 right-20 w-6 h-6 text-primary/15 rotating-scissors" style={{ animationDelay: '2s' }} />
          <Scissors className="absolute bottom-60 left-20 w-10 h-10 text-primary/10 cutting-scissors" style={{ animationDelay: '1s' }} />
          <Scissors className="absolute top-60 left-1/3 w-7 h-7 text-primary/20 fade-pulse" style={{ animationDelay: '3s' }} />
          <Scissors className="absolute bottom-40 right-10 w-9 h-9 text-primary/15 floating-scissors" style={{ animationDelay: '4s' }} />
          <Scissors className="absolute top-1/2 right-1/4 w-5 h-5 text-primary/25 bouncing-element" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen flex items-center justify-start">
          {/* imagem grande de fundo */}
          <img
            src="/images/pombal.jpg"
            alt="Pombal - JB Barber Shop"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* overlay escuro para melhorar contraste do texto */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="container mx-auto px-0 text-center relative z-10">

            {/* mantive apenas "JB" como título sobre a imagem, texto em branco */}

            <p className="text-xl md:text-7xl text-white/90 mb-12 max-w-5xl text-left font-bold">
              Experiência premium em cuidados masculinos. Cortes modernos, barbas impecáveis,
              ambiente sofisticado.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-start relative">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6 bouncing-element"
                onClick={() => navigate("/booking")}
              >
                Marcar Agendamento
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-white hover:bg-primary/10 text-lg px-8 py-6"
                onClick={() => document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Ver Serviços
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="py-20 bg-muted/5">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
              Nossos Serviços
            </h3>

            {/* Botões em linha */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {services.map((service, index) => {
                const isActive = index === activeServiceIndex;
                return (
                  <Button
                    key={service.name}
                    onClick={() => setActiveServiceIndex(index)}
                    aria-pressed={isActive}
                    size="lg"
                    className={`px-6 py-3 rounded-full transition-transform duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-luxury transform scale-105"
                        : "bg-card text-foreground hover:scale-105 border border-primary/10"
                    }`}
                  >
                    {service.name}
                  </Button>
                );
              })}
            </div>

            {/* Informação do serviço ativo */}
            <div className="max-w-3xl mx-auto">
              <Card className="bg-card border-primary/20 shadow-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ActiveIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold mb-1 text-foreground">
                        {services[activeServiceIndex].name}
                      </h4>
                      <p className="text-primary text-3xl font-bold">
                        {services[activeServiceIndex].price} <span className="text-sm text-muted-foreground ml-2">{services[activeServiceIndex].duration}</span>
                      </p>
                      <p className="text-lg text-muted-foreground mt-3">
                        {services[activeServiceIndex].description}
                      </p>
                      <div className="mt-4">
                        <Button onClick={() => navigate("/booking")} className="bg-gradient-primary px-6 py-3">
                          Marcar {services[activeServiceIndex].name}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* antigo grid de cartões removido */}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
              Por Que Escolher JB?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="text-center group relative">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 floating-scissors">
                      <FeatureIcon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h4 className="text-2xl font-semibold mb-4 text-foreground">{feature.title}</h4>
                    <p className="text-lg text-muted-foreground">{feature.description}</p>
                    {index === 1 && (
                      <Scissors className="absolute -top-4 -left-4 w-8 h-8 text-primary/20 fade-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
              O Nosso Espaço
            </h3>
            
            <div className="relative">
              <div className="flex gap-8 animate-[slide_20s_linear_infinite]">
                <div className="min-w-[400px] group overflow-hidden rounded-xl shadow-luxury">
                  <img 
                    src="/images/barbeiro2.png" 
                    alt="Interior da barbearia JB - profissionais a trabalhar" 
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-[400px] group overflow-hidden rounded-xl shadow-luxury">
                  <img 
                    src="/images/barbeiro1.png" 
                    alt="Ambiente profissional da barbearia JB" 
                    className="w-full h-80 object-cover object-bottom transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-[400px] group overflow-hidden rounded-xl shadow-luxury">
                  <img 
                    src="/images/barbeiro2.png" 
                    alt="Interior da barbearia JB - profissionais a trabalhar" 
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-[400px] group overflow-hidden rounded-xl shadow-luxury">
                  <img 
                    src="/images/barbeiro1.png" 
                    alt="Ambiente profissional da barbearia JB" 
                    className="w-full h-80 object-cover object-bottom transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
            
            <p className="text-center text-lg text-muted-foreground mt-8 max-w-2xl mx-auto">
              Ambiente moderno e profissional onde cada detalhe é pensado para proporcionar 
              a melhor experiência em cuidados masculinos.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/5 overflow-hidden">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
              O Que Dizem os Nossos Clientes
            </h3>
            
            <div className="relative">
              <div className="flex gap-8 animate-[slideReverse_25s_linear_infinite]">
                <div className="min-w-[350px] bg-card p-6 rounded-xl shadow-luxury border border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"Excelente atendimento! O Júlio é um verdadeiro artista com a tesoura."</p>
                  <p className="text-sm text-muted-foreground">- Miguel Santos</p>
                </div>
                
                <div className="min-w-[350px] bg-card p-6 rounded-xl shadow-luxury border border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"Ambiente top, profissionais de qualidade. Recomendo vivamente!"</p>
                  <p className="text-sm text-muted-foreground">- João Silva</p>
                </div>
                
                <div className="min-w-[350px] bg-card p-6 rounded-xl shadow-luxury border border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"O Brando fez um degradê perfeito! Voltarei certamente."</p>
                  <p className="text-sm text-muted-foreground">- Carlos Ferreira</p>
                </div>
                
                <div className="min-w-[350px] bg-card p-6 rounded-xl shadow-luxury border border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"Melhor barbearia da região! Serviço 5 estrelas."</p>
                  <p className="text-sm text-muted-foreground">- Pedro Costa</p>
                </div>
                
                <div className="min-w-[350px] bg-card p-6 rounded-xl shadow-luxury border border-primary/20">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4">"Sempre saio satisfeito! Equipa muito profissional."</p>
                  <p className="text-sm text-muted-foreground">- Rui Mendes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-muted/5">
          <div className="container mx-auto px-4">
            <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
              Contacto & Localização
            </h3>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <Card className="bg-card border-primary/20">
                <CardContent className="p-8">
                  <h4 className="text-2xl font-semibold mb-6 text-foreground">Informações de Contacto</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Phone className="w-6 h-6 text-primary" />
                      <span className="text-lg">+351 912 345 678</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mail className="w-6 h-6 text-primary" />
                      <span className="text-lg">info@jbbarbershop.pt</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPin className="w-6 h-6 text-primary" />
                      <span className="text-lg">Av. Heróis do Ultramar 61<br />3100-462 Pombal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-primary/20">
                <CardContent className="p-8">
                  <h4 className="text-2xl font-semibold mb-6 text-foreground">Horário de Funcionamento</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Segunda - Sexta</span>
                      <span className="text-primary font-semibold">9:00 - 19:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado</span>
                      <span className="text-primary font-semibold">9:00 - 19:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span className="text-primary font-semibold">9:00 - 13:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Pronto para o Seu Novo Look?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agende já o seu horário e experimente o melhor em cuidados masculinos
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-lg px-12 py-6 relative group"
              onClick={() => navigate("/booking")}
            >
              <Scissors className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-foreground/70 group-hover:cutting-scissors" />
              Agendar Agora
              <Scissors className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-foreground/70 group-hover:cutting-scissors" style={{ animationDelay: '0.5s' }} />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;