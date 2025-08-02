import { LoginForm } from '../components/LoginForm';
import '../styles/Login.css'; 
import logoCompleto from '../../../assets/logoCompleto.png';
import tendebotInicio from '../../../assets/tendebotInicio.png';

function Login() {
  return (
    <div className="flex flex-col lg:flex-row w-full h-screen">
      <div className="relative w-full flex flex-col items-center justify-center lg:w-1/2 z-10 px-8 py-12">
        {/* Elemento con animación */}
        <div className="absolute -top-16 -left-20 w-40 h-40 bg-orange-500 rotate-[55deg] animate-spin-slow z-0"></div>
        <img
          src={logoCompleto}
          alt="Logo Techderos"
          className="max-w-xs mb-2 z-10"
        />
        <p className="text-gray-700 font-semibold text-lg mb-6 z-10">
          Tu tienda más inteligente que nunca
        </p>
        <LoginForm />
      </div>
      <div className="hidden lg:flex h-full w-1/2 items-end justify-center relative overflow-hidden">
        {/* Fondo con clip personalizado y color corregido */}
        <div className="absolute w-full h-full bg-ios-blue clip-diagonal z-0"></div>
        <img
          src={tendebotInicio}
          alt="Ilustración de inicio"
          className="z-10 w-4/6 object-contain"
        />
      </div>
    </div>
  );
}

export default Login;