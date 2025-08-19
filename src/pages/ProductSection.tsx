import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const products = [
  {
    name: "Pomada Modeladora",
    price: "€12",
    image: "/images/oleo.jpeg",
    description: "Fixação forte, acabamento natural. Ideal para todos os tipos de cabelo.",
  },
  {
    name: "Óleo para Barba",
    price: "€15",
    image: "/images/produto2.png",
    description: "Hidrata e perfuma, deixando a barba macia e saudável.",
  },
  {
    name: "Shampoo Masculino",
    price: "€10",
    image: "/images/produto3.png",
    description: "Limpeza profunda e refrescante para o dia a dia.",
  },
];

const ProductSection = () => (
  <section id="product-section" className="py-20 bg-muted/5">
    <div className="container mx-auto px-4">
      <h3 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
        Nossos Produtos
      </h3>
      <div className="grid md:grid-cols-3 gap-10">
        {products.map((product) => (
          <Card key={product.name} className="bg-card border-primary/20 shadow-luxury">
            <CardContent className="p-6 flex flex-col items-center">
              <img src={product.image} alt={product.name} className="w-24 h-24 object-contain mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-foreground">{product.name}</h4>
              <p className="text-muted-foreground mb-2 text-center">{product.description}</p>
              <span className="text-primary font-bold text-lg mb-2">{product.price}</span>
              <Button size="sm" className="bg-gradient-primary px-4">Comprar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-lg text-muted-foreground mt-8 max-w-2xl mx-auto">
        Produtos selecionados para garantir o melhor cuidado masculino. Disponíveis na barbearia.
      </p>
    </div>
  </section>
);

export default ProductSection;