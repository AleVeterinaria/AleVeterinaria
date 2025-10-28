import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const questionnaireSchema = z.object({
  clientName: z.string().min(2, 'El nombre del cliente es requerido'),
  petName: z.string().min(1, 'El nombre de la mascota es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  appointmentDate: z.string().optional(),
  travelMethod: z.string().optional(),
  travelBehaviors: z.array(z.string()).default([]),
  otherTravelBehavior: z.string().optional(),
  dislikes: z.array(z.string()).default([]),
  behaviorAroundOthers: z.string().optional(),
  sensitiveBodyAreas: z.string().optional(),
  difficultProcedures: z.string().optional(),
  petReaction: z.string().optional(),
  favoriteTreats: z.string().optional(),
  favoriteToys: z.string().optional(),
  previousMedications: z.string().optional(),
  medicationResults: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type QuestionnaireForm = z.infer<typeof questionnaireSchema>;

interface PreVisitQuestionnaireProps {
  appointmentData?: any;
  onComplete?: () => void;
}

const PreVisitQuestionnaire = ({ appointmentData, onComplete }: PreVisitQuestionnaireProps = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuestionnaireForm>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      clientName: appointmentData?.tutorInfo?.name || appointmentData?.tutorName || '',
      petName: appointmentData?.petName || '',
      email: appointmentData?.tutorInfo?.email || appointmentData?.tutorEmail || '',
      phone: appointmentData?.tutorInfo?.phone || appointmentData?.tutorPhone || '',
      appointmentDate: appointmentData?.appointmentDate || '',
      travelBehaviors: [],
      dislikes: [],
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: QuestionnaireForm) => {
      console.log('Enviando cuestionario:', data);
      
      // Include appointment and pet IDs if available
      const questionnaireData = {
        ...data,
        appointmentId: appointmentData?.id,
        petId: appointmentData?.petId || appointmentData?.selectedPetData?.id,
        appointmentDate: appointmentData?.appointmentDate ? new Date(appointmentData.appointmentDate) : undefined
      };
      
      const result = await apiRequest('/api/questionnaires', 'POST', questionnaireData);
      console.log('Respuesta del servidor:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Cuestionario enviado exitosamente:', data);
      toast({
        title: "Cuestionario Enviado",
        description: "Tu cuestionario pre-visita ha sido enviado exitosamente.",
      });
      
      // Call onComplete callback if provided (for modal flow)
      if (onComplete) {
        onComplete();
      } else {
        // Reset form if used standalone
        form.reset();
        setCurrentStep(1);
      }
    },
    onError: (error) => {
      console.error('Error al enviar cuestionario:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el cuestionario. Por favor, inténtalo nuevamente.",
        variant: "destructive",
      });
    },
  });

  const travelBehaviorOptions = [
    "Ansioso y excitado", "Reacio", "Se esconde", "Babea", "Vomita", "Se orina/defeca",
    "No quiere caminar", "Ladra/Maúlla", "Gime", "Jadea", "Tiembla", "Está inquieto"
  ];

  const dislikeOptions = [
    "Entrar en el transportín o el automóvil",
    "Ir a la consulta",
    "Entrar al centro veterinario", 
    "Ser subido a la mesa para examinarlo",
    "Otras personas y/o animales pasando cerca en la recepción",
    "Tener contacto visual directo con el técnico y/o veterinario",
    "Esperar con otras personas y animales en la sala de espera",
    "Voces fuertes durante el examen",
    "Ser abordado por personal veterinario",
    "Que le tomen la temperatura rectal",
    "Subirse a la balanza",
    "El uso de instrumentos como estetoscopio u otoscopio",
    "Escuchar el timbre, interfono o teléfonos sonando",
    "Sonidos que vienen de la parte de atrás de la clínica",
    "Ser sacado de la consulta para realizar procedimientos"
  ];

  const handleCheckboxChange = (value: string, field: 'travelBehaviors' | 'dislikes') => {
    const currentValues = form.getValues(field) || [];
    if (currentValues.includes(value)) {
      form.setValue(field, currentValues.filter(item => item !== value));
    } else {
      form.setValue(field, [...currentValues, value]);
    }
  };

  const onSubmit = (data: QuestionnaireForm) => {
    submitMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-poppins font-bold text-darkgray mb-4">
          Cuestionario Previo a la Visita Fear Free®
        </h2>
        <p className="text-gray-600 font-lato mb-6">
          Como Profesionales Certificados Fear Free®, queremos hacer que la experiencia veterinaria de tu animal 
          sea lo más agradable y libre de estrés posible. Por favor, responde las siguientes preguntas para 
          personalizar la atención.
        </p>
        
        {/* Progress Bar */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step <= currentStep ? 'bg-mint text-darkgray' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-2 mx-2 ${
                  step < currentStep ? 'bg-mint' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-poppins font-semibold text-darkgray mb-4">
              Información Básica
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  {...form.register('clientName')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="client-name-input"
                />
                {form.formState.errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  Nombre de la Mascota *
                </label>
                <input
                  {...form.register('petName')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="pet-name-input"
                />
                {form.formState.errors.petName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.petName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...form.register('email')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="email-input"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  Teléfono
                </label>
                <input
                  {...form.register('phone')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Cómo y dónde viaja tu mascota en el automóvil?
              </label>
              <textarea
                {...form.register('travelMethod')}
                rows={3}
                placeholder="Ejemplo: transportín, cinturón de seguridad, suelto, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="travel-method-input"
              />
            </div>
          </div>
        )}

        {/* Step 2: Travel and Behavior */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-poppins font-semibold text-darkgray mb-4">
              Comportamiento Durante el Viaje
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-darkgray mb-4">
                Durante el viaje al centro veterinario, marca las conductas que presenta tu mascota:
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                {travelBehaviorOptions.map((behavior) => (
                  <label key={behavior} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.watch('travelBehaviors')?.includes(behavior) || false}
                      onChange={() => handleCheckboxChange(behavior, 'travelBehaviors')}
                      className="rounded border-gray-300 text-mint focus:ring-mint"
                      data-testid={`travel-behavior-${behavior.toLowerCase().replace(/\s/g, '-')}`}
                    />
                    <span className="text-sm text-darkgray">{behavior}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                Otro comportamiento:
              </label>
              <input
                {...form.register('otherTravelBehavior')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="other-travel-behavior-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Cómo describirías a tu mascota cerca de otros animales y personas?
              </label>
              <textarea
                {...form.register('behaviorAroundOthers')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="behavior-around-others-input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Veterinary Experiences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-poppins font-semibold text-darkgray mb-4">
              Experiencias Veterinarias
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-darkgray mb-4">
                Marca las situaciones que no le han gustado a tu mascota:
              </label>
              <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {dislikeOptions.map((dislike) => (
                  <label key={dislike} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.watch('dislikes')?.includes(dislike) || false}
                      onChange={() => handleCheckboxChange(dislike, 'dislikes')}
                      className="rounded border-gray-300 text-mint focus:ring-mint mt-1"
                      data-testid={`dislike-${dislike.toLowerCase().replace(/\s/g, '-')}`}
                    />
                    <span className="text-sm text-darkgray">{dislike}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Tu mascota tiene áreas del cuerpo sensibles que no le gusta que toquen?
              </label>
              <textarea
                {...form.register('sensitiveBodyAreas')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="sensitive-body-areas-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Hay algún procedimiento que no le haya gustado? ¿Cómo reaccionó?
              </label>
              <textarea
                {...form.register('difficultProcedures')}
                rows={3}
                placeholder="Describe el procedimiento y la reacción..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="difficult-procedures-input"
              />
            </div>
          </div>
        )}

        {/* Step 4: Preferences and Additional Info */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-poppins font-semibold text-darkgray mb-4">
              Preferencias y Información Adicional
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  ¿Cuáles son los premios favoritos de tu mascota?
                </label>
                <input
                  {...form.register('favoriteTreats')}
                  placeholder="Trae algunos para la próxima visita"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="favorite-treats-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-darkgray mb-2">
                  ¿A tu mascota le gusta jugar con juguetes? ¿Cuáles?
                </label>
                <input
                  {...form.register('favoriteToys')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                  data-testid="favorite-toys-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Le han recetado medicamentos para visitas veterinarias? ¿Cuáles y qué resultados?
              </label>
              <textarea
                {...form.register('previousMedications')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="previous-medications-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgray mb-2">
                ¿Algo más que quieras que sepamos?
              </label>
              <textarea
                {...form.register('additionalInfo')}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-mint"
                data-testid="additional-info-input"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-darkgray hover:bg-gray-200'
            }`}
            data-testid="prev-step-button"
          >
            Anterior
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-mint text-darkgray rounded-lg font-medium hover:shadow-lg transition-all"
              data-testid="next-step-button"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="px-6 py-3 bg-mint text-darkgray rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              data-testid="submit-questionnaire-button"
            >
              {submitMutation.isPending ? 'Enviando...' : 'Enviar Cuestionario'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PreVisitQuestionnaire;