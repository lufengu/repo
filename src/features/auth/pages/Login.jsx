
import { LoginForm } from '../components/LoginForm';
import hexagonFondo from '../../../assets/Hexagon (2).svg';
import techderoImg from '../../../assets/techdero.png';
import '../styles/Login.css';



function Login() {
  return (
  <div className="min-h-screen w-full flex items-center justify-center relative bg-[linear-gradient(135deg,_#007BFF_0%,_#004080_70%,_#FF6600_100%)] overflow-hidden">
      {/* Fondo decorativo SVG esquina superior izquierda volteada */}
      <img
        src={hexagonFondo}
        alt="Decoración fondo"
        className="pointer-events-none select-none absolute left-0 top-0 z-0 w-full h-full object-cover"
        style={{ minWidth: '100vw', minHeight: '100vh', width: '100vw', height: '100vh', transform: 'scaleX(1) scaleY(1)' }}
        aria-hidden="true"
      />
      {/* Imagen */}
      <div className="hidden lg:flex flex-col items-center justify-end h-full absolute left-0 bottom-0 z-10 pl-2 pb-19">
        <img src={techderoImg} alt="Techdero ilustración" className="max-h-[90vh] w-auto object-contain drop-shadow-2xl" style={{ minHeight: 400, maxHeight: '90vh' }} />
      </div>
      <div className="flex flex-col items-center w-full max-w-md p-6 ml-auto mr-0 lg:mr-16 z-10">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;