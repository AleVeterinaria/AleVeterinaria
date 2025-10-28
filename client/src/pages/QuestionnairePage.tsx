import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import PreVisitQuestionnaire from '@/components/PreVisitQuestionnaire';
import { Link } from 'wouter';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const QuestionnairePage = () => {
  const [location] = useLocation();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  // Extract token from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const token = urlParams.get('token');

  // Validate token if present
  const { data: tokenValidation, isLoading: validatingToken, error: tokenError } = useQuery({
    queryKey: ['/api/questionnaire', token],
    enabled: !!token,
    retry: false
  });

  useEffect(() => {
    if (token && tokenValidation) {
      setTokenData(tokenValidation);
      setIsTokenValid(true);
    } else if (token && tokenError) {
      setIsTokenValid(false);
    }
  }, [token, tokenValidation, tokenError]);

  // If there's a token but it's being validated
  if (token && validatingToken) {
    return (
      <div className="min-h-screen bg-warmbeige py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-mint" />
          <h2 className="text-xl font-semibold text-darkgray mb-2">Validando enlace...</h2>
          <p className="text-gray-600">Por favor espera mientras validamos tu enlace del cuestionario.</p>
        </div>
      </div>
    );
  }

  // If token is invalid
  if (token && isTokenValid === false) {
    return (
      <div className="min-h-screen bg-warmbeige py-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-darkgray mb-4">Enlace Inválido</h2>
          <p className="text-gray-600 mb-6">
            El enlace del cuestionario ha expirado o no es válido. Por favor, solicita un nuevo enlace o completa el cuestionario directamente.
          </p>
          <Link 
            href="/portal/tutor" 
            className="inline-block bg-mint hover:bg-mint/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ir al Portal del Tutor
          </Link>
        </div>
      </div>
    );
  }

  // If token is valid, show appointment-specific questionnaire
  if (token && isTokenValid && tokenData) {
    return (
      <div className="min-h-screen bg-warmbeige py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-poppins font-bold text-darkgray mb-4">
              Cuestionario Pre-Visita Fear Free®
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Completa este cuestionario para tu cita programada. Esto nos ayudará a brindar la mejor atención para {tokenData.petName || 'tu mascota'}.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-green-800 text-sm">
                <strong>✅ Enlace Válido:</strong> Este cuestionario está vinculado a tu cita programada.
              </p>
            </div>
          </div>
          
          <PreVisitQuestionnaire 
            appointmentData={{
              appointmentId: tokenData.appointmentId,
              tutorEmail: tokenData.tutorEmail,
              petName: tokenData.petName
            }}
            onComplete={() => {
              window.location.href = '/';
            }}
          />
        </div>
      </div>
    );
  }

  // Default questionnaire page (no token)
  return (
    <div className="min-h-screen bg-warmbeige py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-poppins font-bold text-darkgray mb-4">
            Cuestionario Pre-Visita
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Completa este cuestionario para que podamos brindarte la mejor atención Fear Free® a tu mascota.
          </p>
          
          {/* Notice about preferred flow */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>💡 Consejo:</strong> Para una experiencia más completa, te recomendamos{' '}
              <Link href="/portal/tutor" className="text-blue-600 underline hover:text-blue-800">
                agendar tu cita primero
              </Link>{' '}
              y luego completar el cuestionario automáticamente vinculado a tu mascota.
            </p>
          </div>
        </div>
        
        <PreVisitQuestionnaire />
      </div>
    </div>
  );
};

export default QuestionnairePage;