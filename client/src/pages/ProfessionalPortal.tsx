import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, Stethoscope, Calendar, User, Phone, Mail, MapPin, Save, AlertCircle, Heart, Syringe, ShoppingCart, Bug, Award, Printer, Download, Eye, Trash2, ChevronDown, ChevronUp, ArrowLeft, LogOut, Edit2, Bell, ExternalLink, X, Clock, Car, DogIcon, Pill, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { breeds, getBreedsBySpecies } from '@/data/breeds';
import { validateRUT, formatRUTInput } from '@/lib/rutValidator';
import { calculateAge, formatAge } from '@/utils/ageCalculator';
import { generatePrescriptionPDF, generateCertificatePDF } from '@/utils/pdfGenerator';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { ObjectUploader } from '@/components/ObjectUploader';
import { ScheduleManagerAdvanced } from '@/components/ScheduleManagerAdvanced';
import { NutritionManagement } from '@/components/NutritionManagement';
import { NotificationSettings } from '@/components/NotificationSettings';
import { GoogleCalendarIntegration } from '@/components/GoogleCalendarIntegration';
import { formatDateToChilean, formatISOToChilean, getCurrentDateISO } from '@/utils/dateFormatter';
import { chileanRegions, getAllRegions, getCommunesByRegion } from '@/data/chileanRegions';
import { formatPhoneInput, isValidPhoneNumber, getPhoneValidationMessage } from '@/utils/phoneFormatter';

// Helper function to safely sanitize HTML content and prevent XSS
const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'div', 'span'],
    ALLOWED_ATTR: ['style']
  });
};

