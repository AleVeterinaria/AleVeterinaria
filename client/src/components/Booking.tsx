import React, { useState, useEffect } from 'react';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, User, X } from 'lucide-react';
import { breeds, getBreedsBySpecies } from '@/data/breeds';
import { validateRUT, formatRUTInput } from '@/lib/rutValidator';
import { calculateAge, formatAge } from '@/utils/ageCalculator';
import { formatPhoneInput, isValidPhoneNumber, getPhoneValidationMessage } from '@/utils/phoneFormatter';

const Booking = () => {
  const [showInternalBooking, setShowInternalBooking] = useState(false);
  const [tutorRut, setTutorRut] = useState('');
  const [tutorData, setTutorData] = useState<any>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    // Tutor info
    tutorName: '',
    tutorRut: tutorRut,
    tutorPhone: '',
    tutorEmail: '',
    tutorCity: '',
    tutorAddress: '',
    // Pet info
    name: '',
    species: 'Canino' as 'Canino' | 'Felino',
    breed: '',
    birthDate: '',
    sex: 'Macho',
    weight: '',
    colorMarkings: '',
    microchip: '',
    reproductiveStatus: 'Entero'
  });

  // Validation states
  const [rutValidation, setRutValidation] = useState({ isValid: true, message: '' });
  const [birthDateValidation, setBirthDateValidation] = useState({ isValid: true, message: '' });
  const [availableBreeds, setAvailableBreeds] = useState(breeds.filter(breed => breed.species === 'Canino'));

  // Update RUT in newPatientData when tutorRut changes
  useEffect(() => {
    setNewPatientData(prev => ({ ...prev, tutorRut: tutorRut }));
  }, [tutorRut]);

  // Update available breeds when species changes
  useEffect(() => {
    const filteredBreeds = getBreedsBySpecies(newPatientData.species);
    setAvailableBreeds(filteredBreeds);
    // Reset breed selection if it's not valid for the new species
    if (newPatientData.breed && !filteredBreeds.find(breed => breed.name === newPatientData.breed)) {
      setNewPatientData(prev => ({ ...prev, breed: '' }));
    }
  }, [newPatientData.species]);

  // RUT validation
  const handleRUTChange = (value: string) => {
    const formattedRUT = formatRUTInput(value);
    const validation = validateRUT(formattedRUT);
    
    setNewPatientData(prev => ({ ...prev, tutorRut: formattedRUT }));
    setRutValidation(validation);
  };

  // Birth date validation
  const handleBirthDateChange = (value: string) => {
    const selectedDate = new Date(value);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 20); // 20 years ago

    let validation = { isValid: true, message: '' };
    
    if (selectedDate > today) {
      validation = { isValid: false, message: 'La fecha de nacimiento no puede ser futura' };
    } else if (selectedDate < maxDate) {
      validation = { isValid: false, message: 'La fecha parece demasiado antigua. Verifica el año.' };
    }

    setNewPatientData(prev => ({ ...prev, birthDate: value }));
    setBirthDateValidation(validation);
  };

  // Calculate patient age
  const getPatientAge = (birthDate: string) => {
    if (!birthDate) return '';
    return formatAge(calculateAge(birthDate));
  };



  const handleRutSubmit = async () => {
    if (!tutorRut) {
      alert('Por favor ingresa tu RUT');
      return;
    }
    
    try {
      // Try database first
      let response = await fetch(`/api/pets/rut/${tutorRut}`);
      let pets = [];
      
      if (response.ok) {
        pets = await response.json();
      }
      
      // If no pets found in database, try Firebase as fallback
      if (!pets || pets.length === 0) {
        const firebaseResponse = await fetch(`/api/pets/firebase/tutor/${tutorRut}`);
        if (firebaseResponse.ok) {
          pets = await firebaseResponse.json();
        }
      }
      
      if (pets && pets.length > 0) {
        setTutorData({ pets });
        setShowInternalBooking(true);
      } else {
        // Si no hay mascotas, mostrar formulario para nueva ficha
        setShowNewPatientForm(true);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      alert('Error al buscar información. Intenta nuevamente.');
    }
  };

  const handleCreateNewPatient = async () => {
    // Validate required fields
    if (!newPatientData.tutorName || !newPatientData.name || !newPatientData.tutorRut) {
      alert('Por favor completa los campos obligatorios: Nombre del tutor, RUT y nombre de la mascota');
      return;
    }

    // Validate RUT
    if (!rutValidation.isValid) {
      alert('Por favor ingresa un RUT válido');
      return;
    }

    // Validate breed selection
    if (!newPatientData.breed) {
      alert('Por favor selecciona una raza');
      return;
    }

    // Validate birth date
    if (!birthDateValidation.isValid) {
      alert('Por favor corrige la fecha de nacimiento');
      return;
    }

    try {
      // Create patient in PostgreSQL database
      const petResponse = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: newPatientData.tutorRut,
          name: newPatientData.name,
          species: newPatientData.species,
          breed: newPatientData.breed,
          sex: newPatientData.sex,
          birthDate: newPatientData.birthDate || null,
          weight: newPatientData.weight ? parseFloat(newPatientData.weight) : null,
          colorMarkings: newPatientData.colorMarkings || null,
          microchip: newPatientData.microchip || null,
          reproductiveStatus: newPatientData.reproductiveStatus || null,
          // Tutor information
          tutorName: newPatientData.tutorName,
          tutorPhone: newPatientData.tutorPhone || null,
          tutorEmail: newPatientData.tutorEmail || null,
          tutorCity: newPatientData.tutorCity || null,
          tutorAddress: newPatientData.tutorAddress || null
        })
      });

      if (petResponse.ok) {
        const newPet = await petResponse.json();
        setTutorData({ pets: [newPet] });
        setShowNewPatientForm(false);
        setShowInternalBooking(true);
        alert('¡Ficha creada exitosamente! Ahora puedes agendar tu cita.');
      } else {
        const errorData = await petResponse.json();
        console.error('Error response from server:', errorData);
        
        // Handle array of errors (from Zod validation)
        if (Array.isArray(errorData.error)) {
          const errorMessages = errorData.error.map((err: any) => `${err.path?.join('.') || 'Campo'}: ${err.message}`).join('\n');
          alert(`Error de validación:\n${errorMessages}`);
        } else if (typeof errorData.error === 'string') {
          alert(`Error al crear la ficha: ${errorData.error}`);
        } else {
          alert('Error al crear la ficha. Por favor verifica los datos e intenta nuevamente.');
        }
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error al crear la ficha. Verifica tu conexión e intenta nuevamente.');
    }
  };

  const paymentMethods = [
    { icon: "fas fa-credit-card", label: "Tarjetas", color: "text-mint" },
    { icon: "fas fa-university", label: "Transferencia", color: "text-lavender" },
    { icon: "fas fa-money-bill-wave", label: "Efectivo", color: "text-turquoise" }
  ];

  return (
    <section id="agendar" className="py-20 bg-gradient-to-br from-mint to-turquoise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-poppins font-bold text-white mb-6">Agenda tu Cita</h2>
        <p className="text-xl text-white font-lato mb-12 max-w-3xl mx-auto">
          Selecciona el día y hora que mejor te convenga. Nos pondremos en contacto contigo para confirmar los detalles.
        </p>
        
        {/* Sistema de Reservas */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto">
          <div className="text-center py-16">
            <i className="fas fa-calendar-alt text-6xl text-mint mb-6"></i>
            <h3 className="text-2xl font-poppins font-semibold text-darkgray mb-4">Calendario de Reservas</h3>
            <p className="text-gray-600 font-lato mb-8">Ingresa tu RUT para verificar si ya tienes mascotas registradas o crear una nueva ficha</p>
            
            <div className="space-y-6 mb-8">
              {/* Sistema de Reservas */}
              <div className="bg-gradient-to-r from-mint to-turquoise p-6 rounded-2xl text-white">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <input
                    type="text"
                    placeholder="Ingresa tu RUT (12345678-9)"
                    value={tutorRut}
                    onChange={(e) => setTutorRut(e.target.value)}
                    className="px-4 py-3 rounded-xl text-darkgray flex-1 min-w-0 font-lato focus:ring-2 focus:ring-white focus:outline-none"
                    data-testid="input-tutor-rut"
                  />
                  <button
                    onClick={handleRutSubmit}
                    className="bg-white text-mint px-8 py-3 rounded-xl font-poppins font-semibold hover:shadow-lg transition-all"
                    data-testid="button-search-schedule"
                  >
                    <i className="fas fa-search mr-2"></i>
                    Buscar y Agendar
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Después de agendar tu cita, recibirás un enlace por email para completar el cuestionario pre-visita Fear Free®. Este cuestionario nos ayuda a preparar la mejor experiencia posible para tu mascota.
              </p>
            </div>
          </div>
        </div>

        {/* Modal de Formulario Nueva Ficha - Diseño Profesional */}
        {showNewPatientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl max-h-[95vh] overflow-y-auto w-full shadow-2xl">
              <Card className="border-0 shadow-none">
                <CardHeader className="border-b bg-gradient-to-r from-mint to-turquoise text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white text-xl">
                        <Plus size={24} />
                        Crear nueva ficha de paciente
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        RUT: {tutorRut} - Complete la información para crear la ficha y agendar
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNewPatientForm(false)}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {/* Información del Tutor */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-mint flex items-center gap-2">
                        <User size={20} />
                        Datos del Tutor
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium mb-1">Nombre completo *</Label>
                          <Input
                            value={newPatientData.tutorName}
                            onChange={(e) => setNewPatientData(prev => ({...prev, tutorName: e.target.value}))}
                            placeholder="Juan Pérez"
                            className="focus:ring-2 focus:ring-mint"
                            required
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">RUT *</Label>
                          <Input
                            value={newPatientData.tutorRut}
                            onChange={(e) => handleRUTChange(e.target.value)}
                            placeholder="12345678-9"
                            className={`focus:ring-2 focus:ring-mint ${!rutValidation.isValid ? 'border-red-500' : ''}`}
                          />
                          {!rutValidation.isValid && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {rutValidation.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Teléfono Móvil</Label>
                          <Input
                            value={newPatientData.tutorPhone}
                            onChange={(e) => {
                              const formatted = formatPhoneInput(e.target.value);
                              setNewPatientData(prev => ({...prev, tutorPhone: formatted}));
                            }}
                            placeholder="+56 9 1234 5678"
                            className={`focus:ring-2 focus:ring-mint ${!isValidPhoneNumber(newPatientData.tutorPhone) && newPatientData.tutorPhone.length > 4 ? 'border-red-300' : ''}`}
                          />
                          {newPatientData.tutorPhone.length > 4 && !isValidPhoneNumber(newPatientData.tutorPhone) && (
                            <p className="text-xs text-red-500 mt-1">
                              {getPhoneValidationMessage(newPatientData.tutorPhone)}
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
                            value={newPatientData.tutorEmail}
                            onChange={(e) => setNewPatientData(prev => ({...prev, tutorEmail: e.target.value}))}
                            placeholder="juan@email.com"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Ciudad</Label>
                          <Input
                            value={newPatientData.tutorCity}
                            onChange={(e) => setNewPatientData(prev => ({...prev, tutorCity: e.target.value}))}
                            placeholder="Santiago"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Dirección</Label>
                          <Input
                            value={newPatientData.tutorAddress}
                            onChange={(e) => setNewPatientData(prev => ({...prev, tutorAddress: e.target.value}))}
                            placeholder="Av. Providencia 123, Santiago"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información del Paciente */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-mint">Datos del Paciente</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-medium mb-1">Nombre *</Label>
                          <Input
                            value={newPatientData.name}
                            onChange={(e) => setNewPatientData(prev => ({...prev, name: e.target.value}))}
                            placeholder="Max"
                            className="focus:ring-2 focus:ring-mint"
                            required
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Especie</Label>
                          <Select
                            value={newPatientData.species}
                            onValueChange={(value: 'Canino' | 'Felino') => setNewPatientData(prev => ({...prev, species: value}))}
                          >
                            <SelectTrigger className="focus:ring-2 focus:ring-mint">
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
                            onValueChange={(value) => setNewPatientData(prev => ({...prev, breed: value}))}
                          >
                            <SelectTrigger className="focus:ring-2 focus:ring-mint">
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
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={14} />
                              Selecciona una raza para continuar
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Sexo</Label>
                          <Select
                            value={newPatientData.sex}
                            onValueChange={(value) => setNewPatientData(prev => ({...prev, sex: value}))}
                          >
                            <SelectTrigger className="focus:ring-2 focus:ring-mint">
                              <SelectValue />
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
                            className={`focus:ring-2 focus:ring-mint ${!birthDateValidation.isValid ? 'border-red-500' : ''}`}
                          />
                          {newPatientData.birthDate && birthDateValidation.isValid && (
                            <p className="text-sm text-gray-600 mt-1">
                              Edad: {getPatientAge(newPatientData.birthDate)}
                            </p>
                          )}
                          {!birthDateValidation.isValid && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {birthDateValidation.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Peso</Label>
                          <Input
                            value={newPatientData.weight}
                            onChange={(e) => setNewPatientData(prev => ({...prev, weight: e.target.value}))}
                            placeholder="3.5 kg"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Color/Marcas</Label>
                          <Input
                            value={newPatientData.colorMarkings}
                            onChange={(e) => setNewPatientData(prev => ({...prev, colorMarkings: e.target.value}))}
                            placeholder="Dorado con mancha blanca en pecho"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Estado reproductivo</Label>
                          <Select
                            value={newPatientData.reproductiveStatus}
                            onValueChange={(value) => setNewPatientData(prev => ({...prev, reproductiveStatus: value}))}
                          >
                            <SelectTrigger className="focus:ring-2 focus:ring-mint">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entero">Entero</SelectItem>
                              <SelectItem value="Castrado">Castrado</SelectItem>
                              <SelectItem value="Esterilizado">Esterilizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">Microchip</Label>
                          <Input
                            value={newPatientData.microchip}
                            onChange={(e) => setNewPatientData(prev => ({...prev, microchip: e.target.value}))}
                            placeholder="123456789012345"
                            className="focus:ring-2 focus:ring-mint"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewPatientForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateNewPatient}
                        className="flex-1 bg-mint hover:bg-mint-dark text-white"
                        disabled={!newPatientData.tutorName || !newPatientData.name || !rutValidation.isValid || !newPatientData.breed}
                      >
                        <Plus className="mr-2" size={16} />
                        Crear ficha y agendar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Agenda Interna */}
        {showInternalBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-y-auto w-full">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Agendar Cita</h2>
                  <button 
                    onClick={() => setShowInternalBooking(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                {tutorData && (
                  <AppointmentScheduler 
                    tutorRut={tutorRut} 
                    pets={tutorData.pets} 
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-16">
          <h3 className="text-2xl font-poppins font-semibold text-white mb-8">Métodos de Pago</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {paymentMethods.map((method, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <i className={`${method.icon} text-3xl ${method.color} mb-3`}></i>
                <p className="font-poppins font-medium text-darkgray">{method.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
