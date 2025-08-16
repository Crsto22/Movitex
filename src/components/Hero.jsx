import banner1 from "../img/banner1.png"

const Hero = () => {
  return (
    <section className="w-full">
      <div className="relative w-full">
        <img 
          src={banner1} 
          alt="Movitex - Todos tus destinos favoritos en un solo click" 
          className="w-full h-auto object-cover max-h-[70vh] min-h-[400px]"
        />
      </div>
    </section>
  );
};

export default Hero;
