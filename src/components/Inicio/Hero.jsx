import banner1 from "../../img/banner1.png"
import SearchBox from "./SearchBox"

const Hero = () => {
  return (
    <section className="w-full">
      {/* Desktop: Banner con SearchBox superpuesto */}
      <div className="hidden md:block relative w-full">
        <img 
          src={banner1} 
          alt="Movitex - Todos tus destinos favoritos en un solo click" 
          className="w-full h-auto object-contain"
          style={{ aspectRatio: '1081/466' }}
        />
        <SearchBox />
      </div>
      
      {/* Mobile: Solo SearchBox sin banner */}
      <div className="md:hidden w-full pt-8">
        <SearchBox />
      </div>
    </section>
  );
};

export default Hero;