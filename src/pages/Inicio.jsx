import Navbar from '../components/Navbar';
import Hero from '../components/Inicio/Hero';
import DestinosDisponibles from '../components/Inicio/DestinosDisponibles';
import Footer from '../components/Footer';

const Inicio = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DestinosDisponibles />
      <Footer />
    </div>
  );
};

export default Inicio;
