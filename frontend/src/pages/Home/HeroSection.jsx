import HeroCard from "../../components/HeroCard";

export default function HeroSection() {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
      <HeroCard
        category="VENTA DIRECTA"
        title="Potencia tu Setup"
        subtitle="al Máximo Nivel"
        buttonText="Ver Catálogo de Venta"
        color="blue"
        image="https://assets.nvidia.partners/images/png/geforce-rtx-4090-back.png"
        onClick={() => handleScrollTo("hardware")}
      />

      <HeroCard
        category="LEASING EMPRESARIAL"
        title="Tecnología sin"
        subtitle="Descapitalizarte"
        buttonText="Cotizar Arrendamiento"
        color="cyan"
        image="https://pngimg.com/d/macbook_PNG55.png"
        onClick={() => handleScrollTo("arrendamiento")}
      />
    </div>
  );
}
