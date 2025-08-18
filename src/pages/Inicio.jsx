import Navbar from '../components/Navbar';
import Hero from '../components/Inicio/Hero';
import DestinosPopulares from '../components/Inicio/DestinosPopulares';
import PorQueElegirnos from '../components/Inicio/PorQueElegirnos';
import Footer from '../components/Footer';

const Inicio = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DestinosPopulares />
      <PorQueElegirnos />
      <Footer />
    </div>
  );
};

export default Inicio;
