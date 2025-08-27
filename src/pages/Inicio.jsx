import Navbar from '../components/Navbar';
import Hero from '../components/Inicio/Hero';
import DestinosPopulares from '../components/Inicio/DestinosPopulares';
import Footer from '../components/Footer';

const Inicio = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DestinosPopulares />
      <Footer />
    </div>
  );
};

export default Inicio;