export default function ProfessionalPortal() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState(false);
  const [activeSection, setActiveSection] = useState('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  
  // Estados para comunicación directa
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Query para obtener citas por RUT del tutor
  const useAppointmentsByTutor = (tutorRut: string) => {
    return useQuery({
      queryKey: ['/api/appointments/tutor', tutorRut],
      enabled: !!tutorRut,
      staleTime: 1000 * 60 * 5, // 5 minutos
    });
  };

  // Componente para mostrar citas próximas del paciente
  const UpcomingAppointments = ({ tutorRut }: { tutorRut: string }) => {
    const { data: appointments = [], isLoading } = useAppointmentsByTutor(tutorRut);
    
    if (isLoading) return <div className="text-xs text-text-muted">Cargando citas...</div>;
    
    // Filtrar citas futuras y confirmadas, ordenar por fecha más cercana
    const upcomingAppointments = appointments
      .filter((apt: any) => {
        const appointmentDate = new Date(apt.appointmentDate + 'T' + apt.appointmentTime);
        return appointmentDate > new Date() && apt.status !== 'cancelled';
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.appointmentDate + 'T' + a.appointmentTime);
        const dateB = new Date(b.appointmentDate + 'T' + b.appointmentTime);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 2); // Solo mostrar las 2 próximas citas

    if (upcomingAppointments.length === 0) {
      return <div className="text-xs text-text-muted">Sin citas próximas</div>;
    }

    return (
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-mint" />
          <span className="text-xs font-medium text-mint">Próximas citas:</span>
        </div>
        {upcomingAppointments.map((apt: any) => (
          <div key={apt.id} className="text-xs bg-mint/10 p-2 rounded border border-mint/20">
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-mint" />
              <span className="font-medium">
                {formatDateToChilean(apt.appointmentDate)} a las {apt.appointmentTime}
              </span>
            </div>
            <div className="text-text-muted truncate">{apt.serviceType}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs py-0 px-1 border-mint text-mint">
                {apt.status === 'confirmed' ? 'Confirmada' : apt.status}
              </Badge>
            </div>
          </div>
        ))}
        {appointments.filter((apt: any) => apt.status !== 'cancelled').length > 2 && (
          <div className="text-xs text-text-muted">
            +{appointments.filter((apt: any) => apt.status !== 'cancelled').length - 2} cita(s) más
          </div>
        )}
      </div>
    );
  };
  
  // Check URL parameters and sessionStorage for navigation
  useEffect(() => {
    console.log('ProfessionalPortal useEffect - checking navigation');
    
    // Check for navigation data from sessionStorage (from calendar)
    const selectedPetData = sessionStorage.getItem('selectedPetData');
    const navigateToSection = sessionStorage.getItem('navigateToSection');
    
    console.log('SessionStorage data:', { selectedPetData: !!selectedPetData, navigateToSection });
    
    if (selectedPetData && (navigateToSection === 'patient-details' || navigateToSection === 'patient-hub')) {
      try {
        const petData = JSON.parse(selectedPetData);
        console.log('Parsed pet data from session:', petData);
        
        setSelectedPatient(petData);
        setActiveSection('patient-hub');
        
        console.log('Navigation successful - patient set and section changed to patient-hub');
        
        // Check if there's an appointment to edit
        const editAppointmentId = sessionStorage.getItem('editAppointmentId');
        if (editAppointmentId) {
          setEditingAppointmentId(editAppointmentId);
          setShowAppointmentScheduler(true);
          sessionStorage.removeItem('editAppointmentId');
        }
        
        // Clean up sessionStorage
        sessionStorage.removeItem('selectedPetData');
        sessionStorage.removeItem('navigateToSection');
        
        toast({
          title: "Navegación exitosa",
          description: `Ficha de ${petData.name} cargada desde el calendario`
        });
      } catch (error) {
        console.error('Error parsing pet data from session:', error);
        toast({
          title: "Error de navegación",
          description: "No se pudo cargar la ficha del paciente desde el calendario",
          variant: "destructive"
        });
      }
      return;
    }

    // Check URL parameters for navigation from calendar
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const petId = urlParams.get('petId');
    const tutorRut = urlParams.get('tutorRut');
    const searchParam = urlParams.get('search');
    
    if (section && petId && tutorRut) {
      setActiveSection(section as any);
      setSearchTerm(tutorRut);
    } else if (searchParam) {
      setSearchTerm(searchParam);
      setActiveSection('search');
    }
  }, []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    consultations: true,
    prescriptions: true,
    vaccinations: true,
    certificates: true,
    questionnaires: true
  });

  // State for exam documents upload
  const [examDocumentData, setExamDocumentData] = useState({
    examType: '',
    notes: '',
    uploadedFile: null as any
  });

  // State for questionnaire detail modal
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [showQuestionnaireDetail, setShowQuestionnaireDetail] = useState(false);

  // State for exam document deletion
  const [examDocumentToDelete, setExamDocumentToDelete] = useState<any>(null);

  // State for nutrition section
  const [nutritionData, setNutritionData] = useState({
    currentWeight: '',
    idealWeight: '',
    bcs: '',
    bcsMethod: 'canine_9_point',
    activityFactor: '1.6',
    weightGoal: 'maintain',
    targetWeight: '',
    currentFood: '',
    currentFoodBrand: '',
    dailyAmount: '',
    feedingFrequency: '',
    treats: '',
    supplements: '',
    bodyConditionNotes: '',
    nutritionalConcerns: '',
    recommendations: '',
    followUpDate: '',
    thoracicPerimeter: '',
    limbLength: '',
    calculatedIdealWeight: ''
  });

  // State for tutor report
  const [tutorReport, setTutorReport] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    visitReason: '',
    clinicalFindings: '',
    diagnosis: '',
    treatmentPerformed: '',
    medications: '',
    recommendations: '',
    followUpInstructions: '',
    nextAppointment: '',
    urgentSigns: '',
    tutorQuestions: ''
  });

  const [foodData, setFoodData] = useState({
    name: '',
    brand: '',
    type: 'kibble',
    species: 'Ambos',
    lifeStage: 'adult',
    calories: '',
    protein: '',
    fat: '',
    carbohydrates: '',
    fiber: '',
    moisture: '',
    calcium: '',
    phosphorus: '',
    sodium: '',
    ingredients: '',
    notes: ''
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [showEditFood, setShowEditFood] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    rer: 0,
    der: 0,
    recommendedAmount: 0,
    idealWeight: 0,
    weightStatus: '',
    bcsPercentage: 0
  });

  // Nutrition mutations
  const saveNutritionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/nutrition-assessments', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition-assessments/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Evaluación nutricional guardada correctamente" });
      // Reset form
      setNutritionData({
        currentWeight: '',
        idealWeight: '',
        bcs: '',
        bcsMethod: 'canine_9_point',
        activityFactor: '1.6',
        weightGoal: 'maintain',
        targetWeight: '',
        currentFood: '',
        currentFoodBrand: '',
        dailyAmount: '',
        feedingFrequency: '',
        treats: '',
        supplements: '',
        bodyConditionNotes: '',
        nutritionalConcerns: '',
        recommendations: '',
        followUpDate: ''
      });
    },
    onError: () => toast({ title: "Error", description: "No se pudo guardar la evaluación", variant: "destructive" })
  });

  const saveFoodMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/foods', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      toast({ title: "Éxito", description: "Alimento agregado correctamente" });
      setShowAddFood(false);
      resetFoodForm();
    },
    onError: () => toast({ title: "Error", description: "No se pudo agregar el alimento", variant: "destructive" })
  });

  const updateFoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiRequest(`/api/foods/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      toast({ title: "Éxito", description: "Alimento actualizado correctamente" });
      setShowEditFood(false);
      setEditingFood(null);
      resetFoodForm();
    },
    onError: () => toast({ title: "Error", description: "No se pudo actualizar el alimento", variant: "destructive" })
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/foods/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      toast({ title: "Éxito", description: "Alimento eliminado correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar el alimento", variant: "destructive" })
  });

  // Fetch foods query
  const { data: foods = [], isLoading: foodsLoading } = useQuery({
    queryKey: ['/api/foods'],
    enabled: activeSection === 'nutrition'
  }) as { data: any[], isLoading: boolean };

  // Fetch nutrition assessments query
  const { data: nutritionAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/nutrition-assessments/pet', selectedPatient?.id],
    enabled: activeSection === 'nutrition' && !!selectedPatient?.id
  });

  // Handle save nutrition assessment
  const handleSaveNutritionAssessment = () => {
    if (!selectedPatient || !user?.uid) {
      toast({ title: "Error", description: "Información de paciente o veterinario no disponible", variant: "destructive" });
      return;
    }

    const assessmentData = {
      petId: selectedPatient.id,
      veterinarianId: user.uid,
      assessmentDate: new Date().toISOString(),
      ...nutritionData,
      rer: calculatedValues.rer > 0 ? calculatedValues.rer.toString() : '',
      der: calculatedValues.der > 0 ? calculatedValues.der.toString() : '',
      recommendedCalories: calculatedValues.der > 0 ? calculatedValues.der.toString() : '',
      recommendedAmount: calculatedValues.recommendedAmount > 0 ? calculatedValues.recommendedAmount.toString() : '',
    };

    saveNutritionMutation.mutate(assessmentData);
  };

  // Reset food form
  const resetFoodForm = () => {
    setFoodData({
      name: '',
      brand: '',
      type: 'kibble',
      species: 'Ambos',
      lifeStage: 'adult',
      calories: '',
      protein: '',
      fat: '',
      carbohydrates: '',
      fiber: '',
      moisture: '',
      calcium: '',
      phosphorus: '',
      sodium: '',
      ingredients: '',
      notes: ''
    });
  };

  // Handle save food
  const handleSaveFood = () => {
    if (!foodData.name || !foodData.type) {
      toast({ title: "Error", description: "Nombre y tipo de alimento son requeridos", variant: "destructive" });
      return;
    }

    if (editingFood) {
      updateFoodMutation.mutate({ id: editingFood.id, data: foodData });
    } else {
      saveFoodMutation.mutate(foodData);
    }
  };

  // Handle edit food
  const handleEditFood = (food: any) => {
    setEditingFood(food);
    setFoodData({
      name: food.name || '',
      brand: food.brand || '',
      type: food.type || 'kibble',
      species: food.species || 'Ambos',
      lifeStage: food.lifeStage || 'adult',
      calories: food.calories || '',
      protein: food.protein || '',
      fat: food.fat || '',
      carbohydrates: food.carbohydrates || '',
      fiber: food.fiber || '',
      moisture: food.moisture || '',
      calcium: food.calcium || '',
      phosphorus: food.phosphorus || '',
      sodium: food.sodium || '',
      ingredients: food.ingredients || '',
      notes: food.notes || ''
    });
    setShowEditFood(true);
  };

  // Handle delete food
  const handleDeleteFood = (foodId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
      deleteFoodMutation.mutate(foodId);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditFood(false);
    setEditingFood(null);
    resetFoodForm();
  };

  // Form states for exam orders
  const [examOrderData, setExamOrderData] = useState({
    selectedExams: [] as string[],
    clinicalHistory: '',
    clinicalSuspicion: '',
    urgency: 'normal' as 'normal' | 'urgent' | 'stat',
    fastingRequired: false,
    specialInstructions: '',
    orderDate: new Date().toISOString().split('T')[0]
  });

  // State for exam management
  const [examFilter, setExamFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [customExamData, setCustomExamData] = useState({
    name: '',
    category: '',
    newCategory: '',
    description: '',
    preparationInstructions: '',
    fastingRequired: false
  });

  // Load exams from localStorage or use defaults
  const [availableExams, setAvailableExams] = useState(() => {
    const defaultExams = [
      { id: 'hemograma', name: 'Hemograma Completo', category: 'Hematología', description: 'Análisis completo de células sanguíneas' },
      { id: 'bioquimica', name: 'Bioquímica Sanguínea', category: 'Bioquímica', description: 'Panel básico de química sanguínea' },
      { id: 'perfil-renal', name: 'Perfil Renal (Urea/Creatinina)', category: 'Bioquímica', description: 'Evaluación de función renal' },
      { id: 'perfil-hepatico', name: 'Perfil Hepático (ALT/AST)', category: 'Bioquímica', description: 'Evaluación de función hepática' },
      { id: 'perfil-tiroideo', name: 'Perfil Tiroideo (T4)', category: 'Endocrinología', description: 'Evaluación de función tiroidea' },
      { id: 'glucosa', name: 'Glucosa', category: 'Bioquímica', description: 'Medición de glucosa en sangre' },
      { id: 'proteinas-totales', name: 'Proteínas Totales', category: 'Bioquímica', description: 'Medición de proteínas totales' },
      { id: 'electrolitos', name: 'Electrolitos (Na/K/Cl)', category: 'Bioquímica', description: 'Panel de electrolitos séricos' },
      { id: 'urinanalisis', name: 'Análisis de Orina', category: 'Urología', description: 'Análisis físico, químico y microscópico de orina' },
      { id: 'coprocultivo', name: 'Coprocultivo', category: 'Parasitología', description: 'Búsqueda de parásitos en heces' },
      { id: 'radiografia-torax', name: 'Radiografía de Tórax', category: 'Imagenología', description: 'Imagen radiográfica del tórax' },
      { id: 'radiografia-abdomen', name: 'Radiografía de Abdomen', category: 'Imagenología', description: 'Imagen radiográfica del abdomen' },
      { id: 'ecografia-abdominal', name: 'Ecografía Abdominal', category: 'Imagenología', description: 'Ultrasonido abdominal' },
      { id: 'ecocardiograma', name: 'Ecocardiograma', category: 'Cardiología', description: 'Ultrasonido del corazón' },
      { id: 'electrocardiograma', name: 'Electrocardiograma', category: 'Cardiología', description: 'Registro de actividad eléctrica cardíaca' },
      { id: 'citologia', name: 'Citología', category: 'Patología', description: 'Análisis microscópico de células' },
      { id: 'histopatologia', name: 'Histopatología', category: 'Patología', description: 'Análisis microscópico de tejidos' },
      { id: 'cultivo-bacteriano', name: 'Cultivo Bacteriano', category: 'Microbiología', description: 'Cultivo para identificación de bacterias' },
      { id: 'pcr', name: 'PCR', category: 'Biología Molecular', description: 'Técnica de amplificación de ADN' },
      { id: 'serologia', name: 'Serología', category: 'Inmunología', description: 'Análisis de anticuerpos en suero' }
    ];

    try {
      const savedExams = localStorage.getItem('ale-veterinaria-custom-exams');
      if (savedExams) {
        const customExams = JSON.parse(savedExams);
        return [...defaultExams, ...customExams];
      }
    } catch (error) {
      console.error('Error loading custom exams from localStorage:', error);
    }
    
    return defaultExams;
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Form states for new patient
  const [newPatientData, setNewPatientData] = useState({
    // Datos del tutor
    tutorName: '',
    tutorRut: '',
    tutorPhone: '',
    tutorPhone2: '',
    tutorEmail: '',
    tutorRegion: '',
    tutorComuna: '',
    tutorAddress: '',
    tutorHouseNumber: '',
    tutorApartmentNumber: '',
    tutorCity: '',
    // Datos del paciente
    name: '',
    species: 'Canino' as 'Canino' | 'Felino',
    breed: '',
    sex: 'Macho',
    reproductiveStatus: 'Entero',
    birthDate: '',
    colorMarkings: '',
    microchip: '',
    weight: '',
    origin: 'Adopción'
  });

  // Available breeds based on species
  const [availableBreeds, setAvailableBreeds] = useState(getBreedsBySpecies('Canino'));
  
  // Form validation states
  const [rutValidation, setRutValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const [birthDateValidation, setBirthDateValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });

  // Update breeds when species changes
  useEffect(() => {
    setAvailableBreeds(getBreedsBySpecies(newPatientData.species));
    setNewPatientData(prev => ({ ...prev, breed: '' })); // Reset breed when species changes
  }, [newPatientData.species]);

  // Form states for consultation
  const [consultationData, setConsultationData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    consultationReason: '',
    anamnesis: '',
    // Parámetros vitales
    respiratoryRate: '',
    weight: '',
    temperature: '',
    capillaryRefillTime: '',
    heartRate: '',
    mucosaColor: '',
    // Examen físico
    physicalExamination: '',
    physicalExamFindings: '',
    presumptiveDiagnosis: '',
    therapeuticPlan: '',
    additionalNotes: '',
    nextAppointment: ''
  });

  // Form states for vaccination
  const [vaccinationData, setVaccinationData] = useState({
    // Enfermedades para caninos
    distemper: false,
    adenovirus: false,
    leptospira_canicola: false,
    leptospira_icterohaemorrhagiae: false,
    leptospira_grippotyphosa_pomona: false,
    parvovirus: false,
    parainfluenza: false,
    coronavirus: false,
    antirrabica: false,
    // Enfermedades para felinos
    panleucopenia: false,
    rinotraqueitis: false,
    calicivirus: false,
    // Enfermedades adicionales
    leucemia_felina: false,
    // Información adicional
    vaccineName: '', // Nombre específico de la vacuna
    vaccineBrand: '', // Marca/laboratorio de la vacuna
    vaccineType: '', // Tipo de vacuna: 'octuple', 'sextuple', etc.
    vaccineSubType: '', // Subtipo: 'viva_modificada', 'inactivada', 'mixta'
    laboratory: '',
    batchNumber: '',
    serialNumber: '',
    applicationDate: new Date().toISOString().split('T')[0],
    validityDate: '', // Fecha de vigencia
    validityType: 'predefined', // 'predefined' o 'custom'
    validityPeriod: '1', // Período de validez en años
    customValidityMonths: '', // Meses personalizados
    notes: ''
  });

  // Calcular automáticamente la fecha de vigencia cuando cambien los parámetros
  useEffect(() => {
    if (vaccinationData.applicationDate) {
      const appDate = new Date(vaccinationData.applicationDate);
      let validityDate = '';

      if (vaccinationData.validityType === 'predefined') {
        // Usar el período predefinido en años
        const validity = new Date(appDate);
        const yearsToAdd = parseInt(vaccinationData.validityPeriod as string);
        validity.setFullYear(validity.getFullYear() + yearsToAdd);
        validityDate = validity.toISOString().split('T')[0];
      } else if (vaccinationData.validityType === 'manual' && vaccinationData.customValidityMonths) {
        // Usar meses personalizados
        const validity = new Date(appDate);
        validity.setMonth(validity.getMonth() + parseInt(vaccinationData.customValidityMonths));
        validityDate = validity.toISOString().split('T')[0];
      }

      // Solo actualizar si la fecha calculada es diferente
      if (validityDate && validityDate !== vaccinationData.validityDate) {
        setVaccinationData(prev => ({
          ...prev,
          validityDate
        }));
      }
    }
  }, [vaccinationData.applicationDate, vaccinationData.validityType, vaccinationData.validityPeriod, vaccinationData.customValidityMonths]);

  // Form states for deworming
  const [dewormingData, setDewormingData] = useState({
    type: 'internal',
    product: '',
    activeIngredient: '',
    dose: '',
    laboratory: '',
    batchNumber: '',
    applicationDate: new Date().toISOString().split('T')[0],
    applicationTime: '09:00',
    nextDueDate: '',
    duration: '',
    notes: ''
  });

  // Calcular automáticamente la próxima dosis de desparasitación
  useEffect(() => {
    if (dewormingData.applicationDate && dewormingData.duration) {
      const appDate = new Date(dewormingData.applicationDate);
      let nextDueDate = '';

      // Calcular según la duración seleccionada
      const nextDate = new Date(appDate);
      switch (dewormingData.duration) {
        case '1-month':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case '3-months':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case '6-months':
          nextDate.setMonth(nextDate.getMonth() + 6);
          break;
        case '1-year':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          // Para otros casos, no calcular automáticamente
          return;
      }
      
      nextDueDate = nextDate.toISOString().split('T')[0];

      // Solo actualizar si la fecha calculada es diferente
      if (nextDueDate && nextDueDate !== dewormingData.nextDueDate) {
        setDewormingData(prev => ({
          ...prev,
          nextDueDate
        }));
      }
    }
  }, [dewormingData.applicationDate, dewormingData.duration]);

  // Form states for certificates
  const [certificateData, setCertificateData] = useState({
    type: 'health',
    purpose: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    observations: '',
    additionalInfo: '',
    microchipType: 'implantation', // 'implantation' or 'verification'
    isRegisteredInNationalDB: true, // true if registered in national pet database
    // Export certificate specific fields
    destination: '',
    exportObservations: '',
    examDate: new Date().toISOString().split('T')[0],
    validityDays: '10'
  });

  // Form states for prescription
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [] as Array<{
      id: string, 
      name: string, 
      dosage: string, 
      frequency: string, 
      duration: string,
      administrationRoute: string,
      medicationType: string,
      specialInstructions?: string
    }>,
    indications: '',
    warnings: '',
    specialInstructions: '',
    issueDate: new Date().toISOString().split('T')[0]
  });


  // Selected medication for adding
  const [selectedMedication, setSelectedMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    administrationRoute: '',
    specialInstructions: ''
  });


  // Custom medication form
  const [showCustomMedicationForm, setShowCustomMedicationForm] = useState(false);
  const [showPeriodicMedForm, setShowPeriodicMedForm] = useState(false);
  const [periodicMedication, setPeriodicMedication] = useState({
    medication: '',
    dose: '',
    frequency: '',
    route: 'vía oral',
    notes: ''
  });
  const [customMedication, setCustomMedication] = useState({
    commercialName: '',
    activeIngredient: '',
    usage: 'veterinario' as 'veterinario' | 'humano',
    presentation: '',
    dosage: '',
    frequency: '',
    duration: '',
    administrationRoute: '',
    specialInstructions: ''
  });

  // Add medication to prescription
  const addMedicationToPrescription = () => {
    if (!selectedMedication.name || !selectedMedication.dosage || !selectedMedication.frequency || !selectedMedication.duration || !selectedMedication.administrationRoute) {
      toast({
        title: "Error",
        description: "Todos los campos del medicamento son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const newMedication = {
      id: `${Date.now()}`,
      name: selectedMedication.name,
      dosage: selectedMedication.dosage,
      frequency: selectedMedication.frequency,
      duration: selectedMedication.duration,
      administrationRoute: selectedMedication.administrationRoute,
      medicationType: '',
      specialInstructions: selectedMedication.specialInstructions
    };

    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));

    // Reset selection
    setSelectedMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      administrationRoute: '',
      specialInstructions: ''
    });

    toast({
      title: "Medicamento agregado",
      description: `${selectedMedication.name} agregado a la prescripción`
    });
  };

  // Remove medication from prescription
  const removeMedicationFromPrescription = (medicationId: string) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId)
    }));
  };

  // Add custom exam
  const addCustomExam = () => {
    if (!customExamData.name || (!customExamData.category && !customExamData.newCategory)) {
      toast({
        title: "Error",
        description: "Completa el nombre del examen y selecciona o crea una categoría",
        variant: "destructive"
      });
      return;
    }

    const examCategory = customExamData.newCategory || customExamData.category;
    const newExam = {
      id: `custom-${Date.now()}`,
      name: customExamData.name,
      category: examCategory,
      description: customExamData.description || 'Examen personalizado',
      preparationInstructions: customExamData.preparationInstructions,
      fastingRequired: customExamData.fastingRequired,
      isCustom: true
    };

    // Update state
    const updatedExams = [...availableExams, newExam];
    setAvailableExams(updatedExams);

    // Save custom exams to localStorage
    try {
      const customExams = updatedExams.filter(exam => exam.isCustom);
      localStorage.setItem('ale-veterinaria-custom-exams', JSON.stringify(customExams));
    } catch (error) {
      console.error('Error saving custom exam to localStorage:', error);
    }

    // Reset form
    setCustomExamData({
      name: '',
      category: '',
      newCategory: '',
      description: '',
      preparationInstructions: '',
      fastingRequired: false
    });
    setShowAddExamForm(false);

    toast({
      title: "Éxito",
      description: `Examen "${newExam.name}" agregado correctamente`
    });
  };

  // Remove custom exam
  const removeCustomExam = (examId: string) => {
    const updatedExams = availableExams.filter(exam => exam.id !== examId);
    setAvailableExams(updatedExams);

    // Update localStorage
    try {
      const customExams = updatedExams.filter(exam => exam.isCustom);
      localStorage.setItem('ale-veterinaria-custom-exams', JSON.stringify(customExams));
    } catch (error) {
      console.error('Error updating custom exams in localStorage:', error);
    }

    // Remove from selected exams if it was selected
    setExamOrderData(prev => ({
      ...prev,
      selectedExams: prev.selectedExams.filter(id => id !== examId)
    }));

    toast({
      title: "Examen eliminado",
      description: "El examen personalizado ha sido eliminado"
    });
  };

  // Delete mutations for all record types
  const deletePrescriptionMutation = useMutation({
    mutationFn: (prescriptionId: string) => apiRequest(`/api/prescriptions/firebase/${prescriptionId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/firebase/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Receta eliminada correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la receta", variant: "destructive" })
  });

  const deleteVaccinationMutation = useMutation({
    mutationFn: (vaccinationId: string) => apiRequest(`/api/vaccinations/firebase/${vaccinationId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaccinations/firebase/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Vacuna eliminada correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la vacuna", variant: "destructive" })
  });

  const deleteDewormingMutation = useMutation({
    mutationFn: (dewormingId: string) => apiRequest(`/api/dewormings/firebase/${dewormingId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dewormings/firebase/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Desparasitación eliminada correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la desparasitación", variant: "destructive" })
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: (certificateId: string) => apiRequest(`/api/certificates/firebase/${certificateId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Certificado eliminado correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar el certificado", variant: "destructive" })
  });

  const deleteMedicalRecordMutation = useMutation({
    mutationFn: (recordId: string) => apiRequest(`/api/medical-records/firebase/${recordId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records/firebase/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Consulta médica eliminada correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la consulta médica", variant: "destructive" })
  });

  const deleteExamOrderMutation = useMutation({
    mutationFn: (examOrderId: string) => apiRequest(`/api/exam-orders/firebase/${examOrderId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exam-orders/firebase/pet', selectedPatient?.id] });
      toast({ title: "Éxito", description: "Orden de exámenes eliminada correctamente" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la orden de exámenes", variant: "destructive" })
  });

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = availableExams.map(exam => exam.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  // Filter exams based on search and category
  const getFilteredExams = () => {
    return availableExams.filter(exam => {
      const matchesFilter = exam.name.toLowerCase().includes(examFilter.toLowerCase()) ||
                           exam.description?.toLowerCase().includes(examFilter.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
      return matchesFilter && matchesCategory;
    });
  };

  // Add custom medication to prescription
  const addCustomMedicationToPrescription = () => {
    if (!customMedication.commercialName || !customMedication.activeIngredient || !customMedication.presentation || 
        !customMedication.dosage || !customMedication.frequency || !customMedication.duration) {
      toast({
        title: "Error",
        description: "Todos los campos del medicamento personalizado son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const medicationName = `${customMedication.commercialName} (${customMedication.activeIngredient} - ${customMedication.presentation}) - Uso ${customMedication.usage}`;

    const newMedication = {
      id: `custom-${Date.now()}`,
      name: medicationName,
      dosage: customMedication.dosage,
      frequency: customMedication.frequency,
      duration: customMedication.duration,
      administrationRoute: customMedication.administrationRoute,
      medicationType: 'Personalizado',
      specialInstructions: customMedication.specialInstructions
    };

    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));

    // Reset custom medication form
    setCustomMedication({
      commercialName: '',
      activeIngredient: '',
      usage: 'veterinario',
      presentation: '',
      dosage: '',
      frequency: '',
      duration: '',
      administrationRoute: '',
      specialInstructions: ''
    });

    setShowCustomMedicationForm(false);

    toast({
      title: "Medicamento agregado",
      description: `${customMedication.commercialName} agregado a la prescripción`
    });
  };

  useEffect(() => {
    if (!user) {
      console.log('No user authenticated, redirecting to home...');
      setLocation('/');
    } else {
      console.log('User authenticated in professional portal:', user.uid);
    }
  }, [user, setLocation]);

  // Event listener for navigation from calendar
  useEffect(() => {
    const handleNavigateToPetRecord = async (event: any) => {
      const { petId, tutorRut, appointmentId } = event.detail;
      
      try {
        console.log('Navigating to pet record:', { petId, tutorRut });
        
        // Fetch pet data
        const response = await fetch(`/api/pets/rut/${tutorRut}`);
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const tutorPets = await response.json();
          console.log('Fetched pets:', tutorPets);
          
          const pet = tutorPets.find((p: any) => p.id === petId);
          console.log('Found pet:', pet);
          
          if (pet) {
            setSelectedPatient(pet);
            setActiveSection('patient-hub');
            toast({ 
              title: "Navegación exitosa", 
              description: `Ficha de ${pet.name} abierta desde el calendario` 
            });
          } else {
            console.error('Pet not found in tutor pets list');
            toast({ 
              title: "Error", 
              description: "No se encontró el paciente especificado", 
              variant: "destructive" 
            });
          }
        } else {
          console.error('Failed to fetch pets:', response.status);
          toast({ 
            title: "Error", 
            description: "No se pudieron cargar los pacientes del tutor", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
        toast({ 
          title: "Error", 
          description: "Error de conexión al cargar la ficha del paciente", 
          variant: "destructive" 
        });
      }
    };

    const handleEditAppointment = (event: any) => {
      const { appointmentId, appointmentData } = event.detail;
      
      // Buscar la información del paciente relacionado con la cita
      if (appointmentData && appointmentData.petId) {
        // Establecer el paciente de la cita como paciente seleccionado
        const petData = {
          id: appointmentData.petId,
          name: appointmentData.petName,
          species: appointmentData.species,
          tutorName: appointmentData.tutorName,
          tutorRut: appointmentData.tutorRut,
          tutorPhone: appointmentData.tutorPhone,
          tutorEmail: appointmentData.tutorEmail
        };
        
        setSelectedPatient(petData);
        sessionStorage.setItem('selectedPetData', JSON.stringify(petData));
        sessionStorage.setItem('navigateToSection', 'patient-hub');
        sessionStorage.setItem('editAppointmentId', appointmentId);
        
        setActiveSection('patient-hub');
        
        toast({ 
          title: "Editando cita", 
          description: `Cita de ${appointmentData.petName} cargada para edición` 
        });
      } else {
        toast({ 
          title: "Error", 
          description: "No se pudo cargar la información de la cita", 
          variant: "destructive" 
        });
      }
    };

    window.addEventListener('navigate-to-pet-record', handleNavigateToPetRecord);
    window.addEventListener('edit-appointment', handleEditAppointment);
    
    return () => {
      window.removeEventListener('navigate-to-pet-record', handleNavigateToPetRecord);
      window.removeEventListener('edit-appointment', handleEditAppointment);
    };
  }, [toast]);

  // Función para calcular peso ideal (PIBW) o FBMI
  // Factores DER por especie
  const canineDERFactors = [
    { value: "1.6", label: "Canino - Adulto castrado (1.6)" },
    { value: "1.8", label: "Canino - Adulto entero (1.8)" },
    { value: "1.2", label: "Canino - Inactivo/obeso (1.2)" },
    { value: "1.3", label: "Canino - Inactivo/obeso (1.3)" },
    { value: "1.4", label: "Canino - Inactivo/obeso (1.4)" },
    { value: "1.0", label: "Canino - Pérdida de peso (1.0)" },
    { value: "1.1", label: "Canino - Cuidado crítico (1.1)" },
    { value: "1.21", label: "Canino - Ganancia peso (1.2)" },
    { value: "1.31", label: "Canino - Ganancia peso (1.3)" },
    { value: "1.41", label: "Canino - Ganancia peso (1.4)" },
    { value: "1.5", label: "Canino - Ganancia peso (1.5)" },
    { value: "1.61", label: "Canino - Ganancia peso (1.6)" },
    { value: "1.71", label: "Canino - Ganancia peso (1.7)" },
    { value: "1.81", label: "Canino - Ganancia peso (1.8)" },
    { value: "1.62", label: "Canino - Trabajo ligero (1.6)" },
    { value: "1.72", label: "Canino - Trabajo ligero (1.7)" },
    { value: "1.82", label: "Canino - Trabajo ligero (1.8)" },
    { value: "1.9", label: "Canino - Trabajo ligero (1.9)" },
    { value: "2.0", label: "Canino - Trabajo ligero (2.0)" },
    { value: "2.01", label: "Canino - Trabajo moderado (2.0)" },
    { value: "2.1", label: "Canino - Trabajo moderado (2.1)" },
    { value: "2.2", label: "Canino - Trabajo moderado (2.2)" },
    { value: "2.3", label: "Canino - Trabajo moderado (2.3)" },
    { value: "2.4", label: "Canino - Trabajo moderado (2.4)" },
    { value: "2.5", label: "Canino - Trabajo moderado (2.5)" },
    { value: "3.0", label: "Canino - Trabajo moderado (3.0)" },
    { value: "3.5", label: "Canino - Trabajo moderado (3.5)" },
    { value: "4.0", label: "Canino - Trabajo moderado (4.0)" },
    { value: "4.5", label: "Canino - Trabajo moderado (4.5)" },
    { value: "5.0", label: "Canino - Trabajo moderado (5.0)" },
    { value: "5.01", label: "Canino - Trabajo pesado (5.0)" },
    { value: "6.0", label: "Canino - Trabajo pesado (6.0)" },
    { value: "7.0", label: "Canino - Trabajo pesado (7.0)" },
    { value: "8.0", label: "Canino - Trabajo pesado (8.0)" },
    { value: "9.0", label: "Canino - Trabajo pesado (9.0)" },
    { value: "10.0", label: "Canino - Trabajo pesado (10.0)" },
    { value: "11.0", label: "Canino - Trabajo pesado (11.0)" },
    { value: "1.83", label: "Canino - Gestación primeros 42 días (1.8)" },
    { value: "3.01", label: "Canino - Gestación últimos 21 días (3.0)" },
    { value: "3.02", label: "Canino - Lactancia 1 cachorro (3.0)" },
    { value: "3.51", label: "Canino - Lactancia 2 cachorros (3.5)" },
    { value: "4.01", label: "Canino - Lactancia 3-4 cachorros (4.0)" },
    { value: "5.02", label: "Canino - Lactancia 5-6 cachorros (5.0)" },
    { value: "5.5", label: "Canino - Lactancia 7-8 cachorros (5.5)" },
    { value: "6.01", label: "Canino - Lactancia 9+ cachorros (6.0)" },
    { value: "7.0", label: "Canino - Lactancia múltiple (7.0)" },
    { value: "8.01", label: "Canino - Lactancia múltiple (8.0)" },
    { value: "3.03", label: "Canino - Crecimiento hasta 4 meses (3.0)" },
    { value: "2.02", label: "Canino - Crecimiento 4+ meses (2.0)" }
  ];

  const felineDERFactors = [
    { value: "1.2", label: "Felino - Adulto castrado (1.2)" },
    { value: "1.3", label: "Felino - Adulto castrado (1.3)" },
    { value: "1.4", label: "Felino - Adulto castrado (1.4)" },
    { value: "1.41", label: "Felino - Adulto entero (1.4)" },
    { value: "1.5", label: "Felino - Adulto entero (1.5)" },
    { value: "1.6", label: "Felino - Adulto entero (1.6)" },
    { value: "1.01", label: "Felino - Inactivo/obeso (1.0)" },
    { value: "0.8", label: "Felino - Pérdida de peso (0.8)" },
    { value: "1.02", label: "Felino - Cuidado crítico (1.0)" },
    { value: "1.21", label: "Felino - Ganancia peso (1.2)" },
    { value: "1.31", label: "Felino - Ganancia peso (1.3)" },
    { value: "1.42", label: "Felino - Ganancia peso (1.4)" },
    { value: "1.51", label: "Felino - Ganancia peso (1.5)" },
    { value: "1.61", label: "Felino - Ganancia peso (1.6)" },
    { value: "1.7", label: "Felino - Ganancia peso (1.7)" },
    { value: "1.8", label: "Felino - Ganancia peso (1.8)" },
    { value: "1.11", label: "Felino - Senior 7-11 años (1.1)" },
    { value: "1.22", label: "Felino - Senior 7-11 años (1.2)" },
    { value: "1.32", label: "Felino - Senior 7-11 años (1.3)" },
    { value: "1.43", label: "Felino - Senior 7-11 años (1.4)" },
    { value: "1.12", label: "Felino - Muy senior +11 años (1.1)" },
    { value: "1.23", label: "Felino - Muy senior +11 años (1.2)" },
    { value: "1.33", label: "Felino - Muy senior +11 años (1.3)" },
    { value: "1.44", label: "Felino - Muy senior +11 años (1.4)" },
    { value: "1.52", label: "Felino - Muy senior +11 años (1.5)" },
    { value: "1.62", label: "Felino - Muy senior +11 años (1.6)" },
    { value: "1.63", label: "Felino - Gestación inicio (1.6)" },
    { value: "1.71", label: "Felino - Gestación progresiva (1.7)" },
    { value: "1.81", label: "Felino - Gestación progresiva (1.8)" },
    { value: "1.91", label: "Felino - Gestación progresiva (1.9)" },
    { value: "2.01", label: "Felino - Gestación al parto (2.0)" },
    { value: "2.02", label: "Felino - Lactancia básica (2.0)" },
    { value: "2.51", label: "Felino - Lactancia moderada (2.5)" },
    { value: "3.01", label: "Felino - Lactancia múltiple (3.0)" },
    { value: "3.52", label: "Felino - Lactancia múltiple (3.5)" },
    { value: "4.02", label: "Felino - Lactancia múltiple (4.0)" },
    { value: "4.51", label: "Felino - Lactancia múltiple (4.5)" },
    { value: "5.01", label: "Felino - Lactancia múltiple (5.0)" },
    { value: "5.51", label: "Felino - Lactancia múltiple (5.5)" },
    { value: "6.02", label: "Felino - Lactancia múltiple (6.0)" },
    { value: "2.52", label: "Felino - Crecimiento (2.5)" }
  ];

  // Función para calcular peso ideal basado en BCS (fórmula AAHA validada contra DEXA)
  const calculateIdealWeightFromBCS = (currentWeight: string, bcs: string) => {
    console.log('calculateIdealWeightFromBCS called with:', currentWeight, bcs);
    const weightNum = parseFloat(currentWeight);
    const bcsNum = parseInt(bcs);
    
    if (!weightNum || !bcsNum || weightNum <= 0) {
      console.log('Invalid input for calculation');
      return;
    }
    
    console.log('Processing calculation with weight:', weightNum, 'BCS:', bcsNum);
    let idealWeight = weightNum;
    let weightStatus = 'peso ideal';
    let weightGoal = 'maintain';
    
    // Fórmula AAHA: BCS 4-5 = ideal, cada punto = ±10% de peso
    if (bcsNum > 5) {
      // Sobrepeso: Peso ideal = Peso actual ÷ (1 + 0.10 × (BCS−5))
      idealWeight = weightNum / (1 + 0.10 * (bcsNum - 5));
      if (bcsNum >= 8) {
        weightStatus = 'obesidad severa';
      } else if (bcsNum >= 7) {
        weightStatus = 'obesidad moderada';
      } else {
        weightStatus = 'sobrepeso';
      }
      weightGoal = 'lose';
    } else if (bcsNum < 5) {
      // Bajo peso: Peso ideal = Peso actual ÷ (1 − 0.10 × (5−BCS))
      idealWeight = weightNum / (1 - 0.10 * (5 - bcsNum));
      if (bcsNum <= 2) {
        weightStatus = 'muy bajo peso';
      } else {
        weightStatus = 'bajo peso';
      }
      weightGoal = 'gain';
    } else {
      // BCS 4-5: Peso ideal
      idealWeight = weightNum;
      weightStatus = 'peso ideal';
      weightGoal = 'maintain';
    }
    
    console.log('Final calculated values:', { idealWeight, weightStatus, weightGoal });
    
    // Actualizar valores calculados
    setCalculatedValues(prev => ({
      ...prev,
      idealWeight,
      weightStatus,
      bcsPercentage: bcsNum !== 4 && bcsNum !== 5 ? Math.abs((idealWeight - weightNum) / idealWeight * 100) : 0
    }));
    
    // Actualizar datos de nutrición
    setNutritionData(prev => ({
      ...prev,
      idealWeight: idealWeight.toFixed(2),
      weightGoal,
      targetWeight: idealWeight.toFixed(2)
    }));
  };

  // Función para generar informe de consulta
  const generateConsultationReport = () => {
    if (!selectedPatient) {
      toast({ title: "Error", description: "Selecciona un paciente primero", variant: "destructive" });
      return;
    }

    const reportData = {
      patient: selectedPatient,
      consultation: {
        date: new Date().toLocaleDateString('es-CL'),
        veterinarian: user?.email || 'Dr. Veterinario',
        findings: consultationData.clinicalFindings || '',
        diagnosis: consultationData.diagnosis || '',
        treatment: consultationData.treatment || ''
      },
      nutrition: nutritionData,
      prescriptions: prescriptionData.medications,
      recommendations: {
        nutritional: nutritionData.recommendations,
        pharmacological: prescriptionData.specialInstructions,
        followUp: nutritionData.followUpDate,
        generalCare: consultationData.recommendations || ''
      }
    };

    // Crear PDF usando html2canvas y jsPDF
    generateConsultationPDF(reportData);
  };

  // Función para auto-rellenar informe con datos existentes
  const autoFillReport = () => {
    if (!selectedPatient) return;

    // Buscar la consulta más reciente
    const recentConsultation = medicalRecords.find((c: any) => c.petId === selectedPatient.id);
    
    // Buscar prescripciones recientes
    const recentPrescriptions = prescriptions.filter((p: any) => p.petId === selectedPatient.id);
    
    // Buscar vacunaciones recientes
    const recentVaccinations = vaccinations.filter((v: any) => v.petId === selectedPatient.id);
    
    // Buscar desparasitaciones recientes
    const recentDewormings = dewormingRecords.filter((d: any) => d.petId === selectedPatient.id);

    const updatedReport = { ...tutorReport };

    // Auto-rellenar desde consulta más reciente
    if (recentConsultation) {
      updatedReport.visitDate = recentConsultation.consultationDate || tutorReport.visitDate;
      updatedReport.visitReason = recentConsultation.consultationReason || tutorReport.visitReason;
      updatedReport.clinicalFindings = recentConsultation.clinicalFindings || tutorReport.clinicalFindings;
      updatedReport.diagnosis = recentConsultation.diagnosis || tutorReport.diagnosis;
    }

    // Auto-rellenar medicamentos desde prescripciones
    if (recentPrescriptions.length > 0) {
      const medications = recentPrescriptions.map((p: any) => 
        `${p.medication} - ${p.dosage}${p.frequency ? ` - ${p.frequency}` : ''}${p.duration ? ` por ${p.duration}` : ''}`
      ).join('\n');
      updatedReport.medications = medications || tutorReport.medications;
    }

    // Auto-rellenar tratamientos desde vacunas y desparasitaciones recientes
    const treatments = [];
    if (recentVaccinations.length > 0) {
      const vaccines = recentVaccinations.map((v: any) => `Vacuna: ${v.vaccine}`).join(', ');
      treatments.push(vaccines);
    }
    if (recentDewormings.length > 0) {
      const dewormingsList = recentDewormings.map((d: any) => `Desparasitación: ${d.product}`).join(', ');
      treatments.push(dewormingsList);
    }
    if (treatments.length > 0) {
      updatedReport.treatmentPerformed = treatments.join('. ') || tutorReport.treatmentPerformed;
    }

    setTutorReport(updatedReport);
    toast({ 
      title: "Informe auto-rellenado", 
      description: "Se han cargado los datos de consultas anteriores" 
    });
  };

  // Función para generar informe para tutor
  const generateTutorReport = () => {
    if (!selectedPatient) {
      toast({ title: "Error", description: "Selecciona un paciente primero", variant: "destructive" });
      return;
    }

    const reportData = {
      patient: selectedPatient,
      report: tutorReport
    };

    generateTutorReportPDF(reportData);
  };

  // Función para enviar informe por WhatsApp
  const sendReportToTutor = () => {
    if (!selectedPatient || !selectedPatient.ownerPhone) {
      toast({ title: "Error", description: "No hay número de teléfono del tutor", variant: "destructive" });
      return;
    }

    const reportText = `
*INFORME DE ATENCIÓN VETERINARIA*
🐾 Paciente: ${selectedPatient.name}
📅 Fecha: ${new Date(tutorReport.visitDate).toLocaleDateString('es-CL')}

*MOTIVO DE CONSULTA:*
${tutorReport.visitReason}

*HALLAZGOS:*
${tutorReport.clinicalFindings}

*DIAGNÓSTICO:*
${tutorReport.diagnosis}

*TRATAMIENTO REALIZADO:*
${tutorReport.treatmentPerformed}

${tutorReport.medications ? `*MEDICAMENTOS:*\n${tutorReport.medications}\n` : ''}

*RECOMENDACIONES:*
${tutorReport.recommendations}

*SEGUIMIENTO:*
${tutorReport.followUpInstructions}

${tutorReport.urgentSigns ? `⚠️ *SEÑALES DE ALERTA:*\n${tutorReport.urgentSigns}\n` : ''}

${tutorReport.nextAppointment ? `📅 *PRÓXIMA CITA:* ${new Date(tutorReport.nextAppointment).toLocaleDateString('es-CL')}\n` : ''}

---
Ale Veterinaria - Servicios a Domicilio
    `.trim();

    // Crear enlace de WhatsApp
    const phoneNumber = selectedPatient.ownerPhone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/56${phoneNumber}?text=${encodeURIComponent(reportText)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({ 
      title: "WhatsApp abierto", 
      description: "El informe está listo para enviar al tutor" 
    });
  };

  // Función para generar PDF del informe para tutor
  const generateTutorReportPDF = (data: any) => {
    const reportHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 20px;">
            <img src="/attached_assets/logo1_1755107256138.png" alt="Ale Veterinaria Logo" style="max-height: 80px; max-width: 200px;" />
          </div>
          <h1 style="color: #5FA98D; margin-bottom: 10px;">Ale Veterinaria</h1>
          <h2 style="color: #333; margin-bottom: 5px;">Informe de Atención Veterinaria</h2>
          <p style="color: #666;">Fecha: ${new Date(data.report.visitDate).toLocaleDateString('es-CL')}</p>
        </div>

        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Información del Paciente</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div><strong>Nombre:</strong> ${data.patient.name}</div>
            <div><strong>Especie:</strong> ${data.patient.species}</div>
            <div><strong>Raza:</strong> ${data.patient.breed}</div>
            <div><strong>Edad:</strong> ${data.patient.age}</div>
          </div>
          <div style="margin-top: 15px;">
            <strong>Tutor:</strong> ${data.patient.ownerName}
          </div>
        </div>

        ${data.report.visitReason ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Motivo de la Consulta</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.visitReason)}</p>
        </div>` : ''}

        ${data.report.clinicalFindings ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Hallazgos de la Evaluación</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.clinicalFindings)}</p>
        </div>` : ''}

        ${data.report.diagnosis ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Diagnóstico</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.diagnosis)}</p>
        </div>` : ''}

        ${data.report.treatmentPerformed ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Tratamiento Realizado</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.treatmentPerformed)}</p>
        </div>` : ''}

        ${data.report.medications ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Medicamentos Prescritos</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.medications)}</p>
        </div>` : ''}

        ${data.report.recommendations ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Recomendaciones para el Hogar</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.recommendations)}</p>
        </div>` : ''}

        ${data.report.followUpInstructions ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Instrucciones de Seguimiento</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.report.followUpInstructions)}</p>
          ${data.report.nextAppointment ? `<p style="margin-top: 10px;"><strong>Próxima cita:</strong> ${new Date(data.report.nextAppointment).toLocaleDateString('es-CL')}</p>` : ''}
        </div>` : ''}

        ${data.report.urgentSigns ? `
        <div style="border: 1px solid #ffebee; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #ffebee;">
          <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px;">⚠️ Señales de Alerta</h3>
          <p style="margin-top: 15px; color: #d32f2f; font-weight: 500;">${sanitizeHtml(data.report.urgentSigns)}</p>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">Si observa estos síntomas, contacte inmediatamente al veterinario.</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Ale Veterinaria - Servicios Veterinarios a Domicilio</p>
          <p>Santiago, Chile</p>
          <p style="margin-top: 10px; font-style: italic;">Este informe ha sido preparado especialmente para el tutor de ${sanitizeHtml(data.patient.name)}</p>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = DOMPurify.sanitize(reportHtml);
    document.body.appendChild(element);

    // Usar html2pdf para generar el PDF
    import('html2pdf.js').then((html2pdf) => {
      const opt = {
        margin: 1,
        filename: `informe_tutor_${sanitizeHtml(data.patient.name)}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf.default().from(element).set(opt).save().then(() => {
        document.body.removeChild(element);
        toast({ 
          title: "Informe generado", 
          description: "El informe para el tutor se ha descargado correctamente" 
        });
      });
    });
  };

  // Función para generar PDF del informe
  const generateConsultationPDF = (data: any) => {
    const reportHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 20px;">
            <img src="/attached_assets/logo1_1755107256138.png" alt="Ale Veterinaria Logo" style="max-height: 80px; max-width: 200px;" />
          </div>
          <h1 style="color: #5FA98D; margin-bottom: 10px;">Ale Veterinaria</h1>
          <h2 style="color: #333; margin-bottom: 5px;">Informe de Consulta Veterinaria</h2>
          <p style="color: #666;">Fecha: ${data.consultation.date}</p>
        </div>

        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Información del Paciente</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div><strong>Nombre:</strong> ${sanitizeHtml(data.patient.name)}</div>
            <div><strong>Especie:</strong> ${sanitizeHtml(data.patient.species)}</div>
            <div><strong>Raza:</strong> ${sanitizeHtml(data.patient.breed)}</div>
            <div><strong>Edad:</strong> ${sanitizeHtml(data.patient.age)}</div>
            <div><strong>Sexo:</strong> ${sanitizeHtml(data.patient.sex)}</div>
            <div><strong>Peso:</strong> ${sanitizeHtml(data.patient.weight)} kg</div>
          </div>
          <div style="margin-top: 15px;">
            <strong>Tutor:</strong> ${sanitizeHtml(data.patient.ownerName)}<br>
            <strong>Contacto:</strong> ${sanitizeHtml(data.patient.ownerPhone)}
          </div>
        </div>

        ${data.consultation.findings ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Hallazgos Clínicos</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.consultation.findings)}</p>
          ${data.consultation.diagnosis ? `<div style="margin-top: 15px;"><strong>Diagnóstico:</strong> ${sanitizeHtml(data.consultation.diagnosis)}</div>` : ''}
        </div>` : ''}

        ${data.nutrition.bcs || data.nutrition.currentWeight ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Evaluación Nutricional</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            ${data.nutrition.currentWeight ? `<div><strong>Peso Actual:</strong> ${sanitizeHtml(data.nutrition.currentWeight)} kg</div>` : ''}
            ${data.nutrition.idealWeight ? `<div><strong>Peso Ideal:</strong> ${sanitizeHtml(data.nutrition.idealWeight)} kg</div>` : ''}
            ${data.nutrition.bcs ? `<div><strong>BCS:</strong> ${sanitizeHtml(data.nutrition.bcs)}/9</div>` : ''}
            ${data.nutrition.calculatedIdealWeight ? `<div><strong>${data.nutrition.bcsMethod === 'canine_9_point' ? 'PIBW' : 'FBMI'}:</strong> ${sanitizeHtml(data.nutrition.calculatedIdealWeight)} ${data.nutrition.bcsMethod === 'canine_9_point' ? 'kg' : ''}</div>` : ''}
          </div>
          ${data.nutrition.currentFood ? `<div style="margin-top: 15px;"><strong>Alimento Actual:</strong> ${sanitizeHtml(data.nutrition.currentFood)} ${data.nutrition.currentFoodBrand ? '(' + sanitizeHtml(data.nutrition.currentFoodBrand) + ')' : ''}</div>` : ''}
        </div>` : ''}

        ${data.recommendations.nutritional ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Recomendaciones Nutricionales</h3>
          <p style="margin-top: 15px;">${sanitizeHtml(data.recommendations.nutritional)}</p>
        </div>` : ''}

        ${data.prescriptions && data.prescriptions.length > 0 ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Prescripciones</h3>
          <div style="margin-top: 15px;">
            ${data.prescriptions.map((med: any) => `
              <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                <strong>${sanitizeHtml(med.commercialName)}</strong> (${sanitizeHtml(med.activeIngredient)})<br>
                <small style="color: #666;">
                  Dosis: ${sanitizeHtml(med.dosage)} | Frecuencia: ${sanitizeHtml(med.frequency)} | Duración: ${sanitizeHtml(med.duration)}<br>
                  Vía: ${sanitizeHtml(med.administrationRoute)}
                  ${med.specialInstructions ? ' | ' + sanitizeHtml(med.specialInstructions) : ''}
                </small>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${data.recommendations.followUp ? `
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #5FA98D; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">Seguimiento</h3>
          <p style="margin-top: 15px;"><strong>Próximo control:</strong> ${new Date(data.recommendations.followUp).toLocaleDateString('es-CL')}</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Médico Veterinario: ${sanitizeHtml(data.consultation.veterinarian)}</p>
          <p>Ale Veterinaria - Servicios Veterinarios a Domicilio</p>
          <p>Santiago, Chile</p>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = DOMPurify.sanitize(reportHtml);
    document.body.appendChild(element);

    // Usar html2pdf para generar el PDF
    import('html2pdf.js').then((html2pdf) => {
      const opt = {
        margin: 1,
        filename: `informe_consulta_${sanitizeHtml(data.patient.name)}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf.default().from(element).set(opt).save().then(() => {
        document.body.removeChild(element);
        toast({ 
          title: "Informe generado", 
          description: "El informe de consulta se ha descargado correctamente" 
        });
      });
    });
  };

  // Search patients query
  // Loading state for searches
  const [searchLoading, setSearchLoading] = useState(false);

  // Get selected patient's data - use PostgreSQL first, then Firebase fallback
  const { data: patientData, refetch: refetchPatient } = useQuery({
    queryKey: ['/api/pets', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return null;
      
      try {
        // Try PostgreSQL first
        let response = await fetch(`/api/pets/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        // Fallback to Firebase
        response = await fetch(`/api/patients/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return selectedPatient; // Return the selected patient data as fallback
      } catch (error) {
        console.error('Error fetching patient data:', error);
        return selectedPatient;
      }
    }
  }) as { data: any, refetch: () => void };

  // Get patient's medical records - use PostgreSQL first
  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['/api/medical-records/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        // Try PostgreSQL first
        let response = await fetch(`/api/medical-records/pet/${selectedPatient.id}`);
        if (response.ok) {
          const pgRecords = await response.json();
          if (pgRecords.length > 0) return pgRecords;
        }
        
        // Fallback to Firebase
        response = await fetch(`/api/medical-records/firebase/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching medical records:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's vaccinations from Firebase
  const { data: vaccinations = [] } = useQuery({
    queryKey: ['/api/vaccinations/firebase/pet', selectedPatient?.id],
    staleTime: 0, // Force fresh data
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        const response = await fetch(`/api/vaccinations/firebase/pet/${selectedPatient.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Raw vaccination data from API:', data);
          // Map the Firebase data structure to the expected frontend structure
          const mappedData = data.map((vax: any) => ({
            id: vax.id,
            vaccineName: vax.vaccineName || vax.type || 'Vacuna',
            applicationDate: vax.applicationDate || vax.date,
            laboratory: vax.laboratory || vax.lab || vax.brand || 'No especificado',
            nextDueDate: vax.nextDueDate || vax.nextDose,
            dose: vax.dose,
            applicationRoute: vax.applicationRoute || 'Subcutánea',
            batchNumber: vax.batchNumber || vax.serial,
            notes: vax.notes || '',
            createdAt: vax.createdAt
          }));
          console.log('Mapped vaccination data:', mappedData);
          return mappedData;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching vaccinations:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's prescriptions from Firebase
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['/api/prescriptions/firebase/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        // Get prescriptions from Firebase
        const response = await fetch(`/api/prescriptions/firebase/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's certificates - use PostgreSQL first
  const { data: certificates = [] } = useQuery({
    queryKey: ['/api/certificates/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        // Try PostgreSQL first
        let response = await fetch(`/api/certificates/pet/${selectedPatient.id}`);
        if (response.ok) {
          const pgCertificates = await response.json();
          if (pgCertificates.length > 0) return pgCertificates;
        }
        
        // Fallback to Firebase
        response = await fetch(`/api/certificates/firebase/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching certificates:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's exam documents
  const { data: examDocuments = [] } = useQuery({
    queryKey: ['/api/exam-documents/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        const response = await fetch(`/api/exam-documents/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching exam documents:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's deworming records - use PostgreSQL first
  const { data: dewormingRecords = [] } = useQuery({
    queryKey: ['/api/dewormings/firebase/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        const response = await fetch(`/api/dewormings/firebase/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching deworming records:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Get patient's questionnaires
  const { data: questionnaires = [] } = useQuery({
    queryKey: ['/api/questionnaires/pet', selectedPatient?.id],
    enabled: !!selectedPatient?.id,
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      
      try {
        const response = await fetch(`/api/questionnaires/pet/${selectedPatient.id}`);
        if (response.ok) {
          return await response.json();
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
        return [];
      }
    }
  }) as { data: any[] };

  // Mutations for creating new records
  const createPatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/pets', 'POST', data),
    onSuccess: () => {
      toast({ title: "Paciente creado exitosamente" });
      setActiveSection('search');
      setNewPatientData({
        tutorName: '', tutorRut: '', tutorPhone: '', tutorPhone2: '', tutorEmail: '',
        tutorCity: '', tutorAddress: '', name: '', species: 'Canino', breed: '',
        sex: 'Macho', reproductiveStatus: 'Entero', birthDate: '', colorMarkings: '',
        microchip: '', weight: '', origin: 'Adopción'
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el paciente", variant: "destructive" });
    }
  });

  const createConsultationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/medical-records', 'POST', data),
    onSuccess: () => {
      toast({ title: "Consulta registrada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records/pet', selectedPatient?.id] });
      setConsultationData({
        consultationDate: new Date().toISOString().split('T')[0],
        consultationReason: '', anamnesis: '', respiratoryRate: '', weight: '', temperature: '',
        capillaryRefillTime: '', heartRate: '', mucosaColor: '', physicalExamination: '',
        physicalExamFindings: '', presumptiveDiagnosis: '', therapeuticPlan: '', additionalNotes: '', nextAppointment: ''
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo registrar la consulta", variant: "destructive" });
    }
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/prescriptions/firebase', 'POST', data),
    onSuccess: (result: any) => {
      toast({ title: "Receta guardada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/firebase/pet', selectedPatient?.id] });
      setPrescriptionData({ medications: [], indications: '', warnings: '', specialInstructions: '', issueDate: new Date().toISOString().split('T')[0] });
      
      // Generate and show PDF
      setTimeout(() => {
        generatePrescriptionPDF(selectedPatient, result, { name: 'Dra. Alejandra Cautín Bastías' });
      }, 500);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar la receta", variant: "destructive" });
    }
  });

  // Delete exam document mutation
  const deleteExamDocumentMutation = useMutation({
    mutationFn: (examDocumentId: string) => apiRequest(`/api/exam-documents/${examDocumentId}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Documento de examen eliminado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/exam-documents/pet', selectedPatient?.id] });
      setExamDocumentToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el documento", variant: "destructive" });
    }
  });

  const createVaccinationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/vaccinations/firebase', 'POST', data),
    onSuccess: () => {
      toast({ title: "Vacunación registrada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/vaccinations/firebase/pet', selectedPatient?.id] });
      setVaccinationData({
        // Enfermedades para caninos
        distemper: false,
        adenovirus: false,
        leptospira_canicola: false,
        leptospira_icterohaemorrhagiae: false,
        leptospira_grippotyphosa_pomona: false,
        parvovirus: false,
        parainfluenza: false,
        coronavirus: false,
        antirrabica: false,
        // Enfermedades para felinos
        panleucopenia: false,
        rinotraqueitis: false,
        calicivirus: false,
        // Enfermedades adicionales
        leucemia_felina: false,
        // Información adicional
        vaccineName: '', 
        vaccineBrand: '',
        vaccineType: '',
        vaccineSubType: '',
        laboratory: '',
        batchNumber: '',
        serialNumber: '',
        applicationDate: new Date().toISOString().split('T')[0],
        validityDate: '',
        validityType: 'predefined',
        validityPeriod: '1',
        customValidityMonths: '',
        notes: ''
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo registrar la vacunación", variant: "destructive" });
    }
  });

  const createDewormingMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/dewormings/firebase', 'POST', data),
    onSuccess: () => {
      toast({ title: "Desparasitación registrada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/dewormings/firebase/pet', selectedPatient?.id] });
      setDewormingData({
        type: 'internal', product: '', activeIngredient: '', dose: '', laboratory: '', batchNumber: '',
        applicationDate: new Date().toISOString().split('T')[0], applicationTime: '09:00', nextDueDate: '', duration: '', notes: ''
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo registrar la desparasitación", variant: "destructive" });
    }
  });

  const createCertificateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/certificates/firebase', 'POST', data),
    onSuccess: (result: any) => {
      toast({ title: "Certificado generado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates/pet', selectedPatient?.id] });
      setCertificateData({
        type: 'health', purpose: '', issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '', observations: '', additionalInfo: '', microchipType: 'implantation',
        isRegisteredInNationalDB: true, destination: '', exportObservations: '', examDate: new Date().toISOString().split('T')[0], validityDays: '10'
      });
      
      // Generate and show PDF
      setTimeout(async () => {
        try {
          await generateCertificatePDF(selectedPatient, result, { name: 'Dra. Alejandra Cautín Bastías' });
        } catch (error) {
          console.error('Error generating certificate PDF:', error);
          toast({ 
            title: "Error", 
            description: "Error al generar el PDF del certificado", 
            variant: "destructive" 
          });
        }
      }, 500);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo generar el certificado", variant: "destructive" });
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/patients/firebase/${selectedPatient?.id}`, 'PUT', data),
    onSuccess: () => {
      toast({ title: "Paciente actualizado exitosamente" });
      setEditingPatient(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', selectedPatient?.id] });
      refetchPatient();
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el paciente", variant: "destructive" });
    }
  });

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newPatientData.name || !newPatientData.tutorName || !newPatientData.tutorRut) {
      toast({ title: "Error", description: "Completa los campos requeridos: nombre del paciente, tutor y RUT", variant: "destructive" });
      return;
    }

    // Validate RUT
    if (!rutValidation.isValid) {
      toast({ title: "Error", description: "RUT inválido: " + rutValidation.message, variant: "destructive" });
      return;
    }

    // Validate birth date
    if (newPatientData.birthDate && !birthDateValidation.isValid) {
      toast({ title: "Error", description: "Fecha de nacimiento inválida: " + birthDateValidation.message, variant: "destructive" });
      return;
    }

    // Validate breed selection
    if (!newPatientData.breed) {
      toast({ title: "Error", description: "Selecciona una raza", variant: "destructive" });
      return;
    }

    const patientData = {
      ...newPatientData,
      ownerId: user?.uid,
      createdAt: new Date().toISOString(),
      name: newPatientData.name.toLowerCase(),
      age: newPatientData.birthDate ? getPatientAge(newPatientData.birthDate) : ''
    };

    createPatientMutation.mutate(patientData);
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !consultationData.consultationReason) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }

    const recordData = {
      petId: selectedPatient.id,
      veterinarianId: user?.uid,
      date: consultationData.consultationDate,
      type: 'consultation',
      reason: consultationData.consultationReason,
      findings: consultationData.physicalExamFindings,
      diagnosis: consultationData.presumptiveDiagnosis,
      treatment: consultationData.therapeuticPlan,
      notes: consultationData.additionalNotes,
      nextAppointment: consultationData.nextAppointment,
      createdAt: new Date().toISOString()
    };

    createConsultationMutation.mutate(recordData);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Prescription data:', prescriptionData);
    console.log('Selected patient:', selectedPatient);
    
    if (!selectedPatient || prescriptionData.medications.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un medicamento a la prescripción", variant: "destructive" });
      return;
    }

    try {
      // Convert medications array to treatment string for compatibility
      const treatmentText = prescriptionData.medications.map(med => 
        `${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}`
      ).join('\n');

      const prescription = {
        petId: selectedPatient.id,
        veterinarianId: user?.uid || 'unknown',
        medications: prescriptionData.medications, // Send structured medications array
        treatment: treatmentText, // Keep compatibility string
        indications: prescriptionData.indications || '',
        duration: '', // Remove duration field
        dosage: '', // Remove dosage field  
        warnings: prescriptionData.warnings || '',
        createdAt: new Date().toISOString()
      };

      console.log('Sending prescription:', prescription);
      createPrescriptionMutation.mutate(prescription);
    } catch (error) {
      console.error('Error preparing prescription data:', error);
      toast({ title: "Error", description: "Error al procesar los datos", variant: "destructive" });
    }
  };

  const handleCreateVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Vaccination data:', vaccinationData);
    console.log('Selected patient:', selectedPatient);
    
    // Validar que al menos una enfermedad esté seleccionada
    const selectedDiseases = [];
    const diseaseFields = ['distemper', 'adenovirus', 'leptospira_canicola', 'leptospira_icterohaemorrhagiae', 'leptospira_grippotyphosa_pomona', 'parvovirus', 'parainfluenza', 'coronavirus', 'antirrabica', 'panleucopenia', 'rinotraqueitis', 'calicivirus'];
    
    for (const disease of diseaseFields) {
      if (vaccinationData[disease as keyof typeof vaccinationData]) {
        selectedDiseases.push(disease);
      }
    }
    
    if (!selectedPatient || selectedDiseases.length === 0 || !vaccinationData.vaccineType) {
      toast({ title: "Error", description: "Completa los campos requeridos: selecciona al menos una enfermedad y tipo de vacuna", variant: "destructive" });
      return;
    }

    // Generar nombres de vacunas según enfermedades seleccionadas
    const diseaseNames: Record<string, string> = {
      distemper: 'Distemper',
      adenovirus: 'Adenovirus (Hepatitis)',
      leptospira_canicola: 'Leptospira canicola',
      leptospira_icterohaemorrhagiae: 'Leptospira icterohaemorrhagiae',
      leptospira_grippotyphosa_pomona: 'Leptospira grippotyphosa/pomona',
      parvovirus: 'Parvovirus',
      parainfluenza: 'Parainfluenza', 
      coronavirus: 'Coronavirus',
      antirrabica: 'Antirrábica',
      panleucopenia: 'Panleucopenia',
      rinotraqueitis: 'Rinotraqueitis',
      calicivirus: 'Calicivirus'
    };
    
    const vaccineName = selectedDiseases.map(disease => diseaseNames[disease]).join(' + ');

    try {
      const vaccination = {
        petId: selectedPatient.id,
        veterinarianId: user?.uid || 'unknown',
        // Campos para el formato SAG
        selectedDiseases: selectedDiseases,
        vaccineName: vaccineName,
        vaccineType: vaccinationData.vaccineType,
        vaccineSubType: vaccinationData.vaccineSubType, // Tipo de formulación para SAG
        laboratory: vaccinationData.vaccineBrand, // Usar vaccineBrand en lugar de laboratory
        vaccineBrand: vaccinationData.vaccineBrand, // Agregar también como vaccineBrand
        batchNumber: vaccinationData.batchNumber,
        serialNumber: vaccinationData.serialNumber,
        applicationDate: vaccinationData.applicationDate,
        validityDate: vaccinationData.validityDate,
        notes: vaccinationData.notes,
        createdAt: new Date().toISOString()
      };

      console.log('Sending vaccination:', vaccination);
      createVaccinationMutation.mutate(vaccination);
    } catch (error) {
      console.error('Error preparing vaccination data:', error);
      toast({ title: "Error", description: "Error al procesar los datos", variant: "destructive" });
    }
  };

  const handleCreateDeworming = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Deworming data:', dewormingData);
    console.log('Selected patient:', selectedPatient);
    
    if (!selectedPatient || !dewormingData.product) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }

    try {
      // Calculate next due date (typically 3 months for dewormings)
      const nextDueDate = new Date(dewormingData.applicationDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 3);

      const deworming = {
        petId: selectedPatient.id,
        veterinarianId: user?.uid || 'unknown',
        ...dewormingData,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      console.log('Sending deworming:', deworming);
      createDewormingMutation.mutate(deworming);
    } catch (error) {
      console.error('Error preparing deworming data:', error);
      toast({ title: "Error", description: "Error al procesar los datos", variant: "destructive" });
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Certificate data:', certificateData);
    console.log('Selected patient:', selectedPatient);
    
    if (!selectedPatient || !certificateData.type) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }

    // Additional validation for export certificates
    if (certificateData.type === 'export') {
      if (!certificateData.destination || !certificateData.examDate) {
        toast({ title: "Error", description: "Completa los campos requeridos para exportación: Destino y Fecha de Examen", variant: "destructive" });
        return;
      }
    }

    try {
      // Calculate expiry date based on certificate type
      const expiryDate = new Date(certificateData.issueDate);
      switch (certificateData.type) {
        case 'health':
          expiryDate.setDate(expiryDate.getDate() + 30); // 30 days for health certificates
          break;
        case 'export':
          expiryDate.setDate(expiryDate.getDate() + 10); // 10 days for export certificates
          break;
        case 'vaccination':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year for vaccination certificates
          break;
        case 'microchip':
          expiryDate.setFullYear(expiryDate.getFullYear() + 10); // 10 years for microchip certificates
          break;
        default:
          expiryDate.setDate(expiryDate.getDate() + 30);
      }

      const certificate = {
        petId: selectedPatient.id,
        veterinarianId: user?.uid || 'unknown',
        type: certificateData.type,
        issuedDate: certificateData.issueDate,
        validUntil: expiryDate.toISOString().split('T')[0],
        content: {
          observations: certificateData.observations,
          additionalInfo: certificateData.additionalInfo,
          microchipType: certificateData.microchipType,
          isRegisteredInNationalDB: certificateData.isRegisteredInNationalDB,
          purpose: certificateData.purpose,
          // Export certificate specific fields
          destination: certificateData.destination,
          exportObservations: certificateData.exportObservations,
          examDate: certificateData.examDate,
          validityDays: certificateData.validityDays
        },
        pdfUrl: null
      };

      console.log('Sending certificate:', certificate);
      console.log('Certificate data structure:', {
        petId: typeof certificate.petId,
        veterinarianId: typeof certificate.veterinarianId,
        type: typeof certificate.type,
        issuedDate: typeof certificate.issuedDate,
        validUntil: typeof certificate.validUntil,
        content: typeof certificate.content
      });
      createCertificateMutation.mutate(certificate);
    } catch (error) {
      console.error('Error preparing certificate data:', error);
      toast({ title: "Error", description: "Error al procesar los datos", variant: "destructive" });
    }
  };

  // Enhanced form handlers with validation
  const handleRUTChange = (value: string) => {
    const formatted = formatRUTInput(value);
    setNewPatientData(prev => ({ ...prev, tutorRut: formatted }));
    
    if (formatted.length >= 9) {
      const validation = validateRUT(formatted);
      setRutValidation({ isValid: validation.isValid, message: validation.message || '' });
    } else {
      setRutValidation({ isValid: true, message: '' });
    }
  };

  const handleBirthDateChange = (value: string) => {
    setNewPatientData(prev => ({ ...prev, birthDate: value }));
    
    if (value) {
      const today = new Date();
      const birthDate = new Date(value);
      if (birthDate > today) {
        setBirthDateValidation({ isValid: false, message: 'La fecha de nacimiento no puede ser futura' });
      } else {
        setBirthDateValidation({ isValid: true, message: '' });
      }
    } else {
      setBirthDateValidation({ isValid: true, message: '' });
    }
  };

  const getPatientAge = (birthDate: string) => {
    if (!birthDate) return '';
    const age = calculateAge(new Date(birthDate));
    return age.formatted;
  };

  // Handle search function for manual search trigger
  const handleSearch = () => {
    if (searchTerm.length >= 2) {
      // The query will be triggered automatically due to the searchTerm dependency
      toast({ 
        title: "Buscando...", 
        description: `Buscando pacientes con: ${searchTerm}` 
      });
    }
  };

  return (
    <div className="min-h-screen bg-warm-beige">
      {/* Header con navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/logo.png" 
                alt="Ale Veterinaria Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-poppins font-bold text-darkgray">
                <span className="text-mint">Ale</span> Veterinaria
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden md:block">
                Dra. Alejandra Cautín Bastías
              </span>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-home">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  // Añadir lógica de logout si es necesario
                  setLocation('/');
                }}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Portal profesional</h1>
          <p className="text-text-muted">Gestión de Pacientes y Consultas Médicas</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeSection === 'search' ? 'default' : 'outline'}
            onClick={() => setActiveSection('search')}
            className="flex items-center gap-2"
          >
            <Search size={18} />
            Buscar Pacientes
          </Button>
          <Button
            variant={activeSection === 'new-patient' ? 'default' : 'outline'}
            onClick={() => setActiveSection('new-patient')}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Paciente
          </Button>
          <Button
            variant={activeSection === 'schedule-management' ? 'default' : 'outline'}
            onClick={() => setActiveSection('schedule-management')}
            className="flex items-center gap-2"
          >
            <Calendar size={18} />
            Gestión de Horarios
          </Button>
          <Button
            variant={activeSection === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveSection('notifications')}
            className="flex items-center gap-2"
          >
            <Bell size={18} />
            Notificaciones
          </Button>
          <Button
            variant={activeSection === 'calendar-integration' ? 'default' : 'outline'}
            onClick={() => setActiveSection('calendar-integration')}
            className="flex items-center gap-2 relative"
          >
            <ExternalLink size={18} />
            Google Calendar
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </Button>
          {selectedPatient && (
            <>
              <Button
                variant={activeSection === 'patient-hub' ? 'default' : 'outline'}
                onClick={() => setActiveSection('patient-hub')}
                className="flex items-center gap-2"
              >
                <User size={18} />
                Ficha: {selectedPatient.name}
              </Button>
              <Button
                variant={activeSection === 'nutrition' ? 'default' : 'outline'}
                onClick={() => setActiveSection('nutrition')}
                className="flex items-center gap-2"
              >
                <Heart size={18} />
                Nutrición
              </Button>
              <Button
                variant={activeSection === 'consultation' ? 'default' : 'outline'}
                onClick={() => setActiveSection('consultation')}
                className="flex items-center gap-2"
              >
                <Stethoscope size={18} />
                Nueva Consulta
              </Button>
              <Button
                variant={activeSection === 'vaccination' ? 'default' : 'outline'}
                onClick={() => setActiveSection('vaccination')}
                className="flex items-center gap-2"
              >
                <Syringe size={18} />
                Vacunar
              </Button>
              <Button
                variant={activeSection === 'deworming' ? 'default' : 'outline'}
                onClick={() => setActiveSection('deworming')}
                className="flex items-center gap-2"
              >
                <Bug size={18} />
                Desparasitar
              </Button>
              <Button
                variant={activeSection === 'report' ? 'default' : 'outline'}
                onClick={() => setActiveSection('report')}
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Informe de Atención
              </Button>
              <Button
                variant={activeSection === 'certificate' ? 'default' : 'outline'}
                onClick={() => setActiveSection('certificate')}
                className="flex items-center gap-2"
              >
                <Award size={18} />
                Certificado
              </Button>
              <Button
                variant={activeSection === 'prescription' ? 'default' : 'outline'}
                onClick={() => setActiveSection('prescription')}
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Receta Médica
              </Button>
              <Button
                variant={activeSection === 'exam-order' ? 'default' : 'outline'}
                onClick={() => setActiveSection('exam-order')}
                className="flex items-center gap-2"
              >
                <ShoppingCart size={18} />
                Orden de Exámenes
              </Button>
              <Button
                variant={activeSection === 'exam-documents' ? 'default' : 'outline'}
                onClick={() => setActiveSection('exam-documents')}
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Subir Exámenes
              </Button>
            </>
          )}
        </div>

        {/* Search Section */}
        {activeSection === 'search' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} />
                Búsqueda de Pacientes
              </CardTitle>
              <CardDescription>
                Busca usando múltiples criterios independientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Input */}
                <div className="flex gap-4">
                  <Input
                    placeholder="Ingrese término de búsqueda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                    data-testid="input-search-term"
                  />
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                    }} 
                    variant="outline"
                    data-testid="button-clear-search"
                  >
                    Limpiar
                  </Button>
                </div>

                {/* Independent Search Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={async () => {
                      if (!searchTerm.trim()) return;
                      
                      try {
                        const response = await fetch(`/api/search/patients/${searchTerm}`);
                        if (response.ok) {
                          const results = await response.json();
                          setSearchResults(results);
                        }
                      } catch (error) {
                        console.error('Error searching by name:', error);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2 border-mint text-mint hover:bg-mint hover:text-white"
                    data-testid="button-search-name"
                    disabled={!searchTerm.trim()}
                  >
                    <User size={16} />
                    Por Nombre
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!searchTerm.trim()) return;
                      
                      try {
                        const cleanRut = searchTerm.replace(/[.-]/g, '');
                        const response = await fetch(`/api/pets/rut/${cleanRut}`);
                        if (response.ok) {
                          const results = await response.json();
                          setSearchResults(results);
                        }
                      } catch (error) {
                        console.error('Error searching by RUT:', error);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
                    data-testid="button-search-rut"
                    disabled={!searchTerm.trim()}
                  >
                    <FileText size={16} />
                    Por RUT
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!searchTerm.trim()) return;
                      
                      try {
                        // Try PostgreSQL first, then Firebase
                        let response = await fetch(`/api/pets/${searchTerm}`);
                        if (!response.ok) {
                          response = await fetch(`/api/patients/${searchTerm}`);
                        }
                        
                        if (response.ok) {
                          const result = await response.json();
                          setSearchResults(result ? [result] : []);
                        }
                      } catch (error) {
                        console.error('Error searching by record:', error);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2 border-lavender text-lavender hover:bg-lavender hover:text-white"
                    data-testid="button-search-record"
                    disabled={!searchTerm.trim()}
                  >
                    <FileText size={16} />
                    Por Ficha
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!searchTerm.trim()) return;
                      
                      try {
                        const response = await fetch(`/api/search/patients/tutor/${searchTerm}`);
                        if (response.ok) {
                          const results = await response.json();
                          setSearchResults(results);
                        } else {
                          // Fallback to general search
                          const fallbackResponse = await fetch(`/api/search/patients/${searchTerm}`);
                          if (fallbackResponse.ok) {
                            const results = await fallbackResponse.json();
                            // Filter results that match tutor name
                            const filteredResults = results.filter((patient: any) => 
                              patient.tutorName?.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            setSearchResults(filteredResults);
                          }
                        }
                      } catch (error) {
                        console.error('Error searching by tutor:', error);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2 border-palerose text-palerose hover:bg-palerose hover:text-white"
                    data-testid="button-search-tutor"
                    disabled={!searchTerm.trim()}
                  >
                    <User size={16} />
                    Por Tutor
                  </Button>
                </div>

                {/* Search Results */}
                {searchLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint mx-auto"></div>
                    <p className="mt-2 text-text-muted">Buscando...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Resultados encontrados ({searchResults.length})</h3>
                    <div className="grid gap-4">
                      {searchResults.map((patient: any) => (
                        <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-patient-${patient.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg capitalize">{patient.name}</h3>
                                <p className="text-text-muted">Ficha Nº {patient.id}</p>
                                <p className="text-sm text-text-muted">{patient.species} - {patient.breed}</p>
                                <p className="text-sm text-text-muted">
                                  Tutor: {patient.tutorName} {patient.ownerId && `(RUT: ${patient.ownerId})`}
                                </p>
                                {patient.age && (
                                  <p className="text-sm text-text-muted">Edad: {patient.age}</p>
                                )}
                                {/* Mostrar citas próximas si existe RUT del tutor */}
                                {(patient.ownerId || patient.tutorRut) && (
                                  <UpcomingAppointments tutorRut={patient.ownerId || patient.tutorRut} />
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setActiveSection('patient-hub');
                                }}
                                className="bg-mint hover:bg-mint-dark"
                                data-testid={`button-view-patient-${patient.id}`}
                              >
                                Ver Ficha
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchTerm.length >= 1 && !searchLoading && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-muted">
                      No se encontraron pacientes. 
                      <br />
                      <span className="text-sm">Prueba con otros términos o usa los botones de búsqueda específicos.</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Patient Section */}
        {activeSection === 'new-patient' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} />
                Registrar Nuevo Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePatient} className="space-y-6">
                {/* Tutor Data */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-mint">Datos del Tutor</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                      <Input
                        value={newPatientData.tutorName}
                        onChange={(e) => setNewPatientData({...newPatientData, tutorName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">RUT *</Label>
                      <Input
                        value={newPatientData.tutorRut}
                        onChange={(e) => handleRUTChange(e.target.value)}
                        placeholder="12345678-9"
                        className={!rutValidation.isValid ? 'border-red-500' : ''}
                      />
                      {!rutValidation.isValid && (
                        <p className="text-sm text-red-500 mt-1">
                          <AlertCircle className="inline w-4 h-4 mr-1" />
                          {rutValidation.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono Principal</label>
                      <Input
                        value={newPatientData.tutorPhone}
                        onChange={(e) => setNewPatientData({...newPatientData, tutorPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        type="email"
                        value={newPatientData.tutorEmail}
                        onChange={(e) => setNewPatientData({...newPatientData, tutorEmail: e.target.value})}
                      />
                    </div>
                  
                  {/* Address Information */}
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-mint">Dirección del Tutor</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium mb-1">Región *</Label>
                        <Select 
                          value={newPatientData.tutorRegion} 
                          onValueChange={(value) => {
                            setNewPatientData({...newPatientData, tutorRegion: value, tutorComuna: ''});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una región" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllRegions().map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium mb-1">Comuna *</Label>
                        <Select 
                          value={newPatientData.tutorComuna} 
                          onValueChange={(value) => setNewPatientData({...newPatientData, tutorComuna: value})}
                          disabled={!newPatientData.tutorRegion}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={newPatientData.tutorRegion ? "Selecciona una comuna" : "Primero selecciona región"} />
                          </SelectTrigger>
                          <SelectContent>
                            {newPatientData.tutorRegion && getCommunesByRegion(newPatientData.tutorRegion).map((comuna) => (
                              <SelectItem key={comuna} value={comuna}>
                                {comuna}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="block text-sm font-medium mb-1">Calle/Avenida *</Label>
                      <Input
                        value={newPatientData.tutorAddress}
                        onChange={(e) => setNewPatientData({...newPatientData, tutorAddress: e.target.value})}
                        placeholder="Ej: Avenida Providencia, Calle Santa Rosa"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium mb-1">Número *</Label>
                        <Input
                          value={newPatientData.tutorHouseNumber}
                          onChange={(e) => setNewPatientData({...newPatientData, tutorHouseNumber: e.target.value})}
                          placeholder="123"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium mb-1">Depto/Oficina (opcional)</Label>
                        <Input
                          value={newPatientData.tutorApartmentNumber}
                          onChange={(e) => setNewPatientData({...newPatientData, tutorApartmentNumber: e.target.value})}
                          placeholder="101, A, etc."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="block text-sm font-medium mb-1">Ciudad (opcional)</Label>
                      <Input
                        value={newPatientData.tutorCity}
                        onChange={(e) => setNewPatientData({...newPatientData, tutorCity: e.target.value})}
                        placeholder="Solo si es diferente a la comuna"
                      />
                    </div>
                  </div>
                  </div>
                </div>

                {/* Patient Data */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-mint">Datos del Paciente</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre *</label>
                      <Input
                        value={newPatientData.name}
                        onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Especie</label>
                      <Select
                        value={newPatientData.species}
                        onValueChange={(value: 'Canino' | 'Felino') => setNewPatientData({...newPatientData, species: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona especie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Canino">Canino</SelectItem>
                          <SelectItem value="Felino">Felino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Raza *</Label>
                      <Select
                        value={newPatientData.breed}
                        onValueChange={(value) => setNewPatientData({...newPatientData, breed: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una raza" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBreeds.map((breed) => (
                            <SelectItem key={breed.id} value={breed.name}>
                              {breed.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!newPatientData.breed && (
                        <p className="text-sm text-red-500 mt-1">
                          <AlertCircle className="inline w-4 h-4 mr-1" />
                          Selecciona una raza para continuar
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Sexo</Label>
                      <Select
                        value={newPatientData.sex}
                        onValueChange={(value) => setNewPatientData({...newPatientData, sex: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Hembra">Hembra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        value={newPatientData.birthDate}
                        onChange={(e) => handleBirthDateChange(e.target.value)}
                        className={!birthDateValidation.isValid ? 'border-red-500' : ''}
                      />
                      {newPatientData.birthDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          Edad: {getPatientAge(newPatientData.birthDate)}
                        </p>
                      )}
                      {!birthDateValidation.isValid && (
                        <p className="text-sm text-red-500 mt-1">
                          <AlertCircle className="inline w-4 h-4 mr-1" />
                          {birthDateValidation.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Peso</label>
                      <Input
                        value={newPatientData.weight}
                        onChange={(e) => setNewPatientData({...newPatientData, weight: e.target.value})}
                        placeholder="3.5 kg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveSection('search')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-mint hover:bg-mint-dark"
                    disabled={createPatientMutation.isPending}
                  >
                    {createPatientMutation.isPending ? 'Guardando...' : 'Guardar Paciente'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Patient Hub Section */}
        {activeSection === 'patient-hub' && selectedPatient && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Ficha Nº {(patientData || selectedPatient).id} - {(patientData || selectedPatient).name}
                </CardTitle>
                <CardDescription>
                  {patientData ? 'Datos cargados correctamente' : 'Usando datos desde navegación'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Loading state */}
                {!patientData && selectedPatient && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint"></div>
                    <span className="ml-2">Cargando datos del paciente...</span>
                  </div>
                )}
                
                {/* Patient data display */}
                {(patientData || selectedPatient) && (
                  <div className="space-y-8">
                    {/* Patient Summary Card */}
                    <div className="bg-gradient-to-r from-mint/10 to-blue-50 p-6 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-mint mb-4 flex items-center gap-2">
                            <User size={18} />
                            Información del Paciente
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-600">Nombre:</span> <strong className="capitalize">{(patientData || selectedPatient).name}</strong></div>
                            <div><span className="text-gray-600">Especie:</span> <strong>{(patientData || selectedPatient).species}</strong></div>
                            <div><span className="text-gray-600">Raza:</span> {(patientData || selectedPatient).breed || 'No especificada'}</div>
                            <div><span className="text-gray-600">Sexo:</span> {(patientData || selectedPatient).sex}</div>
                            <div><span className="text-gray-600">Edad:</span> {(patientData || selectedPatient).birthDate ? getPatientAge((patientData || selectedPatient).birthDate) : (patientData || selectedPatient).age || 'No especificada'}</div>
                            <div><span className="text-gray-600">Peso:</span> <strong>{(patientData || selectedPatient).weight || 'No especificado'}</strong></div>
                          </div>
                          {(patientData || selectedPatient).birthDate && (
                            <div className="mt-3 text-sm">
                              <span className="text-gray-600">Fecha Nacimiento:</span> {formatDateToChilean((patientData || selectedPatient).birthDate)}
                            </div>
                          )}
                          {(patientData || selectedPatient).microchip && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-600">Microchip:</span> {(patientData || selectedPatient).microchip}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-mint mb-4 flex items-center gap-2">
                            <User size={18} />
                            Información del Tutor
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="text-gray-600">Nombre:</span> <strong>{(patientData || selectedPatient).tutorName || 'No especificado'}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard size={16} className="text-gray-400" />
                              <span className="text-gray-600">RUT:</span> <strong>{(patientData || selectedPatient).tutorRut || (patientData || selectedPatient).ownerId || 'No especificado'}</strong>
                            </div>
                            {(patientData || selectedPatient).tutorPhone && (
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <span className="text-gray-600">Teléfono:</span> 
                                <strong>
                                  {(() => {
                                    const phone = (patientData || selectedPatient).tutorPhone;
                                    // Si el teléfono no tiene código de país, mostrarlo con formato mejorado
                                    if (phone && !phone.startsWith('+')) {
                                      // Si es un número chileno sin formato
                                      if (phone.length === 9 && phone.startsWith('9')) {
                                        return `+56 ${phone.slice(0, 1)} ${phone.slice(1, 5)} ${phone.slice(5)}`;
                                      }
                                      // Si es un número de 8 dígitos, agregar +56 9
                                      if (phone.length === 8) {
                                        return `+56 9 ${phone.slice(0, 4)} ${phone.slice(4)}`;
                                      }
                                      // Para otros formatos, solo agregar +56
                                      return `+56 ${phone}`;
                                    }
                                    return phone;
                                  })()}
                                </strong>
                              </div>
                            )}
                            {(patientData || selectedPatient).tutorEmail && (
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <span className="text-gray-600">Email:</span> {(patientData || selectedPatient).tutorEmail}
                              </div>
                            )}
                            {((patientData || selectedPatient).tutorAddress || (patientData || selectedPatient).tutorComuna || (patientData || selectedPatient).tutorRegion) && (
                              <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-600">Dirección:</span>
                                  <div className="mt-1">
                                    {(() => {
                                      const patient = patientData || selectedPatient;
                                      const fullAddress = patient.tutorAddress || '';
                                      
                                      if (fullAddress.includes('Las Condes') && fullAddress.includes('Región Metropolitana')) {
                                        const match = fullAddress.match(/^([^,]+(?:,\s*Depto\s*\d+)?)/);
                                        if (match) {
                                          return match[1] + ', Las Condes';
                                        }
                                      }
                                      
                                      const parts = [];
                                      const baseAddress = fullAddress.split(',')[0] || '';
                                      
                                      if (baseAddress) parts.push(baseAddress);
                                      if (patient.tutorHouseNumber && !baseAddress.includes(patient.tutorHouseNumber)) {
                                        parts.push(patient.tutorHouseNumber);
                                      }
                                      if (patient.tutorApartmentNumber) {
                                        parts.push(`Depto ${patient.tutorApartmentNumber}`);
                                      }
                                      if (patient.tutorComuna) {
                                        parts.push(patient.tutorComuna);
                                      }
                                      
                                      return parts.join(', ') || fullAddress;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Periodic Medications Section */}
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-mint flex items-center gap-2">
                          <Pill size={18} />
                          Fármacos Periódicos
                        </h3>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowPeriodicMedForm(true)}
                          className="text-xs"
                        >
                          + Agregar Medicamento
                        </Button>
                      </div>
                      
                      {(() => {
                        const patient = patientData || selectedPatient;
                        let medications = patient?.currentMedications;
                        
                        // Buscar en la query de datos del paciente si existe
                        if (!medications && patientData) {
                          medications = patientData.currentMedications;
                        }
                        
                        if (!medications && searchResults && searchResults.length > 0) {
                          const foundPatient = searchResults.find(p => p.id === patient?.id);
                          medications = foundPatient?.currentMedications;
                        }
                        
                        if (medications && typeof medications === 'string' && medications.trim().length > 0) {
                          const medicationList = medications.split('\n').filter(med => med.trim());
                          
                          return (
                            <div className="space-y-3">
                              {medicationList.map((medication, index) => (
                                <div key={index} className="bg-blue-50 p-4 rounded-lg flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{medication.replace('•', '').trim()}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={async () => {
                                      const updatedMedications = medicationList
                                        .filter((_, i) => i !== index)
                                        .join('\n');
                                      
                                      try {
                                        const response = await fetch(`/api/patients/firebase/${patient.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            ...patient,
                                            currentMedications: updatedMedications
                                          })
                                        });
                                        
                                        if (response.ok) {
                                          toast({
                                            title: "Medicamento eliminado",
                                            description: "El medicamento ha sido eliminado correctamente."
                                          });
                                          // Refrescar datos
                                          window.location.reload();
                                        }
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "No se pudo eliminar el medicamento.",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Pill size={48} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm italic">No hay medicamentos periódicos registrados</p>
                              <p className="text-xs mt-1">Usa el botón "Agregar Medicamento" para añadir fármacos</p>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Direct Communication Section */}
                    <div className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-mint flex items-center gap-2">
                          <Bell size={18} />
                          Comunicación Directa con Tutor
                        </h3>
                      </div>
                      
                      {(() => {
                        const patient = patientData || selectedPatient;
                        const tutorEmail = patient?.tutorEmail;
                        const tutorPhone = patient?.tutorPhone;
                        const tutorName = patient?.tutorName;
                        
                        if (!tutorEmail && !tutorPhone) {
                          return (
                            <div className="text-center py-6 text-gray-500">
                              <Bell size={32} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm">No hay información de contacto disponible</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div>
                            {tutorEmail && (
                              <div className="bg-blue-50 p-6 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                  <Mail size={24} className="text-blue-600" />
                                  <div>
                                    <h4 className="font-medium text-blue-800 text-lg">Enviar Email</h4>
                                    <p className="text-sm text-blue-600">{tutorEmail}</p>
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Asunto</Label>
                                    <Input
                                      value={emailSubject}
                                      onChange={(e) => setEmailSubject(e.target.value)}
                                      placeholder="Consulta sobre salud de su mascota"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button 
                                      className="w-full"
                                      onClick={async () => {
                                        if (!emailSubject.trim() || !emailMessage.trim()) {
                                          toast({
                                            title: "Campos requeridos",
                                            description: "Por favor completa el asunto y mensaje",
                                            variant: "destructive"
                                          });
                                          return;
                                        }
                                        
                                        try {
                                          const response = await fetch('/api/send-direct-email', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              to: tutorEmail,
                                              subject: emailSubject,
                                              message: emailMessage,
                                              tutorName: tutorName,
                                              petName: patient?.name
                                            })
                                          });
                                          
                                          if (response.ok) {
                                            toast({
                                              title: "Email enviado",
                                              description: "El mensaje ha sido enviado correctamente"
                                            });
                                            setEmailSubject('');
                                            setEmailMessage('');
                                          } else {
                                            throw new Error('Error al enviar');
                                          }
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "No se pudo enviar el email",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                      disabled={!emailSubject.trim() || !emailMessage.trim()}
                                    >
                                      <Mail size={16} className="mr-2" />
                                      Enviar Email
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Label className="text-sm font-medium">Mensaje</Label>
                                  <Textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    placeholder="Estimado/a tutor, escribo para..."
                                    className="mt-1 min-h-[100px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => setEditingPatient(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Editar Datos
              </Button>
              {!showAppointmentScheduler && (
                <Button 
                  onClick={() => setShowAppointmentScheduler(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Gestionar Citas
                </Button>
              )}
            </div>

            {/* Appointment Scheduler */}
            {showAppointmentScheduler && selectedPatient && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} />
                      {editingAppointmentId ? 'Editar Cita' : 'Gestión de Citas'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowAppointmentScheduler(false);
                        setEditingAppointmentId(null);
                      }}
                    >
                      Cerrar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AppointmentScheduler 
                    tutorRut={selectedPatient.tutorRut || selectedPatient.ownerId || ''} 
                    pets={[selectedPatient]}
                  />
                </CardContent>
              </Card>
            )}

            {/* Edit Patient Form */}
            {editingPatient && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Editar Información Completa</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updatePatientMutation.mutate(selectedPatient);
                  }} className="space-y-6">
                    
                    {/* Tutor Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-mint">Datos del Tutor</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium mb-1">Nombre Completo</Label>
                          <Input
                            value={selectedPatient.tutorName || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, tutorName: e.target.value})}
                            placeholder="Nombre completo del tutor"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">RUT</Label>
                          <Input
                            value={selectedPatient.tutorRut || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, tutorRut: e.target.value})}
                            placeholder="12.345.678-9"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Teléfono Móvil</Label>
                          <Input
                            value={selectedPatient.tutorPhone || ''}
                            onChange={(e) => {
                              const formatted = formatPhoneInput(e.target.value);
                              setSelectedPatient({...selectedPatient, tutorPhone: formatted});
                            }}
                            placeholder="+56 9 1234 5678"
                            className={!isValidPhoneNumber(selectedPatient.tutorPhone || '') && (selectedPatient.tutorPhone || '').length > 4 ? 'border-red-300' : ''}
                          />
                          {(selectedPatient.tutorPhone || '').length > 4 && !isValidPhoneNumber(selectedPatient.tutorPhone || '') && (
                            <p className="text-xs text-red-500 mt-1">
                              {getPhoneValidationMessage(selectedPatient.tutorPhone || '')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Incluir código de país para WhatsApp
                          </p>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Email</Label>
                          <Input
                            type="email"
                            value={selectedPatient.tutorEmail || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, tutorEmail: e.target.value})}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>
                      
                      {/* Address Information */}
                      <div className="space-y-4 mt-6">
                        <h4 className="font-medium text-mint">Dirección del Tutor</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="block text-sm font-medium mb-1">Región</Label>
                            <Select 
                              value={selectedPatient.tutorRegion || ''} 
                              onValueChange={(value) => {
                                setSelectedPatient({...selectedPatient, tutorRegion: value, tutorComuna: ''});
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una región" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAllRegions().map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="block text-sm font-medium mb-1">Comuna</Label>
                            <Select 
                              value={selectedPatient.tutorComuna || ''} 
                              onValueChange={(value) => setSelectedPatient({...selectedPatient, tutorComuna: value})}
                              disabled={!selectedPatient.tutorRegion}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={selectedPatient.tutorRegion ? "Selecciona una comuna" : "Primero selecciona región"} />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedPatient.tutorRegion && getCommunesByRegion(selectedPatient.tutorRegion).map((comuna) => (
                                  <SelectItem key={comuna} value={comuna}>
                                    {comuna}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="block text-sm font-medium mb-1">Calle/Avenida</Label>
                          <Input
                            value={selectedPatient.tutorAddress || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, tutorAddress: e.target.value})}
                            placeholder="Ej: Avenida Providencia, Calle Santa Rosa"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="block text-sm font-medium mb-1">Número</Label>
                            <Input
                              value={selectedPatient.tutorHouseNumber || ''}
                              onChange={(e) => setSelectedPatient({...selectedPatient, tutorHouseNumber: e.target.value})}
                              placeholder="123"
                            />
                          </div>
                          
                          <div>
                            <Label className="block text-sm font-medium mb-1">Depto/Oficina</Label>
                            <Input
                              value={selectedPatient.tutorApartmentNumber || ''}
                              onChange={(e) => setSelectedPatient({...selectedPatient, tutorApartmentNumber: e.target.value})}
                              placeholder="101, A, etc."
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="block text-sm font-medium mb-1">Ciudad</Label>
                          <Input
                            value={selectedPatient.tutorCity || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, tutorCity: e.target.value})}
                            placeholder="Solo si es diferente a la comuna"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 text-mint">Datos del Paciente</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium mb-1">Nombre</Label>
                          <Input
                            value={selectedPatient.name || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                            placeholder="Nombre de la mascota"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Peso</Label>
                          <Input
                            value={selectedPatient.weight || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, weight: e.target.value})}
                            placeholder="4.5 kg"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Sexo</Label>
                          <Select
                            value={selectedPatient.sex || 'Macho'}
                            onValueChange={(value) => setSelectedPatient({...selectedPatient, sex: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Macho">Macho</SelectItem>
                              <SelectItem value="Hembra">Hembra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Estado reproductivo</Label>
                          <Select
                            value={selectedPatient.reproductiveStatus || 'Entero'}
                            onValueChange={(value) => setSelectedPatient({...selectedPatient, reproductiveStatus: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entero">Entero</SelectItem>
                              <SelectItem value="Castrado">Castrado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Fecha de Nacimiento</Label>
                          <Input
                            type="date"
                            value={selectedPatient.birthDate || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, birthDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Microchip</Label>
                          <Input
                            value={selectedPatient.microchip || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, microchip: e.target.value})}
                            placeholder="Número de microchip"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Señas Particulares</Label>
                          <Input
                            value={selectedPatient.colorMarkings || ''}
                            onChange={(e) => setSelectedPatient({...selectedPatient, colorMarkings: e.target.value})}
                            placeholder="Color, marcas distintivas..."
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Origen</Label>
                          <Select
                            value={selectedPatient.origin || 'Particular'}
                            onValueChange={(value) => setSelectedPatient({...selectedPatient, origin: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Particular">Particular</SelectItem>
                              <SelectItem value="Adopción">Adopción</SelectItem>
                              <SelectItem value="Refugio">Refugio</SelectItem>
                              <SelectItem value="Criadero">Criadero</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setEditingPatient(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-mint hover:bg-mint-dark" disabled={updatePatientMutation.isPending}>
                        {updatePatientMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Medical History */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('consultations')}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>Historial Médico ({medicalRecords.length})</span>
                  {expandedSections.consultations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.consultations && (
                <CardContent>
                  {medicalRecords.length > 0 ? (
                    <div className="space-y-4">
                      {medicalRecords.map((record: any) => (
                        <div key={record.id} className="border-l-4 border-mint pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{record.date}</p>
                              <p className="text-sm text-text-muted">{record.reason || record.type}</p>
                              {record.diagnosis && <p className="mt-1"><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
                              {record.treatment && <p className="mt-1"><strong>Tratamiento:</strong> {record.treatment}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">Consulta</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('¿Eliminar esta consulta médica?')) {
                                    deleteMedicalRecordMutation.mutate(record.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-center py-8">No hay registros médicos.</p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Prescriptions History */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('prescriptions')}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>Historial de Recetas ({prescriptions.length})</span>
                  {expandedSections.prescriptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.prescriptions && (
                <CardContent>
                  {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription: any) => (
                        <div key={prescription.id} className="border-l-4 border-turquoise pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{prescription.treatment}</p>
                              <p className="text-sm text-text-muted">
                                {formatDateToChilean(prescription.createdAt?.seconds ? new Date(prescription.createdAt.seconds * 1000) : prescription.createdAt)}
                              </p>
                              {prescription.indications && (
                                <p className="mt-1"><strong>Indicaciones:</strong> {prescription.indications}</p>
                              )}
                              {prescription.duration && (
                                <p className="mt-1"><strong>Duración:</strong> {prescription.duration}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">Receta</Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => generatePrescriptionPDF(selectedPatient, prescription, { name: 'Dra. Alejandra Cautín Bastías' })}
                              >
                                <Download size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('¿Eliminar esta receta?')) {
                                    deletePrescriptionMutation.mutate(prescription.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-center py-8">No hay recetas registradas.</p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Vaccination and Deworming History - NEW SECTION */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('vaccinations')}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Syringe size={20} />
                    Control de Vacunas y Desparasitación ({vaccinations.length + dewormingRecords.length})
                  </div>
                  {expandedSections.vaccinations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CardTitle>
                <CardDescription>
                  Seguimiento completo del esquema preventivo
                </CardDescription>
              </CardHeader>
              {expandedSections.vaccinations && (
                <CardContent>
                <Tabs defaultValue="vaccinations" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vaccinations" className="flex items-center gap-2">
                      <Syringe size={16} />
                      Vacunas
                    </TabsTrigger>
                    <TabsTrigger value="deworming" className="flex items-center gap-2">
                      <Bug size={16} />
                      Desparasitación
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="vaccinations" className="mt-6">
                    {vaccinations.length > 0 ? (
                      <div className="space-y-4">
                        {/* Vaccination Status Alerts */}
                        {(() => {
                          const now = new Date();
                          const overdueVaccines = vaccinations.filter((vax: any) => {
                            if (!vax.nextDueDate) return false;
                            const dueDate = new Date(vax.nextDueDate);
                            return dueDate < now;
                          });
                          const upcomingVaccines = vaccinations.filter((vax: any) => {
                            if (!vax.nextDueDate) return false;
                            const dueDate = new Date(vax.nextDueDate);
                            const weekFromNow = new Date();
                            weekFromNow.setDate(weekFromNow.getDate() + 7);
                            return dueDate >= now && dueDate <= weekFromNow;
                          });

                          return (
                            <>
                              {overdueVaccines.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                                    <AlertCircle size={18} />
                                    Vacunas Atrasadas ({overdueVaccines.length})
                                  </div>
                                  <div className="space-y-1">
                                    {overdueVaccines.map((vax: any) => (
                                      <p key={vax.id} className="text-sm text-red-700">
                                        • {vax.vaccineName} - Vencida el {formatDateToChilean(vax.nextDueDate)}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {upcomingVaccines.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                                    <Calendar size={18} />
                                    Próximas Vacunas ({upcomingVaccines.length})
                                  </div>
                                  <div className="space-y-1">
                                    {upcomingVaccines.map((vax: any) => (
                                      <p key={vax.id} className="text-sm text-amber-700">
                                        • {vax.vaccineName} - Programada para el {formatDateToChilean(vax.nextDueDate)}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Vaccination Table */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h4 className="font-semibold text-gray-800">Registro de Vacunas</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Vacuna</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Fecha Aplicación</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Laboratorio</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Próxima Dosis</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Estado</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vaccinations.map((vaccination: any) => {
                                  const now = new Date();
                                  const nextDue = vaccination.nextDueDate ? new Date(vaccination.nextDueDate) : null;
                                  let status = 'vigente';
                                  let statusColor = 'bg-green-100 text-green-800';
                                  
                                  if (nextDue) {
                                    if (nextDue < now) {
                                      status = 'vencida';
                                      statusColor = 'bg-red-100 text-red-800';
                                    } else if (nextDue <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                                      status = 'próxima';
                                      statusColor = 'bg-amber-100 text-amber-800';
                                    }
                                  }

                                  return (
                                    <tr key={vaccination.id} className="border-b hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium">{vaccination.vaccineName}</td>
                                      <td className="px-4 py-3">
                                        {formatDateToChilean(vaccination.applicationDate)}
                                      </td>
                                      <td className="px-4 py-3">{vaccination.laboratory || '-'}</td>
                                      <td className="px-4 py-3">
                                        {nextDue ? nextDue.toLocaleDateString('es-CL') : '-'}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                          {status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            if (confirm('¿Eliminar esta vacuna?')) {
                                              deleteVaccinationMutation.mutate(vaccination.id);
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-muted text-center py-8">No hay vacunas registradas.</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="deworming" className="mt-6">
                    {dewormingRecords && dewormingRecords.length > 0 ? (
                      <div className="space-y-4">
                        {/* Deworming Status Alerts */}
                        {(() => {
                          const now = new Date();
                          const overdueDeworming = dewormingRecords.filter((dew: any) => {
                            if (!dew.nextDueDate) return false;
                            const dueDate = new Date(dew.nextDueDate);
                            return dueDate < now;
                          });
                          const upcomingDeworming = dewormingRecords.filter((dew: any) => {
                            if (!dew.nextDueDate) return false;
                            const dueDate = new Date(dew.nextDueDate);
                            const weekFromNow = new Date();
                            weekFromNow.setDate(weekFromNow.getDate() + 14);
                            return dueDate >= now && dueDate <= weekFromNow;
                          });

                          return (
                            <>
                              {overdueDeworming.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                                    <AlertCircle size={18} />
                                    Desparasitación Atrasada ({overdueDeworming.length})
                                  </div>
                                  <div className="space-y-1">
                                    {overdueDeworming.map((dew: any) => (
                                      <p key={dew.id} className="text-sm text-red-700">
                                        • {dew.product || 'Desparasitante'} - Vencida el {new Date(dew.nextDueDate).toLocaleDateString('es-CL')}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {upcomingDeworming.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                                    <Calendar size={18} />
                                    Próxima Desparasitación ({upcomingDeworming.length})
                                  </div>
                                  <div className="space-y-1">
                                    {upcomingDeworming.map((dew: any) => (
                                      <p key={dew.id} className="text-sm text-amber-700">
                                        • {dew.product || 'Desparasitante'} - Programada para el {new Date(dew.nextDueDate).toLocaleDateString('es-CL')}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Deworming Table */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h4 className="font-semibold text-gray-800">Registro de Desparasitación</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Producto</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Principio Activo</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Fecha Aplicación</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Duración</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Próxima Dosis</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Estado</th>
                                  <th className="text-left px-4 py-3 text-sm font-semibold">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dewormingRecords.map((deworming: any) => {
                                  const now = new Date();
                                  const nextDue = deworming.nextDueDate ? new Date(deworming.nextDueDate) : null;
                                  let status = 'vigente';
                                  let statusColor = 'bg-green-100 text-green-800';
                                  
                                  if (nextDue) {
                                    if (nextDue < now) {
                                      status = 'vencida';
                                      statusColor = 'bg-red-100 text-red-800';
                                    } else if (nextDue <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)) {
                                      status = 'próxima';
                                      statusColor = 'bg-amber-100 text-amber-800';
                                    }
                                  }

                                  // Format duration for display
                                  const formatDuration = (duration: string) => {
                                    const durationMap: { [key: string]: string } = {
                                      '1-month': '1 mes',
                                      '3-months': '3 meses',
                                      '4-months': '4 meses',
                                      '6-months': '6 meses',
                                      'custom': 'Personalizada'
                                    };
                                    return durationMap[duration] || duration || '-';
                                  };

                                  return (
                                    <tr key={deworming.id} className="border-b hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium">{deworming.product || '-'}</td>
                                      <td className="px-4 py-3">{deworming.activeIngredient || '-'}</td>
                                      <td className="px-4 py-3">
                                        {new Date(deworming.applicationDate).toLocaleDateString('es-CL')}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {formatDuration(deworming.duration)}
                                      </td>
                                      <td className="px-4 py-3">
                                        {nextDue ? nextDue.toLocaleDateString('es-CL') : '-'}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                          {status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            if (confirm('¿Eliminar esta desparasitación?')) {
                                              deleteDewormingMutation.mutate(deworming.id);
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-muted text-center py-8">No hay registros de desparasitación.</p>
                    )}
                  </TabsContent>
                </Tabs>
                </CardContent>
              )}
            </Card>

            {/* Certificates History */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('certificates')}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>Historial de Certificados ({certificates.length})</span>
                  {expandedSections.certificates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.certificates && (
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-4">
                      {certificates.map((certificate: any) => (
                        <div key={certificate.id} className="border-l-4 border-pale-rose pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{certificate.type}</p>
                              <p className="text-sm text-text-muted">
                                Emitido: {certificate.issueDate}
                              </p>
                              {certificate.purpose && (
                                <p className="mt-1"><strong>Propósito:</strong> {certificate.purpose}</p>
                              )}
                              {certificate.observations && (
                                <p className="mt-1"><strong>Observaciones:</strong> {certificate.observations}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">Certificado</Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => generateCertificatePDF(selectedPatient, certificate, { name: 'Dra. Alejandra Cautín Bastías' })}
                              >
                                <Download size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('¿Eliminar este certificado?')) {
                                    deleteCertificateMutation.mutate(certificate.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-center py-8">No hay certificados registrados.</p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Questionnaires History */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('questionnaires')}
              >
                <CardTitle className="flex items-center justify-between">
                  <span>Cuestionarios Pre-Visita ({questionnaires.length})</span>
                  {expandedSections.questionnaires ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.questionnaires && (
                <CardContent>
                  {questionnaires.length > 0 ? (
                    <div className="space-y-4">
                      {questionnaires.map((questionnaire: any) => (
                        <div key={questionnaire.id} className="border-l-4 border-turquoise pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold flex items-center gap-2">
                                <FileText size={16} />
                                Cuestionario #{questionnaire.id}
                              </p>
                              <p className="text-sm text-text-muted">
                                Completado: {questionnaire.createdAt ? new Date(questionnaire.createdAt).toLocaleDateString('es-CL') : 'Fecha no disponible'}
                              </p>
                              <div className="mt-2 space-y-1">
                                <p><strong>Cliente:</strong> {questionnaire.clientName}</p>
                                <p><strong>Mascota:</strong> {questionnaire.petName}</p>
                                {questionnaire.appointmentDate && (
                                  <p><strong>Cita asociada:</strong> {new Date(questionnaire.appointmentDate).toLocaleDateString('es-CL')}</p>
                                )}
                                
                                {/* Quick summary */}
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <p className="text-sm font-medium">Resumen:</p>
                                  {questionnaire.travelBehaviors && questionnaire.travelBehaviors.length > 0 && (
                                    <p className="text-sm">• Comportamientos en viaje: {questionnaire.travelBehaviors.join(', ')}</p>
                                  )}
                                  {questionnaire.dislikes && questionnaire.dislikes.length > 0 && (
                                    <p className="text-sm">• No le gusta: {questionnaire.dislikes.join(', ')}</p>
                                  )}
                                  {questionnaire.sensitiveBodyAreas && (
                                    <p className="text-sm">• Áreas sensibles: {questionnaire.sensitiveBodyAreas}</p>
                                  )}
                                  {questionnaire.favoriteTreats && (
                                    <p className="text-sm">• Premios favoritos: {questionnaire.favoriteTreats}</p>
                                  )}
                                  {questionnaire.previousVetVisitStress && (
                                    <p className="text-sm">• Estrés en visitas previas: {questionnaire.previousVetVisitStress}</p>
                                  )}
                                  {questionnaire.specialRequests && (
                                    <p className="text-sm">• Solicitudes especiales: {questionnaire.specialRequests}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Badge variant="outline" className="bg-turquoise/10 text-turquoise border-turquoise">
                                Cuestionario
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedQuestionnaire(questionnaire);
                                  setShowQuestionnaireDetail(true);
                                }}
                                title="Ver cuestionario completo"
                              >
                                <Eye size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={async () => {
                                  if (confirm('¿Estás seguro de que quieres eliminar este cuestionario? Esta acción no se puede deshacer.')) {
                                    try {
                                      const response = await fetch(`/api/questionnaires/${questionnaire.id}`, {
                                        method: 'DELETE'
                                      });
                                      
                                      if (response.ok) {
                                        toast({
                                          title: "Cuestionario eliminado",
                                          description: "El cuestionario ha sido eliminado correctamente."
                                        });
                                        // Refrescar la lista
                                        window.location.reload();
                                      } else {
                                        throw new Error('Error al eliminar');
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "No se pudo eliminar el cuestionario.",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                }}
                                title="Eliminar cuestionario"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-text-muted">No hay cuestionarios pre-visita completados.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Los cuestionarios aparecerán aquí cuando los tutores los completen antes de las citas.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>


          </div>
        )}

        {/* Periodic Medications Modal */}
        {showPeriodicMedForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Gestionar Fármacos Periódicos</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPeriodicMedForm(false);
                    setPeriodicMedication({ medication: '', dose: '', frequency: '', route: 'vía oral', notes: '' });
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Medicamento *</label>
                  <Input
                    value={periodicMedication.medication}
                    onChange={(e) => setPeriodicMedication({...periodicMedication, medication: e.target.value})}
                    placeholder="Nombre del medicamento"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Dosis *</label>
                    <Input
                      value={periodicMedication.dose}
                      onChange={(e) => setPeriodicMedication({...periodicMedication, dose: e.target.value})}
                      placeholder="Ej: 5mg, 1 comprimido"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frecuencia *</label>
                    <Input
                      value={periodicMedication.frequency}
                      onChange={(e) => setPeriodicMedication({...periodicMedication, frequency: e.target.value})}
                      placeholder="Ej: Cada 12 horas, 2 veces al día"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vía de Administración</label>
                  <Input
                    value={periodicMedication.route}
                    onChange={(e) => setPeriodicMedication({...periodicMedication, route: e.target.value})}
                    placeholder="Ej: vía oral, vía subcutánea, vía tópica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notas Adicionales</label>
                  <Textarea
                    value={periodicMedication.notes}
                    onChange={(e) => setPeriodicMedication({...periodicMedication, notes: e.target.value})}
                    rows={3}
                    placeholder="Indicaciones especiales, duración del tratamiento, etc."
                  />
                </div>

                {/* Current medications display */}
                {selectedPatient?.currentMedications && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Medicamentos Actuales</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-line">{selectedPatient.currentMedications}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          if (confirm('¿Eliminar todos los medicamentos periódicos?')) {
                            const updatedPatient = {...selectedPatient, currentMedications: ''};
                            updatePatientMutation.mutate(updatedPatient);
                            setSelectedPatient(updatedPatient);
                          }
                        }}
                      >
                        Limpiar medicamentos
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPeriodicMedForm(false);
                      setPeriodicMedication({ medication: '', dose: '', frequency: '', route: 'vía oral', notes: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!periodicMedication.medication || !periodicMedication.dose || !periodicMedication.frequency) {
                        toast({ title: "Error", description: "Medicamento, dosis y frecuencia son obligatorios", variant: "destructive" });
                        return;
                      }

                      const newMedEntry = `• ${periodicMedication.medication} - ${periodicMedication.dose} - ${periodicMedication.frequency} (${periodicMedication.route})${periodicMedication.notes ? ` - ${periodicMedication.notes}` : ''}`;
                      
                      const existingMeds = selectedPatient?.currentMedications || '';
                      const updatedMeds = existingMeds ? `${existingMeds}\n${newMedEntry}` : newMedEntry;
                      
                      const updatedPatient = {...selectedPatient, currentMedications: updatedMeds};
                      updatePatientMutation.mutate(updatedPatient);
                      setSelectedPatient(updatedPatient);
                      
                      setShowPeriodicMedForm(false);
                      setPeriodicMedication({ medication: '', dose: '', frequency: '', route: 'vía oral', notes: '' });
                      
                      toast({ title: "Éxito", description: "Medicamento agregado a fármacos periódicos" });
                    }}
                    className="bg-mint hover:bg-mint-dark"
                  >
                    Agregar Medicamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Section */}
        {activeSection === 'consultation' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope size={20} />
                Nueva Consulta - {selectedPatient.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateConsultation} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Consulta</label>
                    <Input
                      type="date"
                      value={consultationData.consultationDate}
                      onChange={(e) => setConsultationData({...consultationData, consultationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo de Consulta *</label>
                    <Input
                      value={consultationData.consultationReason}
                      onChange={(e) => setConsultationData({...consultationData, consultationReason: e.target.value})}
                      placeholder="Ej: Control rutinario, síntomas específicos..."
                      required
                    />
                  </div>
                </div>

                {/* Anamnesis */}
                <div>
                  <label className="block text-sm font-medium mb-1">Anamnesis</label>
                  <Textarea
                    value={consultationData.anamnesis}
                    onChange={(e) => setConsultationData({...consultationData, anamnesis: e.target.value})}
                    rows={4}
                    placeholder="Historia clínica, síntomas, evolución..."
                  />
                </div>

                {/* Vital Parameters Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-4 text-mint">Parámetros Vitales</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Frecuencia Respiratoria</label>
                      <Input
                        value={consultationData.respiratoryRate}
                        onChange={(e) => setConsultationData({...consultationData, respiratoryRate: e.target.value})}
                        placeholder="rpm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Peso</label>
                      <Input
                        value={consultationData.weight}
                        onChange={(e) => setConsultationData({...consultationData, weight: e.target.value})}
                        placeholder="kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Temperatura</label>
                      <Input
                        value={consultationData.temperature}
                        onChange={(e) => setConsultationData({...consultationData, temperature: e.target.value})}
                        placeholder="°C"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tiempo Llenado Capilar</label>
                      <Input
                        value={consultationData.capillaryRefillTime}
                        onChange={(e) => setConsultationData({...consultationData, capillaryRefillTime: e.target.value})}
                        placeholder="segundos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Frecuencia Cardíaca</label>
                      <Input
                        value={consultationData.heartRate}
                        onChange={(e) => setConsultationData({...consultationData, heartRate: e.target.value})}
                        placeholder="lpm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Color de Mucosas</label>
                      <Select
                        value={consultationData.mucosaColor}
                        onValueChange={(value) => setConsultationData({...consultationData, mucosaColor: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rosada">Rosada</SelectItem>
                          <SelectItem value="pálida">Pálida</SelectItem>
                          <SelectItem value="cianótica">Cianótica</SelectItem>
                          <SelectItem value="ictérica">Ictérica</SelectItem>
                          <SelectItem value="hiperémicas">Hiperémicas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Physical Examination */}
                <div>
                  <label className="block text-sm font-medium mb-1">Examen Físico Completo</label>
                  <Textarea
                    value={consultationData.physicalExamination}
                    onChange={(e) => setConsultationData({...consultationData, physicalExamination: e.target.value})}
                    rows={6}
                    placeholder="Descripción detallada del examen físico: inspección, palpación, auscultación, percusión. Incluir hallazgos por sistemas (cardiovascular, respiratorio, digestivo, neurológico, etc.)"
                  />
                </div>

                {/* Additional Findings */}
                <div>
                  <label className="block text-sm font-medium mb-1">Hallazgos Específicos</label>
                  <Textarea
                    value={consultationData.physicalExamFindings}
                    onChange={(e) => setConsultationData({...consultationData, physicalExamFindings: e.target.value})}
                    rows={3}
                    placeholder="Hallazgos adicionales relevantes, alteraciones específicas..."
                  />
                </div>

                {/* Diagnosis and Treatment */}
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnóstico Presuntivo</label>
                  <Textarea
                    value={consultationData.presumptiveDiagnosis}
                    onChange={(e) => setConsultationData({...consultationData, presumptiveDiagnosis: e.target.value})}
                    rows={3}
                    placeholder="Diagnóstico principal basado en los hallazgos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Plan Terapéutico</label>
                  <Textarea
                    value={consultationData.therapeuticPlan}
                    onChange={(e) => setConsultationData({...consultationData, therapeuticPlan: e.target.value})}
                    rows={4}
                    placeholder="Tratamiento, medicamentos, indicaciones..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notas Adicionales</label>
                  <Textarea
                    value={consultationData.additionalNotes}
                    onChange={(e) => setConsultationData({...consultationData, additionalNotes: e.target.value})}
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Próxima Cita</label>
                  <Input
                    type="date"
                    value={consultationData.nextAppointment}
                    onChange={(e) => setConsultationData({...consultationData, nextAppointment: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveSection('patient-hub')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-mint hover:bg-mint-dark"
                    disabled={createConsultationMutation.isPending}
                  >
                    {createConsultationMutation.isPending ? 'Guardando...' : 'Guardar Consulta'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Prescription Section */}
        {activeSection === 'prescription' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Nueva Receta - {selectedPatient.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePrescription} className="space-y-6">
                {/* Medication Selection Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg text-mint">Agregar Medicamentos</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Medicamento *</label>
                      <Input
                        value={selectedMedication.name}
                        onChange={(e) => setSelectedMedication({...selectedMedication, name: e.target.value})}
                        placeholder="Nombre del medicamento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dosis *</label>
                      <Input
                        value={selectedMedication.dosage}
                        onChange={(e) => setSelectedMedication({...selectedMedication, dosage: e.target.value})}
                        placeholder="Ej: 1 comprimido, 5ml, 250mg"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Frecuencia *</label>
                      <Input
                        value={selectedMedication.frequency}
                        onChange={(e) => setSelectedMedication({...selectedMedication, frequency: e.target.value})}
                        placeholder="Ej: cada 12 horas, cada 8 horas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duración *</label>
                      <Input
                        value={selectedMedication.duration}
                        onChange={(e) => setSelectedMedication({...selectedMedication, duration: e.target.value})}
                        placeholder="Ej: 7 días, 2 semanas"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Vía de Administración *</label>
                      <Input
                        value={selectedMedication.administrationRoute}
                        onChange={(e) => setSelectedMedication({...selectedMedication, administrationRoute: e.target.value})}
                        placeholder="Ej: vía oral, vía subcutánea, vía tópica"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Indicaciones Especiales del Medicamento</label>
                      <Input
                        value={selectedMedication.specialInstructions}
                        onChange={(e) => setSelectedMedication({...selectedMedication, specialInstructions: e.target.value})}
                        placeholder="Ej: Dar con alimento, en ayunas..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      onClick={addMedicationToPrescription}
                      className="bg-mint hover:bg-mint-dark"
                    >
                      <Plus size={16} className="mr-2" />
                      Agregar Medicamento
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCustomMedicationForm(!showCustomMedicationForm)}
                      className="border-mint text-mint hover:bg-mint hover:text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      {showCustomMedicationForm ? 'Cancelar' : 'Medicamento Personalizado'}
                    </Button>
                  </div>
                </div>

                {/* Custom Medication Form */}
                {showCustomMedicationForm && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-lg text-blue-800">Crear Medicamento Personalizado</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre Comercial *</label>
                        <Input
                          value={customMedication.commercialName}
                          onChange={(e) => setCustomMedication({...customMedication, commercialName: e.target.value})}
                          placeholder="Ej: Sucravet, Amoxidal, Meloxidyl..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Principio Activo *</label>
                        <Input
                          value={customMedication.activeIngredient}
                          onChange={(e) => setCustomMedication({...customMedication, activeIngredient: e.target.value})}
                          placeholder="Ej: Sucralfato 10%, Amoxicilina 500mg..."
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Uso *</label>
                        <Select 
                          value={customMedication.usage} 
                          onValueChange={(value: 'veterinario' | 'humano') => setCustomMedication({...customMedication, usage: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="veterinario">Uso Veterinario</SelectItem>
                            <SelectItem value="humano">Uso Humano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Presentación *</label>
                        <Input
                          value={customMedication.presentation}
                          onChange={(e) => setCustomMedication({...customMedication, presentation: e.target.value})}
                          placeholder="Ej: Solución oral, Comprimidos, Inyectable..."
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Dosis *</label>
                        <Input
                          value={customMedication.dosage}
                          onChange={(e) => setCustomMedication({...customMedication, dosage: e.target.value})}
                          placeholder="Ej: 1 comprimido, 5ml, 0.5mg/kg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Frecuencia *</label>
                        <Input
                          value={customMedication.frequency}
                          onChange={(e) => setCustomMedication({...customMedication, frequency: e.target.value})}
                          placeholder="Ej: cada 12 horas, cada 8 horas"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Duración *</label>
                        <Input
                          value={customMedication.duration}
                          onChange={(e) => setCustomMedication({...customMedication, duration: e.target.value})}
                          placeholder="Ej: 7 días, 2 semanas"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Vía de Administración *</label>
                        <Input
                          value={customMedication.administrationRoute}
                          onChange={(e) => setCustomMedication({...customMedication, administrationRoute: e.target.value})}
                          placeholder="Ej: vía oral, vía subcutánea, vía tópica"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Indicaciones Especiales del Medicamento</label>
                        <Input
                          value={customMedication.specialInstructions}
                          onChange={(e) => setCustomMedication({...customMedication, specialInstructions: e.target.value})}
                          placeholder="Ej: Dar con alimento, en ayunas..."
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={addCustomMedicationToPrescription}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Agregar Medicamento Personalizado
                    </Button>
                  </div>
                )}

                {/* List of Added Medications */}
                {prescriptionData.medications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Medicamentos en la Receta</h3>
                    {prescriptionData.medications.map((medication) => (
                      <div key={medication.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-gray-600">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                              {medication.medicationType}
                            </span>
                            Dar {medication.dosage} por {medication.administrationRoute} {medication.frequency} durante {medication.duration}
                          </p>
                          {medication.specialInstructions && (
                            <p className="text-sm text-orange-600 mt-1">
                              <strong>Indicaciones especiales:</strong> {medication.specialInstructions}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeMedicationFromPrescription(medication.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Indicaciones Adicionales</label>
                  <Textarea
                    value={prescriptionData.indications}
                    onChange={(e) => setPrescriptionData({...prescriptionData, indications: e.target.value})}
                    rows={3}
                    placeholder="Dieta, cuidados especiales, próximo control..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Advertencias</label>
                  <Textarea
                    value={prescriptionData.warnings}
                    onChange={(e) => setPrescriptionData({...prescriptionData, warnings: e.target.value})}
                    rows={3}
                    placeholder="Efectos secundarios, contraindicaciones..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Indicaciones Especiales de Fármacos</label>
                  <Textarea
                    value={prescriptionData.specialInstructions}
                    onChange={(e) => setPrescriptionData({...prescriptionData, specialInstructions: e.target.value})}
                    rows={3}
                    placeholder="Instrucciones especiales generales para la administración de medicamentos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Emisión *</label>
                  <Input
                    type="date"
                    value={prescriptionData.issueDate}
                    onChange={(e) => setPrescriptionData({...prescriptionData, issueDate: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveSection('patient-hub')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-mint hover:bg-mint-dark"
                    disabled={createPrescriptionMutation.isPending}
                  >
                    {createPrescriptionMutation.isPending ? 'Guardando...' : 'Guardar Receta'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Vaccination Section */}
        {activeSection === 'vaccination' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe size={20} />
                Registrar Vacunación - {selectedPatient.name}
              </CardTitle>
              <CardDescription>
                Registra una nueva vacunación aplicada al paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateVaccination} className="space-y-4">
                {/* PRIMERO: Selector de Tipo de Vacuna */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Vacuna *</label>
                  <Select value={vaccinationData.vaccineType} onValueChange={(value) => {
                    // Reset checkboxes when vaccine type changes
                    setVaccinationData({
                      ...vaccinationData, 
                      vaccineType: value,
                      // Reset all disease checkboxes
                      distemper: false,
                      adenovirus: false,
                      leptospira_canicola: false,
                      leptospira_icterohaemorrhagiae: false,
                      leptospira_grippotyphosa_pomona: false,
                      parvovirus: false,
                      parainfluenza: false,
                      coronavirus: false,
                      antirrabica: false,
                      panleucopenia: false,
                      rinotraqueitis: false,
                      calicivirus: false,
                      leucemia_felina: false
                    });
                  }}>
                    <SelectTrigger data-testid="select-vaccine-type">
                      <SelectValue placeholder="Selecciona el tipo de vacuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="octuple">Óctuple (8 enfermedades)</SelectItem>
                      <SelectItem value="sextuple">Séxtuple (6 enfermedades)</SelectItem>
                      <SelectItem value="antirrabica">Antirrábica</SelectItem>
                      <SelectItem value="triple_felina">Triple Felina</SelectItem>
                      <SelectItem value="leucemia_felina">Leucemia Felina</SelectItem>
                      <SelectItem value="otra">Otra vacuna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* SEGUNDO: Enfermedades que cubre - Filtradas por tipo */}
                {vaccinationData.vaccineType && (
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Enfermedades que cubre esta vacuna * (según formato SAG)
                      {vaccinationData.vaccineType === 'antirrabica' && (
                        <span className="text-sm text-gray-500 ml-2">(Solo antirrábica)</span>
                      )}
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(() => {
                        // Definir enfermedades por tipo de vacuna
                        const getDiseasesForVaccineType = () => {
                          const isCanine = selectedPatient?.species?.toLowerCase().includes('canin');
                          const isFeline = selectedPatient?.species?.toLowerCase().includes('felin');
                          
                          if (vaccinationData.vaccineType === 'antirrabica') {
                            return [{ key: 'antirrabica', name: 'Antirrábica' }];
                          }
                          
                          if (isCanine) {
                            const canineAll = [
                              { key: 'distemper', name: 'Distemper' },
                              { key: 'adenovirus', name: 'Adenovirus (Hepatitis)' },
                              { key: 'leptospira_canicola', name: 'Leptospira canicola' },
                              { key: 'leptospira_icterohaemorrhagiae', name: 'Leptospira icterohaemorrhagiae' },
                              { key: 'leptospira_grippotyphosa_pomona', name: 'Leptospira grippotyphosa/pomona' },
                              { key: 'parvovirus', name: 'Parvovirus' },
                              { key: 'parainfluenza', name: 'Parainfluenza' },
                              { key: 'coronavirus', name: 'Coronavirus' }
                            ];
                            
                            if (vaccinationData.vaccineType === 'octuple') {
                              return [...canineAll, { key: 'antirrabica', name: 'Antirrábica' }];
                            }
                            if (vaccinationData.vaccineType === 'sextuple') {
                              return canineAll;
                            }
                            return canineAll; // Para "otra"
                          }
                          
                          if (isFeline) {
                            const felineAll = [
                              { key: 'panleucopenia', name: 'Panleucopenia' },
                              { key: 'rinotraqueitis', name: 'Rinotraqueitis' },
                              { key: 'calicivirus', name: 'Calicivirus' }
                            ];
                            
                            if (vaccinationData.vaccineType === 'triple_felina') {
                              return felineAll;
                            }
                            if (vaccinationData.vaccineType === 'leucemia_felina') {
                              return [{ key: 'leucemia_felina', name: 'Leucemia Felina (FeLV)' }];
                            }
                            return felineAll;
                          }
                          
                          return [];
                        };

                        const diseases = getDiseasesForVaccineType();
                        const midIndex = Math.ceil(diseases.length / 2);
                        const leftColumn = diseases.slice(0, midIndex);
                        const rightColumn = diseases.slice(midIndex);

                        return (
                          <>
                            <div className="space-y-2">
                              {leftColumn.map(disease => (
                                <div key={disease.key} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={disease.key}
                                    checked={Boolean(vaccinationData[disease.key as keyof typeof vaccinationData])}
                                    onChange={(e) => setVaccinationData({...vaccinationData, [disease.key]: e.target.checked})}
                                    className="w-4 h-4"
                                    data-testid={`checkbox-disease-${disease.key}`}
                                  />
                                  <label htmlFor={disease.key} className="text-sm">{disease.name}</label>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              {rightColumn.map(disease => (
                                <div key={disease.key} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={disease.key}
                                    checked={Boolean(vaccinationData[disease.key as keyof typeof vaccinationData])}
                                    onChange={(e) => setVaccinationData({...vaccinationData, [disease.key]: e.target.checked})}
                                    className="w-4 h-4"
                                    data-testid={`checkbox-disease-${disease.key}`}
                                  />
                                  <label htmlFor={disease.key} className="text-sm">{disease.name}</label>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                  </div>
                </div>
                )}

                {/* Nombre y Marca de la Vacuna - Campos Separados */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre de la Vacuna *</label>
                    <input
                      type="text"
                      placeholder="Ej: Vanguard Plus 5"
                      value={vaccinationData.vaccineName || ''}
                      onChange={(e) => setVaccinationData({...vaccinationData, vaccineName: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      data-testid="input-vaccine-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Marca/Laboratorio</label>
                    <input
                      type="text"
                      placeholder="Ej: Zoetis, MSD, Merial"
                      value={vaccinationData.vaccineBrand || ''}
                      onChange={(e) => setVaccinationData({...vaccinationData, vaccineBrand: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      data-testid="input-vaccine-brand"
                    />
                  </div>
                </div>

                {/* Tipo de Formulación (requerido por SAG) */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Formulación (SAG) *</label>
                  <Select value={vaccinationData.vaccineSubType || ''} onValueChange={(value) => setVaccinationData({...vaccinationData, vaccineSubType: value})}>
                    <SelectTrigger data-testid="select-vaccine-formulation">
                      <SelectValue placeholder="Selecciona tipo de formulación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viva_modificada">Viva modificada</SelectItem>
                      <SelectItem value="inactivada">Inactivada</SelectItem>
                      <SelectItem value="mixta">Mixta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Número de Lote</label>
                    <Input
                      value={vaccinationData.batchNumber}
                      onChange={(e) => setVaccinationData({...vaccinationData, batchNumber: e.target.value})}
                      placeholder="Lote de la vacuna"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">N° de Serie</label>
                    <Input
                      value={vaccinationData.serialNumber}
                      onChange={(e) => setVaccinationData({...vaccinationData, serialNumber: e.target.value})}
                      placeholder="Número de serie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Vigencia</label>
                    <Input
                      type="date"
                      value={vaccinationData.validityDate}
                      onChange={(e) => setVaccinationData({...vaccinationData, validityDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Aplicación *</label>
                    <Input
                      type="date"
                      value={vaccinationData.applicationDate}
                      onChange={(e) => setVaccinationData({...vaccinationData, applicationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vigencia</label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="validityType"
                            value="predefined"
                            checked={vaccinationData.validityType === 'predefined'}
                            onChange={(e) => setVaccinationData({...vaccinationData, validityType: e.target.value as 'predefined' | 'manual'})}
                            className="w-4 h-4"
                          />
                          <span>Predefinida</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="validityType"
                            value="manual"
                            checked={vaccinationData.validityType === 'manual'}
                            onChange={(e) => setVaccinationData({...vaccinationData, validityType: e.target.value as 'predefined' | 'manual'})}
                            className="w-4 h-4"
                          />
                          <span>Manual</span>
                        </label>
                      </div>
                      
                      {vaccinationData.validityType === 'predefined' ? (
                        <Select 
                          value={vaccinationData.validityPeriod} 
                          onValueChange={(value) => setVaccinationData({...vaccinationData, validityPeriod: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona vigencia predefinida" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 año</SelectItem>
                            <SelectItem value="3">3 años</SelectItem>
                            <SelectItem value="0.5">6 meses</SelectItem>
                            <SelectItem value="0.25">3 meses</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Número de meses"
                            value={vaccinationData.customValidityMonths}
                            onChange={(e) => setVaccinationData({...vaccinationData, customValidityMonths: e.target.value})}
                            className="w-32"
                            min="1"
                            max="60"
                          />
                          <span className="text-sm text-gray-600">meses</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observaciones</label>
                  <Textarea
                    value={vaccinationData.notes}
                    onChange={(e) => setVaccinationData({...vaccinationData, notes: e.target.value})}
                    rows={3}
                    placeholder="Reacciones, observaciones especiales..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setActiveSection('patient-hub')}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-mint hover:bg-mint-dark" disabled={createVaccinationMutation.isPending}>
                    {createVaccinationMutation.isPending ? 'Registrando...' : 'Registrar Vacunación'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Deworming Section */}
        {activeSection === 'deworming' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug size={20} />
                Registrar Desparasitación - {selectedPatient.name}
              </CardTitle>
              <CardDescription>
                Registra una nueva desparasitación aplicada al paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDeworming} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Desparasitación *</label>
                    <Select value={dewormingData.type} onValueChange={(value) => setDewormingData({...dewormingData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Interna (Endoparásitos)</SelectItem>
                        <SelectItem value="external">Externa (Ectoparásitos)</SelectItem>
                        <SelectItem value="combined">Combinada (Endo + Ecto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Producto *</label>
                    <Input
                      value={dewormingData.product}
                      onChange={(e) => setDewormingData({...dewormingData, product: e.target.value})}
                      placeholder="Nombre del producto"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Principio Activo</label>
                    <Input
                      value={dewormingData.activeIngredient}
                      onChange={(e) => setDewormingData({...dewormingData, activeIngredient: e.target.value})}
                      placeholder="Ivermectina, Milbemicina, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dosis</label>
                    <Input
                      value={dewormingData.dose}
                      onChange={(e) => setDewormingData({...dewormingData, dose: e.target.value})}
                      placeholder="Dosis aplicada"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Laboratorio</label>
                    <Input
                      value={dewormingData.laboratory}
                      onChange={(e) => setDewormingData({...dewormingData, laboratory: e.target.value})}
                      placeholder="Laboratorio fabricante"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lote</label>
                    <Input
                      value={dewormingData.batchNumber}
                      onChange={(e) => setDewormingData({...dewormingData, batchNumber: e.target.value})}
                      placeholder="Número de lote"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Aplicación *</label>
                    <Input
                      type="date"
                      value={dewormingData.applicationDate}
                      onChange={(e) => setDewormingData({...dewormingData, applicationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hora de Aplicación *</label>
                    <Input
                      type="time"
                      value={dewormingData.applicationTime}
                      onChange={(e) => setDewormingData({...dewormingData, applicationTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración del Tratamiento *</label>
                    <Select 
                      value={dewormingData.duration || ''} 
                      onValueChange={(value) => setDewormingData({...dewormingData, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-month">1 mes (antiparasitarios externos)</SelectItem>
                        <SelectItem value="3-months">3 meses (desparasitación interna estándar)</SelectItem>
                        <SelectItem value="4-months">4 meses (desparasitación interna extendida)</SelectItem>
                        <SelectItem value="6-months">6 meses (según criterio médico)</SelectItem>
                        <SelectItem value="custom">Personalizada (especificar en observaciones)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Próxima Aplicación</label>
                    <Input
                      type="date"
                      value={dewormingData.nextDueDate}
                      onChange={(e) => setDewormingData({...dewormingData, nextDueDate: e.target.value})}
                      placeholder="Fecha próxima dosis"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observaciones</label>
                  <Textarea
                    value={dewormingData.notes}
                    onChange={(e) => setDewormingData({...dewormingData, notes: e.target.value})}
                    rows={3}
                    placeholder="Efectividad, reacciones, próxima aplicación..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setActiveSection('patient-hub')}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-mint hover:bg-mint-dark" disabled={createDewormingMutation.isPending}>
                    {createDewormingMutation.isPending ? 'Registrando...' : 'Registrar Desparasitación'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Exam Order Section */}
        {activeSection === 'exam-order' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Orden de Exámenes - {selectedPatient.name}
              </CardTitle>
              <CardDescription>
                Genera una orden de exámenes médicos para el paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!examOrderData.selectedExams.length) {
                  toast({
                    title: "Error",
                    description: "Selecciona al menos un examen",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  const orderData = {
                    petId: selectedPatient.id,
                    selectedExams: examOrderData.selectedExams,
                    clinicalHistory: examOrderData.clinicalHistory,
                    clinicalSuspicion: examOrderData.clinicalSuspicion,
                    urgency: examOrderData.urgency,
                    fastingRequired: examOrderData.fastingRequired,
                    specialInstructions: examOrderData.specialInstructions,
                    orderDate: examOrderData.orderDate,
                    veterinarianId: user?.uid || 'unknown'
                  };

                  await apiRequest('/api/exam-orders/firebase', 'POST', orderData);

                  toast({
                    title: "Éxito",
                    description: "Orden de exámenes generada correctamente"
                  });

                  // Reset form
                  setExamOrderData({
                    selectedExams: [],
                    clinicalHistory: '',
                    clinicalSuspicion: '',
                    urgency: 'normal',
                    fastingRequired: false,
                    specialInstructions: '',
                    orderDate: new Date().toISOString().split('T')[0]
                  });

                  setActiveSection('patient-hub');
                } catch (error) {
                  console.error('Error creating exam order:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo generar la orden de exámenes",
                    variant: "destructive"
                  });
                }
              }}>
                <div className="space-y-6">
                  {/* Exam Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">Seleccionar Exámenes *</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddExamForm(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Agregar Examen
                      </Button>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Input
                          placeholder="Buscar exámenes..."
                          value={examFilter}
                          onChange={(e) => setExamFilter(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filtrar por categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueCategories().map(category => (
                              <SelectItem key={category} value={category}>
                                {category === 'all' ? 'Todas las categorías' : category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Exams Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto border rounded-lg p-4">
                      {getFilteredExams().map((exam) => (
                        <label key={exam.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            value={exam.id}
                            checked={examOrderData.selectedExams.includes(exam.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExamOrderData({
                                  ...examOrderData,
                                  selectedExams: [...examOrderData.selectedExams, exam.id]
                                });
                              } else {
                                setExamOrderData({
                                  ...examOrderData,
                                  selectedExams: examOrderData.selectedExams.filter(id => id !== exam.id)
                                });
                              }
                            }}
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {exam.name}
                              {exam.isCustom && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Personalizado</span>}
                            </div>
                            <div className="text-xs text-gray-500">{exam.category}</div>
                            {exam.description && <div className="text-xs text-gray-400 mt-1">{exam.description}</div>}
                          </div>
                          {exam.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (confirm(`¿Eliminar el examen "${exam.name}"?`)) {
                                  removeCustomExam(exam.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Eliminar examen personalizado"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </label>
                      ))}
                    </div>

                    {getFilteredExams().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron exámenes con los filtros aplicados</p>
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setExamFilter('');
                            setSelectedCategory('all');
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    )}

                    <div className="mt-2 text-sm text-gray-600">
                      {examOrderData.selectedExams.length} exámenes seleccionados de {getFilteredExams().length} disponibles
                    </div>
                  </div>

                  {/* Clinical Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Historia Clínica</label>
                      <Textarea
                        value={examOrderData.clinicalHistory}
                        onChange={(e) => setExamOrderData({...examOrderData, clinicalHistory: e.target.value})}
                        rows={4}
                        placeholder="Motivo de consulta, síntomas observados, evolución..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sospecha Clínica</label>
                      <Textarea
                        value={examOrderData.clinicalSuspicion}
                        onChange={(e) => setExamOrderData({...examOrderData, clinicalSuspicion: e.target.value})}
                        rows={4}
                        placeholder="Diagnóstico presuntivo, diagnósticos diferenciales..."
                      />
                    </div>
                  </div>

                  {/* Order Settings */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Urgencia</label>
                      <Select 
                        value={examOrderData.urgency} 
                        onValueChange={(value) => setExamOrderData({...examOrderData, urgency: value as 'normal' | 'urgent' | 'stat'})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgente (24-48h)</SelectItem>
                          <SelectItem value="stat">STAT (Inmediato)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha de Orden</label>
                      <Input
                        type="date"
                        value={examOrderData.orderDate}
                        onChange={(e) => setExamOrderData({...examOrderData, orderDate: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="fasting"
                        checked={examOrderData.fastingRequired}
                        onChange={(e) => setExamOrderData({...examOrderData, fastingRequired: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <label htmlFor="fasting" className="text-sm font-medium">Requiere Ayuno</label>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Instrucciones Especiales</label>
                    <Textarea
                      value={examOrderData.specialInstructions}
                      onChange={(e) => setExamOrderData({...examOrderData, specialInstructions: e.target.value})}
                      rows={3}
                      placeholder="Preparación especial, medicaciones a suspender, cuidados pre-examen..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setActiveSection('patient-hub')}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Generar Orden de Exámenes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Custom Exam Modal */}
        {showAddExamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Agregar Nuevo Examen</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddExamForm(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Examen *</label>
                  <Input
                    value={customExamData.name}
                    onChange={(e) => setCustomExamData({...customExamData, name: e.target.value})}
                    placeholder="Ej: Perfil de Coagulación"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría Existente</label>
                    <Select 
                      value={customExamData.category} 
                      onValueChange={(value) => setCustomExamData({...customExamData, category: value, newCategory: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueCategories().filter(cat => cat !== 'all').map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nueva Categoría</label>
                    <Input
                      value={customExamData.newCategory}
                      onChange={(e) => setCustomExamData({...customExamData, newCategory: e.target.value, category: ''})}
                      placeholder="Crear nueva categoría"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Textarea
                    value={customExamData.description}
                    onChange={(e) => setCustomExamData({...customExamData, description: e.target.value})}
                    rows={3}
                    placeholder="Descripción del examen, qué evalúa, para qué sirve..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Instrucciones de Preparación</label>
                  <Textarea
                    value={customExamData.preparationInstructions}
                    onChange={(e) => setCustomExamData({...customExamData, preparationInstructions: e.target.value})}
                    rows={3}
                    placeholder="Instrucciones especiales de preparación para el paciente..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customFasting"
                    checked={customExamData.fastingRequired}
                    onChange={(e) => setCustomExamData({...customExamData, fastingRequired: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="customFasting" className="text-sm font-medium">Requiere Ayuno</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddExamForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={addCustomExam}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Agregar Examen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Section */}
        {/* Exam Documents Upload Section */}
        {activeSection === 'exam-documents' && selectedPatient && (
          <div className="space-y-6">
            {/* Show existing documents first */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos de Exámenes - {selectedPatient.name}
                </CardTitle>
                <CardDescription>
                  Documentos y resultados de exámenes guardados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {examDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {examDocuments.map((doc: any, idx: number) => (
                      <div key={idx} className="bg-blue-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-blue-800">{doc.examType}</span>
                            <p className="text-sm text-gray-600 mt-1">{doc.fileName}</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-100">
                            {formatDateToChilean(doc.uploadDate)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>Tamaño: {Math.round(doc.fileSize / 1024)} KB</p>
                          {doc.notes && <p>Notas: {doc.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(doc.objectPath, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.objectPath;
                              link.download = doc.fileName;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar el documento "${doc.fileName}"?\n\nEsta acción no se puede deshacer.`)) {
                                deleteExamDocumentMutation.mutate(doc.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay documentos de exámenes guardados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload new document */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Subir Nuevo Documento de Examen
                </CardTitle>
                <CardDescription>
                  Sube resultados de exámenes para esta mascota
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!examDocumentData.examType || !examDocumentData.uploadedFile) {
                  toast({
                    title: "Error",
                    description: "Completa todos los campos obligatorios y selecciona un archivo",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  // Save document info to database with email data for automatic notifications
                  const documentInfo = {
                    petId: selectedPatient.id,
                    examType: examDocumentData.examType,
                    documentURL: examDocumentData.uploadedFile.uploadURL,
                    fileName: examDocumentData.uploadedFile.name,
                    fileSize: examDocumentData.uploadedFile.size,
                    uploadedBy: user?.uid || 'unknown',
                    notes: examDocumentData.notes,
                    // Información para envío automático de email
                    tutorEmail: selectedPatient.tutorEmail,
                    tutorName: selectedPatient.tutorName,
                    petName: selectedPatient.name,
                    species: selectedPatient.species
                  };

                  await apiRequest('/api/exam-documents', 'POST', documentInfo);

                  toast({
                    title: "Éxito",
                    description: `Documento de examen subido correctamente${selectedPatient.tutorEmail ? ' y enviado por email al cliente' : ''}`
                  });

                  // Invalidate cache to refresh the list
                  queryClient.invalidateQueries({ queryKey: ['/api/exam-documents/pet', selectedPatient?.id] });

                  // Reset form
                  setExamDocumentData({
                    examType: '',
                    notes: '',
                    uploadedFile: null
                  });

                  setActiveSection('patient-hub');
                } catch (error) {
                  console.error('Error uploading exam document:', error);
                  toast({
                    title: "Error",
                    description: "No se pudo subir el documento",
                    variant: "destructive"
                  });
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Examen *</label>
                    <Select 
                      value={examDocumentData.examType} 
                      onValueChange={(value) => setExamDocumentData({...examDocumentData, examType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de examen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hemograma">Hemograma</SelectItem>
                        <SelectItem value="Bioquímica Sanguínea">Bioquímica Sanguínea</SelectItem>
                        <SelectItem value="Perfil Renal">Perfil Renal</SelectItem>
                        <SelectItem value="Perfil Hepático">Perfil Hepático</SelectItem>
                        <SelectItem value="Perfil Tiroideo">Perfil Tiroideo</SelectItem>
                        <SelectItem value="Radiografía">Radiografía</SelectItem>
                        <SelectItem value="Ecografía">Ecografía</SelectItem>
                        <SelectItem value="Electrocardiograma">Electrocardiograma</SelectItem>
                        <SelectItem value="Análisis de Orina">Análisis de Orina</SelectItem>
                        <SelectItem value="Coprocultivo">Coprocultivo</SelectItem>
                        <SelectItem value="Citología">Citología</SelectItem>
                        <SelectItem value="Histopatología">Histopatología</SelectItem>
                        <SelectItem value="Cultivo Bacteriano">Cultivo Bacteriano</SelectItem>
                        <SelectItem value="PCR">PCR</SelectItem>
                        <SelectItem value="Serología">Serología</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subir Documento *</label>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={50 * 1024 * 1024} // 50MB
                      onGetUploadParameters={async () => {
                        const response = await apiRequest('/api/objects/upload', 'POST');
                        return {
                          method: 'PUT' as const,
                          url: response.uploadURL
                        };
                      }}
                      onComplete={(result) => {
                        const uploadedFile = result.successful?.[0];
                        if (uploadedFile) {
                          setExamDocumentData({
                            ...examDocumentData,
                            uploadedFile: uploadedFile
                          });
                          toast({
                            title: "Archivo subido",
                            description: `${uploadedFile.name} se subió correctamente`
                          });
                        }
                      }}
                      buttonClassName="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {examDocumentData.uploadedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                    </ObjectUploader>
                    {examDocumentData.uploadedFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {examDocumentData.uploadedFile.name} ({Math.round(examDocumentData.uploadedFile.size / 1024)} KB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos admitidos: PDF, JPG, PNG. Máximo 50MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notas Adicionales</label>
                    <Textarea
                      value={examDocumentData.notes}
                      onChange={(e) => setExamDocumentData({...examDocumentData, notes: e.target.value})}
                      rows={4}
                      placeholder="Observaciones, hallazgos relevantes, indicaciones del laboratorio..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveSection('patient-hub')}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!examDocumentData.examType || !examDocumentData.uploadedFile}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Documento
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        )}

        {activeSection === 'certificate' && selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={20} />
                Generar Certificado - {selectedPatient.name}
              </CardTitle>
              <CardDescription>
                Genera un certificado oficial para el paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCertificate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Certificado *</label>
                    <Select value={certificateData.type} onValueChange={(value) => setCertificateData({...certificateData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Certificado de Salud</SelectItem>
                        <SelectItem value="export">Certificado de Exportación SAG</SelectItem>
                        <SelectItem value="vaccination">Certificado de Vacunación</SelectItem>
                        <SelectItem value="deworming">Certificado de Desparasitación</SelectItem>
                        <SelectItem value="microchip">Certificado de Microchip</SelectItem>
                        <SelectItem value="sterilization">Certificado de Esterilización</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Propósito</label>
                    <Input
                      value={certificateData.purpose}
                      onChange={(e) => setCertificateData({...certificateData, purpose: e.target.value})}
                      placeholder="Viaje, adopción, residencia..."
                    />
                  </div>
                </div>

                {/* Microchip Type Selection - Only show when microchip certificate is selected */}
                {certificateData.type === 'microchip' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Procedimiento *</label>
                      <Select value={certificateData.microchipType} onValueChange={(value) => setCertificateData({...certificateData, microchipType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="implantation">Implantación de Microchip</SelectItem>
                          <SelectItem value="verification">Verificación de Microchip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* National Registry Status - Only show for verification */}
                    {certificateData.microchipType === 'verification' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Estado en Registro Nacional *</label>
                        <Select 
                          value={certificateData.isRegisteredInNationalDB ? 'registered' : 'not_registered'} 
                          onValueChange={(value) => setCertificateData({...certificateData, isRegisteredInNationalDB: value === 'registered'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">Registrado en Base de Datos Nacional</SelectItem>
                            <SelectItem value="not_registered">No Registrado en Base de Datos Nacional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {/* Export Certificate Fields - Only show when export certificate is selected */}
                {certificateData.type === 'export' && (
                  <div className="space-y-4 p-4 border-l-4 border-blue-300 bg-blue-50 rounded-r-lg">
                    <h4 className="font-medium text-blue-800">Información Adicional para Exportación</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Destino (País) *</label>
                        <Input
                          type="text"
                          value={certificateData.destination}
                          onChange={(e) => setCertificateData({...certificateData, destination: e.target.value})}
                          placeholder="Ej: Estados Unidos, España"
                          data-testid="input-destination"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Examen *</label>
                        <Input
                          type="date"
                          value={certificateData.examDate}
                          onChange={(e) => setCertificateData({...certificateData, examDate: e.target.value})}
                          data-testid="input-exam-date"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Validez (días)</label>
                        <Select value={certificateData.validityDays} onValueChange={(value) => setCertificateData({...certificateData, validityDays: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 días</SelectItem>
                            <SelectItem value="10">10 días (recomendado)</SelectItem>
                            <SelectItem value="15">15 días</SelectItem>
                            <SelectItem value="30">30 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Observaciones Específicas</label>
                        <Input
                          type="text"
                          value={certificateData.exportObservations}
                          onChange={(e) => setCertificateData({...certificateData, exportObservations: e.target.value})}
                          placeholder="Observaciones adicionales para exportación"
                          data-testid="input-export-observations"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Emisión *</label>
                    <Input
                      type="date"
                      value={certificateData.issueDate}
                      onChange={(e) => setCertificateData({...certificateData, issueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Información Adicional</label>
                    <Input
                      value={certificateData.additionalInfo}
                      onChange={(e) => setCertificateData({...certificateData, additionalInfo: e.target.value})}
                      placeholder="Datos específicos requeridos"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observaciones Clínicas</label>
                  <Textarea
                    value={certificateData.observations}
                    onChange={(e) => setCertificateData({...certificateData, observations: e.target.value})}
                    rows={4}
                    placeholder="Estado de salud actual, hallazgos clínicos relevantes..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setActiveSection('patient-hub')}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-mint hover:bg-mint-dark" disabled={createCertificateMutation.isPending}>
                    {createCertificateMutation.isPending ? 'Generando...' : 'Generar Certificado'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Section */}
        {activeSection === 'nutrition' && selectedPatient && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-mint" />
                  Evaluación Nutricional - {selectedPatient.name}
                </CardTitle>
                <CardDescription>
                  Evaluación de condición corporal y requerimientos nutricionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="assessment" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="assessment">Evaluación</TabsTrigger>
                    <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                    <TabsTrigger value="foods">Alimentos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assessment" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Body Condition Scoring */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Evaluación de Condición Corporal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Peso Actual (kg)</Label>
                              <Input
                                value={nutritionData.currentWeight}
                                onChange={(e) => {
                                  const weight = e.target.value;
                                  setNutritionData({...nutritionData, currentWeight: weight});
                                  
                                  // Calcular peso ideal automáticamente si ya hay BCS seleccionado
                                  if (weight && nutritionData.bcs) {
                                    calculateIdealWeightFromBCS(weight, nutritionData.bcs);
                                  }
                                  
                                  // Calculate RER and DER when weight changes
                                  if (weight) {
                                    const weightNum = parseFloat(weight);
                                    const rer = Math.round(70 * Math.pow(weightNum, 0.75));
                                    const factor = parseFloat(nutritionData.activityFactor) || 1.6;
                                    const der = Math.round(rer * factor);
                                    setCalculatedValues(prev => ({...prev, rer, der}));
                                  }
                                }}
                                placeholder="0.0"
                                type="number"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <Label>Peso Ideal (kg)</Label>
                              <Input
                                value={nutritionData.idealWeight}
                                readOnly
                                placeholder="Calculado automáticamente con BCS"
                                className="bg-gray-50"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Método de Evaluación</Label>
                            <Select
                              value={nutritionData.bcsMethod}
                              onValueChange={(value) => setNutritionData({...nutritionData, bcsMethod: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="canine_9_point">BCS Canino (1-9 puntos)</SelectItem>
                                <SelectItem value="feline_9_point">BCS Felino (1-9 puntos)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Puntuación BCS</Label>
                            <Select
                              value={nutritionData.bcs}
                              onValueChange={(value) => {
                                console.log('BCS selected:', value, 'Current weight:', nutritionData.currentWeight);
                                setNutritionData({...nutritionData, bcs: value});
                                
                                // Calcular peso ideal automáticamente cuando se selecciona BCS
                                if (value && nutritionData.currentWeight) {
                                  console.log('Calling calculateIdealWeightFromBCS with:', nutritionData.currentWeight, value);
                                  calculateIdealWeightFromBCS(nutritionData.currentWeight, value);
                                  
                                  // Auto-sugerir recomendaciones basadas en BCS
                                  let suggestion = '';
                                  const bcsNum = parseInt(value);
                                  
                                  if (bcsNum <= 2) {
                                    suggestion = 'Evaluación médica urgente. Dieta hipercalórica y suplementación nutricional.';
                                  } else if (bcsNum === 3) {
                                    suggestion = 'Dieta de ganancia de peso controlada. Evaluar causas subyacentes.';
                                  } else if (bcsNum >= 8) {
                                    suggestion = 'Programa médico de pérdida de peso. Control veterinario semanal inicial.';
                                  } else if (bcsNum >= 6) {
                                    suggestion = 'Dieta hipocalórica controlada. Reducción 1-2% peso corporal/semana.';
                                  } else {
                                    suggestion = 'Mantener dieta actual. Peso corporal ideal según BCS 4-5.';
                                  }
                                  
                                  setNutritionData(prev => ({...prev, recommendations: suggestion}));
                                } else {
                                  console.log('Cannot calculate - missing BCS or weight');
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar puntuación" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - Extremadamente delgado</SelectItem>
                                <SelectItem value="2">2 - Muy delgado</SelectItem>
                                <SelectItem value="3">3 - Delgado</SelectItem>
                                <SelectItem value="4">4 - Bajo peso</SelectItem>
                                <SelectItem value="5">5 - Ideal</SelectItem>
                                <SelectItem value="6">6 - Ligeramente sobrepeso</SelectItem>
                                <SelectItem value="7">7 - Sobrepeso</SelectItem>
                                <SelectItem value="8">8 - Obesidad moderada</SelectItem>
                                <SelectItem value="9">9 - Obesidad severa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Mediciones para cálculos PIBW */}
                          {/* Peso ideal calculado automáticamente basado en BCS */}
                          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm">Evaluación Automática de Peso</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Estado de Peso</Label>
                                <Input
                                  value={calculatedValues.weightStatus || 'Seleccione BCS y peso'}
                                  readOnly
                                  className="bg-gray-50"
                                />
                              </div>
                              <div>
                                <Label>Peso Ideal Estimado (kg)</Label>
                                <Input
                                  value={calculatedValues.idealWeight ? `${calculatedValues.idealWeight.toFixed(2)} kg` : 'Automático con BCS'}
                                  readOnly
                                  className="bg-gray-50"
                                />
                              </div>
                              
                              {/* Información sobre el cálculo automático */}
                              <div className="mt-3 p-3 bg-mint/10 rounded-lg">
                                <div className="text-sm font-medium text-darkgray">
                                  <div>Fórmula AAHA validada contra DEXA</div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {nutritionData.bcs && parseInt(nutritionData.bcs) > 5 && (
                                      <>Peso ideal = Peso actual ÷ (1 + 0.10 × (BCS−5))</>
                                    )}
                                    {nutritionData.bcs && parseInt(nutritionData.bcs) < 5 && (
                                      <>Peso ideal = Peso actual ÷ (1 − 0.10 × (5−BCS))</>
                                    )}
                                    {nutritionData.bcs && (parseInt(nutritionData.bcs) === 4 || parseInt(nutritionData.bcs) === 5) && (
                                      <>BCS 4-5: Peso corporal ideal (sin corrección)</>
                                    )}
                                    {!nutritionData.bcs && <>Cada punto BCS = ±10% de peso corporal</>}
                                  </div>
                                  {calculatedValues.bcsPercentage > 0 && (
                                    <div className="text-xs font-medium text-blue-700 mt-1">
                                      Diferencia estimada: {calculatedValues.bcsPercentage.toFixed(1)}% del peso ideal
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label>Notas de Condición Corporal</Label>
                            <Textarea
                              value={nutritionData.bodyConditionNotes}
                              onChange={(e) => setNutritionData({...nutritionData, bodyConditionNotes: e.target.value})}
                              placeholder="Descripción detallada de la evaluación física..."
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Current Diet */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Dieta Actual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Alimento Principal</Label>
                            <Input
                              value={nutritionData.currentFood}
                              onChange={(e) => setNutritionData({...nutritionData, currentFood: e.target.value})}
                              placeholder="Nombre del alimento"
                            />
                          </div>

                          <div>
                            <Label>Marca</Label>
                            <Input
                              value={nutritionData.currentFoodBrand}
                              onChange={(e) => setNutritionData({...nutritionData, currentFoodBrand: e.target.value})}
                              placeholder="Marca del alimento"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Cantidad Diaria (g)</Label>
                              <Input
                                value={nutritionData.dailyAmount}
                                onChange={(e) => setNutritionData({...nutritionData, dailyAmount: e.target.value})}
                                placeholder="0"
                                type="number"
                              />
                            </div>
                            <div>
                              <Label>Frecuencia</Label>
                              <Select
                                value={nutritionData.feedingFrequency}
                                onValueChange={(value) => setNutritionData({...nutritionData, feedingFrequency: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 vez al día</SelectItem>
                                  <SelectItem value="2">2 veces al día</SelectItem>
                                  <SelectItem value="3">3 veces al día</SelectItem>
                                  <SelectItem value="libre">Alimentación libre</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Premios y Snacks</Label>
                            <Input
                              value={nutritionData.treats}
                              onChange={(e) => setNutritionData({...nutritionData, treats: e.target.value})}
                              placeholder="Tipo y cantidad de premios"
                            />
                          </div>

                          <div>
                            <Label>Suplementos</Label>
                            <Input
                              value={nutritionData.supplements}
                              onChange={(e) => setNutritionData({...nutritionData, supplements: e.target.value})}
                              placeholder="Vitaminas, minerales, etc."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Preocupaciones Nutricionales</Label>
                        <Textarea
                          value={nutritionData.nutritionalConcerns}
                          onChange={(e) => setNutritionData({...nutritionData, nutritionalConcerns: e.target.value})}
                          placeholder="Alergias alimentarias, intolerancias, problemas digestivos..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Recomendaciones</Label>
                        <Textarea
                          value={nutritionData.recommendations}
                          onChange={(e) => setNutritionData({...nutritionData, recommendations: e.target.value})}
                          placeholder="Cambios en la dieta, plan nutricional recomendado..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Meta de Peso</Label>
                          <Select
                            value={nutritionData.weightGoal}
                            onValueChange={(value) => setNutritionData({...nutritionData, weightGoal: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maintain">Mantener</SelectItem>
                              <SelectItem value="gain">Aumentar</SelectItem>
                              <SelectItem value="lose">Reducir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Peso Objetivo (kg)</Label>
                          <Input
                            value={nutritionData.targetWeight}
                            onChange={(e) => setNutritionData({...nutritionData, targetWeight: e.target.value})}
                            placeholder="0.0"
                            type="number"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label>Próximo Control</Label>
                          <Input
                            value={nutritionData.followUpDate}
                            onChange={(e) => setNutritionData({...nutritionData, followUpDate: e.target.value})}
                            type="date"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleSaveNutritionAssessment}
                        className="bg-mint hover:bg-mint-dark"
                        disabled={saveNutritionMutation.isPending}
                      >
                        {saveNutritionMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => generateConsultationReport()}
                      >
                        Generar Informe de Consulta
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="calculator" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Calculadora de Requerimientos Energéticos</CardTitle>
                        <CardDescription>
                          Cálculo de RER (Requerimiento Energético de Reposo) y DER (Requerimiento Energético Diario)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Peso Corporal (kg)</Label>
                            <Input
                              value={nutritionData.currentWeight}
                              onChange={(e) => {
                                const weight = e.target.value;
                                setNutritionData({...nutritionData, currentWeight: weight});
                                if (weight) {
                                  const weightNum = parseFloat(weight);
                                  const rer = Math.round(70 * Math.pow(weightNum, 0.75));
                                  const factor = parseFloat(nutritionData.activityFactor);
                                  const der = Math.round(rer * factor);
                                  setCalculatedValues({...calculatedValues, rer, der});
                                }
                              }}
                              placeholder="0.0"
                              type="number"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <Label>Factor de Actividad/Estado Fisiológico</Label>
                            <Select
                              value={nutritionData.activityFactor}
                              onValueChange={(value) => {
                                setNutritionData({...nutritionData, activityFactor: value});
                                if (nutritionData.currentWeight) {
                                  const weightNum = parseFloat(nutritionData.currentWeight);
                                  const rer = Math.round(70 * Math.pow(weightNum, 0.75));
                                  const factor = parseFloat(value);
                                  const der = Math.round(rer * factor);
                                  setCalculatedValues({...calculatedValues, rer, der});
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[400px] overflow-y-auto">
                                {(() => {
                                  console.log('Rendering factors for species:', selectedPatient?.species);
                                  const factors = selectedPatient?.species === 'Canina' 
                                    ? canineDERFactors 
                                    : selectedPatient?.species === 'Felina' 
                                    ? felineDERFactors 
                                    : [];
                                  
                                  console.log('Total factors to render:', factors.length);
                                  
                                  if (factors.length === 0) {
                                    return (
                                      <>
                                        <SelectItem value="1.6">Adulto castrado (1.6)</SelectItem>
                                        <SelectItem value="1.8">Adulto entero (1.8)</SelectItem>
                                        <SelectItem value="1.2">Inactivo (1.2)</SelectItem>
                                        <SelectItem value="1.0">Pérdida peso (1.0)</SelectItem>
                                        <SelectItem value="2.0">Gestación/lactancia (2.0)</SelectItem>
                                        <SelectItem value="2.5">Crecimiento (2.5)</SelectItem>
                                      </>
                                    );
                                  }
                                  
                                  return factors.map((factor, index) => (
                                    <SelectItem key={`${factor.value}-${index}`} value={factor.value}>
                                      {factor.label}
                                    </SelectItem>
                                  ));
                                })()}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Calorías del Alimento (kcal/100g)</Label>
                            <Input
                              placeholder="350"
                              type="number"
                              onChange={(e) => {
                                const calories = parseFloat(e.target.value);
                                if (calories && calculatedValues.der) {
                                  const amount = Math.round((calculatedValues.der / calories) * 100);
                                  setCalculatedValues({...calculatedValues, recommendedAmount: amount});
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Resultados del Cálculo:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-gray-600">RER (kcal/día):</span>
                              <p className="text-lg font-bold text-mint">{calculatedValues.rer}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">DER (kcal/día):</span>
                              <p className="text-lg font-bold text-mint">{calculatedValues.der}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Cantidad Recomendada (g/día):</span>
                              <p className="text-lg font-bold text-mint">{calculatedValues.recommendedAmount}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Fórmulas y Referencias:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li><strong>RER =</strong> 70 × (peso en kg)^0.75</li>
                            <li><strong>DER =</strong> RER × Factor Específico por Especie y Estado</li>
                            <li><strong>Cantidad =</strong> (DER / calorías por 100g) × 100</li>
                          </ul>
                          <div className="mt-3 text-xs text-blue-600">
                            <p><strong>Factores específicos por estado fisiológico:</strong></p>
                            <p>• {selectedPatient?.species === 'Canina' ? 'Caninos' : selectedPatient?.species === 'Felina' ? 'Felinos' : 'Caninos/Felinos'}: Factores filtrados según especie del paciente</p>
                            <p>• Base de datos: {foods.length} alimentos registrados</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="foods" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Base de Datos de Alimentos</h3>
                      <Button
                        onClick={() => setShowAddFood(true)}
                        className="bg-mint hover:bg-mint-dark"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Alimento
                      </Button>
                    </div>

                    {(showAddFood || showEditFood) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{editingFood ? 'Editar Alimento' : 'Agregar Nuevo Alimento'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Nombre del Alimento</Label>
                                <Input
                                  value={foodData.name}
                                  onChange={(e) => setFoodData({...foodData, name: e.target.value})}
                                  placeholder="Ejemplo: Adult Maintenance"
                                />
                              </div>
                              <div>
                                <Label>Marca</Label>
                                <Input
                                  value={foodData.brand}
                                  onChange={(e) => setFoodData({...foodData, brand: e.target.value})}
                                  placeholder="Ejemplo: Royal Canin"
                                />
                              </div>
                              <div>
                                <Label>Tipo</Label>
                                <Select
                                  value={foodData.type}
                                  onValueChange={(value) => setFoodData({...foodData, type: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kibble">Pellet/Croquetas</SelectItem>
                                    <SelectItem value="wet">Húmedo</SelectItem>
                                    <SelectItem value="raw">Dieta BARF</SelectItem>
                                    <SelectItem value="treat">Premio/Snack</SelectItem>
                                    <SelectItem value="supplement">Suplemento</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Especie</Label>
                                <Select
                                  value={foodData.species}
                                  onValueChange={(value) => setFoodData({...foodData, species: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Canino">Canino</SelectItem>
                                    <SelectItem value="Felino">Felino</SelectItem>
                                    <SelectItem value="Ambos">Ambos</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Etapa de Vida</Label>
                                <Select
                                  value={foodData.lifeStage}
                                  onValueChange={(value) => setFoodData({...foodData, lifeStage: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="puppy">Cachorro</SelectItem>
                                    <SelectItem value="kitten">Gatito</SelectItem>
                                    <SelectItem value="adult">Adulto</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="all">Todas las edades</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Información Nutricional (por 100g)</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <Label>Calorías (kcal)</Label>
                                  <Input
                                    value={foodData.calories}
                                    onChange={(e) => setFoodData({...foodData, calories: e.target.value})}
                                    placeholder="350"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <Label>Proteína (g)</Label>
                                  <Input
                                    value={foodData.protein}
                                    onChange={(e) => setFoodData({...foodData, protein: e.target.value})}
                                    placeholder="25"
                                    type="number"
                                    step="0.1"
                                  />
                                </div>
                                <div>
                                  <Label>Grasa (g)</Label>
                                  <Input
                                    value={foodData.fat}
                                    onChange={(e) => setFoodData({...foodData, fat: e.target.value})}
                                    placeholder="15"
                                    type="number"
                                    step="0.1"
                                  />
                                </div>
                                <div>
                                  <Label>Carbohidratos (g)</Label>
                                  <Input
                                    value={foodData.carbohydrates}
                                    onChange={(e) => setFoodData({...foodData, carbohydrates: e.target.value})}
                                    placeholder="45"
                                    type="number"
                                    step="0.1"
                                  />
                                </div>
                                <div>
                                  <Label>Fibra (g)</Label>
                                  <Input
                                    value={foodData.fiber}
                                    onChange={(e) => setFoodData({...foodData, fiber: e.target.value})}
                                    placeholder="3"
                                    type="number"
                                    step="0.1"
                                  />
                                </div>
                                <div>
                                  <Label>Humedad (g)</Label>
                                  <Input
                                    value={foodData.moisture}
                                    onChange={(e) => setFoodData({...foodData, moisture: e.target.value})}
                                    placeholder="10"
                                    type="number"
                                    step="0.1"
                                  />
                                </div>
                                <div>
                                  <Label>Calcio (mg)</Label>
                                  <Input
                                    value={foodData.calcium}
                                    onChange={(e) => setFoodData({...foodData, calcium: e.target.value})}
                                    placeholder="1000"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <Label>Fósforo (mg)</Label>
                                  <Input
                                    value={foodData.phosphorus}
                                    onChange={(e) => setFoodData({...foodData, phosphorus: e.target.value})}
                                    placeholder="800"
                                    type="number"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Ingredientes Principales</Label>
                              <Textarea
                                value={foodData.ingredients}
                                onChange={(e) => setFoodData({...foodData, ingredients: e.target.value})}
                                placeholder="Pollo, arroz, maíz, subproductos de pollo..."
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label>Notas Adicionales</Label>
                              <Textarea
                                value={foodData.notes}
                                onChange={(e) => setFoodData({...foodData, notes: e.target.value})}
                                placeholder="Indicaciones especiales, beneficios, contraindicaciones..."
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-4">
                              <Button 
                                type="button" 
                                onClick={handleSaveFood}
                                className="bg-mint hover:bg-mint-dark"
                                disabled={saveFoodMutation.isPending || updateFoodMutation.isPending}
                              >
                                {(saveFoodMutation.isPending || updateFoodMutation.isPending) ? 
                                  (editingFood ? 'Actualizando...' : 'Guardando...') : 
                                  (editingFood ? 'Actualizar Alimento' : 'Guardar Alimento')}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={editingFood ? handleCancelEdit : () => setShowAddFood(false)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Alimentos Guardados</CardTitle>
                        <CardDescription>
                          {foods.length} alimentos en la base de datos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {foodsLoading ? (
                          <div className="text-center py-8">
                            <p>Cargando alimentos...</p>
                          </div>
                        ) : foods.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No hay alimentos guardados aún.</p>
                            <p className="text-sm">Agrega alimentos para crear tu base de datos nutricional.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {foods.map((food: any) => (
                                <Card key={food.id} className="hover:shadow-md transition-shadow">
                                  <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-semibold">{food.name}</h4>
                                        {food.brand && (
                                          <p className="text-sm text-gray-600">{food.brand}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          food.type === 'kibble' ? 'bg-brown-100 text-brown-800' :
                                          food.type === 'wet' ? 'bg-blue-100 text-blue-800' :
                                          food.type === 'raw' ? 'bg-green-100 text-green-800' :
                                          food.type === 'treat' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-purple-100 text-purple-800'
                                        }`}>
                                          {food.type === 'kibble' ? 'Pellet' :
                                           food.type === 'wet' ? 'Húmedo' :
                                           food.type === 'raw' ? 'BARF' :
                                           food.type === 'treat' ? 'Premio' : 'Suplemento'}
                                        </span>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-600">Especie:</span>
                                        <p className="font-medium">{food.species}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Etapa:</span>
                                        <p className="font-medium">
                                          {food.lifeStage === 'puppy' ? 'Cachorro' :
                                           food.lifeStage === 'kitten' ? 'Gatito' :
                                           food.lifeStage === 'adult' ? 'Adulto' :
                                           food.lifeStage === 'senior' ? 'Senior' : 'Todas'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {food.calories && (
                                      <div className="pt-2 border-t">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-600">Calorías:</span>
                                            <p className="font-medium">{food.calories} kcal/100g</p>
                                          </div>
                                          {food.protein && (
                                            <div>
                                              <span className="text-gray-600">Proteína:</span>
                                              <p className="font-medium">{food.protein}g/100g</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="pt-2 flex gap-2 flex-wrap">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          // Cargar datos del alimento en el formulario de evaluación
                                          setNutritionData(prev => ({
                                            ...prev,
                                            currentFood: food.name,
                                            currentFoodBrand: food.brand || ''
                                          }));
                                          toast({ title: "Alimento seleccionado", description: `${food.name} agregado a la evaluación` });
                                        }}
                                      >
                                        Usar en Evaluación
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleEditFood(food)}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Edit2 size={14} className="mr-1" />
                                        Editar
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleDeleteFood(food.id)}
                                        className="text-red-600 hover:text-red-700"
                                        disabled={deleteFoodMutation.isPending}
                                      >
                                        <Trash2 size={14} className="mr-1" />
                                        {deleteFoodMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Section */}
        {activeSection === 'report' && selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Informe de Atención para {selectedPatient.name}</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Consulta para el Tutor</CardTitle>
                <p className="text-sm text-gray-600">
                  Crea un resumen comprensible de la consulta para enviar al tutor de la mascota
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de la Visita</Label>
                    <Input
                      type="date"
                      value={tutorReport.visitDate}
                      onChange={(e) => setTutorReport({...tutorReport, visitDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Motivo de la Consulta</Label>
                    <Input
                      value={tutorReport.visitReason}
                      onChange={(e) => setTutorReport({...tutorReport, visitReason: e.target.value})}
                      placeholder="Ej: Control de rutina, vacunación, problema de salud..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Hallazgos Principales</Label>
                  <Textarea
                    value={tutorReport.clinicalFindings}
                    onChange={(e) => setTutorReport({...tutorReport, clinicalFindings: e.target.value})}
                    placeholder="Describe los hallazgos principales en términos comprensibles para el tutor..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Diagnóstico (para el tutor)</Label>
                  <Textarea
                    value={tutorReport.diagnosis}
                    onChange={(e) => setTutorReport({...tutorReport, diagnosis: e.target.value})}
                    placeholder="Explica el diagnóstico de manera clara y comprensible..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Tratamiento Realizado</Label>
                  <Textarea
                    value={tutorReport.treatmentPerformed}
                    onChange={(e) => setTutorReport({...tutorReport, treatmentPerformed: e.target.value})}
                    placeholder="Describe qué procedimientos o tratamientos se realizaron..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Medicamentos Prescritos</Label>
                  <Textarea
                    value={tutorReport.medications}
                    onChange={(e) => setTutorReport({...tutorReport, medications: e.target.value})}
                    placeholder="Lista los medicamentos con instrucciones claras de administración..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Recomendaciones para el Hogar</Label>
                  <Textarea
                    value={tutorReport.recommendations}
                    onChange={(e) => setTutorReport({...tutorReport, recommendations: e.target.value})}
                    placeholder="Cuidados especiales, dieta, ejercicio, observaciones..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Instrucciones de Seguimiento</Label>
                  <Textarea
                    value={tutorReport.followUpInstructions}
                    onChange={(e) => setTutorReport({...tutorReport, followUpInstructions: e.target.value})}
                    placeholder="Cuándo regresar, qué observar, próximas citas..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Próxima Cita (si aplica)</Label>
                    <Input
                      type="date"
                      value={tutorReport.nextAppointment}
                      onChange={(e) => setTutorReport({...tutorReport, nextAppointment: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Señales de Alerta</Label>
                    <Input
                      value={tutorReport.urgentSigns}
                      onChange={(e) => setTutorReport({...tutorReport, urgentSigns: e.target.value})}
                      placeholder="Síntomas que requieren atención inmediata..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Preguntas del Tutor Respondidas</Label>
                  <Textarea
                    value={tutorReport.tutorQuestions}
                    onChange={(e) => setTutorReport({...tutorReport, tutorQuestions: e.target.value})}
                    placeholder="Resumen de las preguntas del tutor y sus respuestas..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 flex-wrap">
                  <Button 
                    variant="secondary"
                    onClick={() => autoFillReport()}
                    className="flex items-center gap-2"
                  >
                    Auto-rellenar Datos
                  </Button>
                  <Button 
                    onClick={() => generateTutorReport()}
                    className="flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Generar Informe para Tutor
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => sendReportToTutor()}
                    className="flex items-center gap-2"
                  >
                    <Phone size={16} />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Management Section */}
        {activeSection === 'schedule-management' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Gestión de Horarios
              </CardTitle>
              <CardDescription>
                Administra tus horarios de atención y disponibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleManagerAdvanced />
            </CardContent>
          </Card>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <NotificationSettings />
        )}

        {/* Google Calendar Integration Section */}
        {activeSection === 'calendar-integration' && (
          <GoogleCalendarIntegration />
        )}

        {/* Questionnaire Detail Modal */}
        <Dialog open={showQuestionnaireDetail} onOpenChange={setShowQuestionnaireDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                Cuestionario Pre-Visita Completo
              </DialogTitle>
              <DialogDescription>
                Información detallada del cuestionario completado por el tutor
              </DialogDescription>
            </DialogHeader>

            {selectedQuestionnaire && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Cliente</p>
                    <p className="text-sm">{selectedQuestionnaire.clientName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Mascota</p>
                    <p className="text-sm">{selectedQuestionnaire.petName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Email</p>
                    <p className="text-sm">{selectedQuestionnaire.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Teléfono</p>
                    <p className="text-sm">{selectedQuestionnaire.phone || 'No proporcionado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Fecha de Cita</p>
                    <p className="text-sm">
                      {selectedQuestionnaire.appointmentDate 
                        ? new Date(selectedQuestionnaire.appointmentDate).toLocaleDateString('es-CL')
                        : 'No especificada'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Completado</p>
                    <p className="text-sm">
                      {selectedQuestionnaire.createdAt 
                        ? new Date(selectedQuestionnaire.createdAt).toLocaleDateString('es-CL')
                        : 'Fecha no disponible'
                      }
                    </p>
                  </div>
                </div>

                {/* Transportation Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                    <Car size={20} />
                    Transporte
                  </h3>
                  
                  {selectedQuestionnaire.travelMethod && (
                    <div>
                      <p className="font-medium text-sm">Método de viaje:</p>
                      <p className="text-sm text-gray-700">{selectedQuestionnaire.travelMethod}</p>
                    </div>
                  )}

                  {selectedQuestionnaire.travelBehaviors && selectedQuestionnaire.travelBehaviors.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Comportamientos durante el viaje:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedQuestionnaire.travelBehaviors.map((behavior: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {behavior}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedQuestionnaire.otherTravelBehavior && (
                    <div>
                      <p className="font-medium text-sm">Otros comportamientos de viaje:</p>
                      <p className="text-sm text-gray-700">{selectedQuestionnaire.otherTravelBehavior}</p>
                    </div>
                  )}
                </div>

                {/* Dislikes Section */}
                {selectedQuestionnaire.dislikes && selectedQuestionnaire.dislikes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <AlertCircle size={20} />
                      Cosas que no le gustan durante las visitas veterinarias
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestionnaire.dislikes.map((dislike: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {dislike}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Behavior */}
                {selectedQuestionnaire.behaviorAroundOthers && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <User size={20} />
                      Comportamiento Social
                    </h3>
                    <div>
                      <p className="font-medium text-sm">Comportamiento con otros animales/personas:</p>
                      <p className="text-sm text-gray-700">{selectedQuestionnaire.behaviorAroundOthers}</p>
                    </div>
                  </div>
                )}

                {/* Physical Sensitivity */}
                {selectedQuestionnaire.sensitiveBodyAreas && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <Heart size={20} />
                      Sensibilidad Física
                    </h3>
                    <div>
                      <p className="font-medium text-sm">Áreas del cuerpo sensibles:</p>
                      <p className="text-sm text-gray-700">{selectedQuestionnaire.sensitiveBodyAreas}</p>
                    </div>
                  </div>
                )}

                {/* Past Procedures */}
                {(selectedQuestionnaire.difficultProcedures || selectedQuestionnaire.petReaction) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <Stethoscope size={20} />
                      Procedimientos Pasados
                    </h3>
                    
                    {selectedQuestionnaire.difficultProcedures && (
                      <div>
                        <p className="font-medium text-sm">Procedimientos difíciles:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.difficultProcedures}</p>
                      </div>
                    )}

                    {selectedQuestionnaire.petReaction && (
                      <div>
                        <p className="font-medium text-sm">Reacción de la mascota:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.petReaction}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Preferences */}
                {(selectedQuestionnaire.favoriteTreats || selectedQuestionnaire.favoriteToys) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <Heart size={20} />
                      Preferencias
                    </h3>
                    
                    {selectedQuestionnaire.favoriteTreats && (
                      <div>
                        <p className="font-medium text-sm">Premios favoritos:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.favoriteTreats}</p>
                      </div>
                    )}

                    {selectedQuestionnaire.favoriteToys && (
                      <div>
                        <p className="font-medium text-sm">Juguetes favoritos:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.favoriteToys}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical History */}
                {(selectedQuestionnaire.previousMedications || selectedQuestionnaire.medicationResults) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <Syringe size={20} />
                      Historial Médico
                    </h3>
                    
                    {selectedQuestionnaire.previousMedications && (
                      <div>
                        <p className="font-medium text-sm">Medicaciones previas:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.previousMedications}</p>
                      </div>
                    )}

                    {selectedQuestionnaire.medicationResults && (
                      <div>
                        <p className="font-medium text-sm">Resultados de medicaciones:</p>
                        <p className="text-sm text-gray-700">{selectedQuestionnaire.medicationResults}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Information */}
                {selectedQuestionnaire.additionalInfo && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
                      <FileText size={20} />
                      Información Adicional
                    </h3>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedQuestionnaire.additionalInfo}</p>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={() => setShowQuestionnaireDetail(false)}
                    variant="outline"
                  >
                    <X size={16} className="mr-2" />
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}