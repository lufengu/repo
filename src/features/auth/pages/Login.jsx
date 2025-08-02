import { LoginForm } from '../components/LoginForm';
import '../styles/Login.css'; 
import loginIllustration from '../../../assets/login-illustration.png';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-ios-blue-pastel sm:bg-brand-orange-light p-4">
      <div className="relative flex w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Columna de la imagen */}
        <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#EBF5FF] p-12">
          <img
            src={loginIllustration}
            alt="Ilustración de Inicio de Sesión"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Columna del formulario */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h1>
          <p className="text-gray-500 mb-8">Tu tienda, más inteligente que nunca.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;