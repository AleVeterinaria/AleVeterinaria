import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, MapPin, Phone, User, Calendar as CalendarIcon, Edit3, X, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@shared/schema';
import { formatDateToChilean, formatDateTimeToChilean } from '@/utils/dateFormatter';
import { chileanRegions, getAllRegions, getCommunesByRegion } from '@/data/chileanRegions';
import { formatPhoneInput, isValidPhoneNumber, getPhoneValidationMessage } from '@/utils/phoneFormatter';
import { getServiceNames, getServiceDuration, MIN_APPOINTMENT_SEPARATION } from '@shared/serviceTypes';
import PreVisitQuestionnaire from './PreVisitQuestionnaire';

interface AppointmentSchedulerProps {
  tutorRut: string;
  pets: any[];
}

const serviceTypes = getServiceNames();

export function AppointmentScheduler({ tutorRut, pets }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [tutorInfo, setTutorInfo] = useState({
    name: '',
    phone: '',
    email: '',
    region: '',
    comuna: '',
    address: '',
    houseNumber: '',
    apartmentNumber: '',
    consentWhatsapp: false,
    consentEmail: false
  });
  const [notes, setNotes] = useState<string>('');
  const [editingTutor, setEditingTutor] = useState<boolean>(false);
  const [showWeekView, setShowWeekView] = useState<boolean>(true);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean | string>(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-fill tutor info from first pet if available
  useEffect(() => {
    if (pets && pets.length > 0) {
      const firstPet = pets[0];
      
      const tutorName = firstPet.tutorName || firstPet.ownerName || '';
      const tutorPhone = firstPet.tutorPhone || firstPet.ownerPhone || '';
      const tutorEmail = firstPet.tutorEmail || firstPet.ownerEmail || '';
      const tutorAddress = firstPet.tutorAddress || firstPet.ownerAddress || '';
      
      if (tutorName || tutorPhone || tutorEmail || tutorAddress) {
        setTutorInfo(prev => ({
          ...prev,
          name: tutorName,
          phone: tutorPhone,
          email: tutorEmail,
          address: tutorAddress
        }));
      }
    }
  }, [pets]);

  // Auto-fill tutor info when selecting a specific pet
  useEffect(() => {
    if (selectedPet && pets && pets.length > 0) {
      const selectedPetData = pets.find(pet => pet.id === selectedPet);
      if (selectedPetData) {
        
        const tutorName = selectedPetData.tutorName || selectedPetData.ownerName || '';
        const tutorPhone = selectedPetData.tutorPhone || selectedPetData.ownerPhone || '';
        const tutorEmail = selectedPetData.tutorEmail || selectedPetData.ownerEmail || '';
        const tutorAddress = selectedPetData.tutorAddress || selectedPetData.ownerAddress || selectedPetData.address || '';
        const tutorCity = selectedPetData.tutorCity || selectedPetData.city || '';
        const tutorRegion = selectedPetData.tutorRegion || selectedPetData.region || '';
        const tutorComuna = selectedPetData.tutorComuna || selectedPetData.comuna || selectedPetData.city || '';
        const tutorHouseNumber = selectedPetData.tutorHouseNumber || selectedPetData.houseNumber || '';
        const tutorApartmentNumber = selectedPetData.tutorApartmentNumber || selectedPetData.apartmentNumber || '';
        
        // Auto-completar todos los campos disponibles
        const newTutorInfo = {
          name: tutorName,
          phone: tutorPhone,
          email: tutorEmail,
          address: tutorAddress,
          region: tutorRegion,
          comuna: tutorComuna,
          houseNumber: tutorHouseNumber,
          apartmentNumber: tutorApartmentNumber
        };
        
        setTutorInfo(prev => ({ ...prev, ...newTutorInfo }));
        
        // Force update form fields visually
        Object.entries(newTutorInfo).forEach(([key, value]) => {
          if (value && document.querySelector(`[name="tutor_${key}"]`)) {
            const input = document.querySelector(`[name="tutor_${key}"]`) as HTMLInputElement;
            if (input) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        });
        
      }
    }
  }, [selectedPet, pets]);

  // Get appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/tutor', tutorRut]
  });

  // Get available slots for selected date
  const { data: availableSlots = [] } = useQuery<string[]>({
    queryKey: ['/api/schedule/availability', selectedDate?.toISOString().split('T')[0], selectedService],
    queryFn: async () => {
      const dateStr = selectedDate?.toISOString().split('T')[0];
      const params = new URLSearchParams();
      if (selectedService) {
        params.append('serviceType', selectedService);
      }
      const response = await fetch(`/api/schedule/availability/${dateStr}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
    enabled: !!selectedDate
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return response.json();
    },
    onSuccess: (newAppointment) => {
      // Store the created appointment data for the questionnaire
      setCreatedAppointment({
        ...newAppointment,
        selectedPetData: pets.find(pet => pet.id === selectedPet),
        tutorInfo: tutorInfo
      });
      
      toast({
        title: "Cita Agendada",
        description: "Tu cita ha sido agendada exitosamente. Se ha enviado un enlace del cuestionario pre-visita a tu email/WhatsApp.",
      });
      
      // Show success message with option to complete questionnaire now
      setShowQuestionnaire(true);
      setCreatedAppointment(result);
      
      // Clear form after successful appointment
      setSelectedDate(new Date());
      setSelectedTime('');
      setSelectedService('');
      setSelectedPet('');
      setNotes('');
      
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/tutor', tutorRut] });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo agendar la cita. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    }
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita Cancelada",
        description: "Tu cita ha sido cancelada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/tutor', tutorRut] });
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: any }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update appointment' }));
        throw new Error(errorData.error || 'Failed to update appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita Actualizada",
        description: "Tu cita ha sido actualizada exitosamente.",
      });
      setEditingAppointment(null);
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/tutor', tutorRut] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar la cita",
        variant: "destructive"
      });
    }
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete appointment' }));
        throw new Error(error.error || 'Failed to delete appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita Eliminada",
        description: "La cita cancelada ha sido eliminada permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/tutor', tutorRut] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cita",
        variant: "destructive"
      });
    }
  });

  // Handler functions
  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedService || !selectedPet || 
        !tutorInfo.name || !tutorInfo.phone || !tutorInfo.email || !tutorInfo.region || 
        !tutorInfo.comuna || !tutorInfo.address || !tutorInfo.houseNumber) {
      toast({
        title: "Información Incompleta",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }

    // Validar consentimiento obligatorio
    if (!tutorInfo.consentEmail && !tutorInfo.consentWhatsapp) {
      toast({
        title: "Consentimiento Requerido",
        description: "Debes aceptar al menos un método de comunicación (email o WhatsApp) para continuar.",
        variant: "destructive"
      });
      return;
    }

    const selectedPetData = pets.find(p => p.id === selectedPet);
    
    const appointmentData = {
      petId: selectedPet,
      tutorRut: tutorRut.replace(/\D/g, ''),
      appointmentDate: selectedDate.toISOString().split('T')[0],
      appointmentTime: selectedTime,
      duration: 60,
      serviceType: selectedService,
      status: 'scheduled',
      notes: notes,
      address: `${tutorInfo.address} ${tutorInfo.houseNumber}${tutorInfo.apartmentNumber ? ', Depto ' + tutorInfo.apartmentNumber : ''}, ${tutorInfo.comuna}, ${tutorInfo.region}`,
      tutorPhone: tutorInfo.phone,
      tutorName: tutorInfo.name,
      tutorEmail: tutorInfo.email,
      petName: selectedPetData?.name || '',
      consentWhatsapp: tutorInfo.consentWhatsapp,
      consentEmail: tutorInfo.consentEmail,
      consentTimestamp: new Date().toISOString()
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta cita cancelada?')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  // Function to handle questionnaire completion
  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    setCreatedAppointment(null);
    
    // Now clear the appointment form
    setSelectedDate(new Date());
    setSelectedTime('');
    setSelectedService('');
    setSelectedPet('');
    setNotes('');
    
    toast({
      title: "Proceso Completado",
      description: "¡Perfecto! Tu cita está confirmada y el cuestionario pre-visita ha sido enviado.",
    });
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    setEditForm({
      serviceType: appointment.serviceType,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      address: appointment.address,
      tutorPhone: appointment.tutorPhone,
      tutorName: appointment.tutorName,
      tutorEmail: (appointment as any).tutorEmail || ''
    });
  };

  const handleSaveEdit = (appointmentId: string) => {
    if (!editForm) {
      toast({
        title: "Error",
        description: "No hay datos de edición disponibles.",
        variant: "destructive"
      });
      return;
    }

    updateAppointmentMutation.mutate({
      appointmentId,
      data: editForm
    });
  };

  // Availability Calendar Component
  const AvailabilityCalendar = ({ selectedDate, onDateSelect, serviceType, editingAppointmentId }: {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    serviceType?: string;
    editingAppointmentId: string;
  }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewType, setViewType] = useState<'week' | 'month'>('week');
    
    // Get availability for the displayed period
    const startOfPeriod = viewType === 'week' 
      ? new Date(currentMonth.getTime() - currentMonth.getDay() * 24 * 60 * 60 * 1000)
      : new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const endOfPeriod = viewType === 'week'
      ? new Date(startOfPeriod.getTime() + 6 * 24 * 60 * 60 * 1000)
      : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data: periodAvailability = {} } = useQuery({
      queryKey: ['/api/schedule/availability', 'period', startOfPeriod.toISOString().split('T')[0], endOfPeriod.toISOString().split('T')[0], serviceType, editingAppointmentId],
      queryFn: async () => {
        const availability: Record<string, string[]> = {};
        const current = new Date(startOfPeriod);
        
        while (current <= endOfPeriod) {
          const dateStr = current.toISOString().split('T')[0];
          if (current >= new Date()) {
            try {
              const params = new URLSearchParams();
              if (serviceType) params.append('serviceType', serviceType);
              params.append('editingAppointment', editingAppointmentId);
              
              const response = await fetch(`/api/schedule/availability/${dateStr}?${params}`);
              if (response.ok) {
                availability[dateStr] = await response.json();
              } else {
                availability[dateStr] = [];
              }
            } catch {
              availability[dateStr] = [];
            }
          } else {
            availability[dateStr] = [];
          }
          current.setDate(current.getDate() + 1);
        }
        return availability;
      },
      enabled: true
    });

    const getDaysInPeriod = () => {
      const days = [];
      const current = new Date(startOfPeriod);
      
      while (current <= endOfPeriod) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    };

    const navigatePeriod = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentMonth);
      if (viewType === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      setCurrentMonth(newDate);
    };

    const formatPeriodTitle = () => {
      if (viewType === 'week') {
        const end = new Date(startOfPeriod.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${startOfPeriod.getDate()}/${startOfPeriod.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
      } else {
        return currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
      }
    };

    const getAvailabilityColor = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const slots = periodAvailability[dateStr] || [];
      if (slots.length === 0) return 'bg-red-100 text-red-800';
      if (slots.length <= 2) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    };

    return (
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Disponibilidad</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewType === 'week' ? 'default' : 'outline'}
              onClick={() => setViewType('week')}
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={viewType === 'month' ? 'default' : 'outline'}
              onClick={() => setViewType('month')}
            >
              Mes
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={() => navigatePeriod('prev')}>
            ← Anterior
          </Button>
          <span className="font-medium">{formatPeriodTitle()}</span>
          <Button size="sm" variant="outline" onClick={() => navigatePeriod('next')}>
            Siguiente →
          </Button>
        </div>

        <div className={`grid gap-2 ${viewType === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {viewType === 'month' && ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          
          {getDaysInPeriod().map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isPast = date < new Date();
            const slots = periodAvailability[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`p-2 text-center border rounded cursor-pointer transition-colors ${
                  isPast 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : isToday
                    ? 'border-blue-400 bg-blue-50'
                    : getAvailabilityColor(date)
                }`}
                onClick={() => !isPast && onDateSelect(dateStr)}
              >
                <div className="font-medium text-sm">
                  {date.getDate()}
                </div>
                {!isPast && (
                  <div className="text-xs mt-1">
                    {slots.length > 0 ? `${slots.length} slots` : 'Sin slots'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border rounded"></div>
            <span>Muchos slots</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border rounded"></div>
            <span>Pocos slots</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border rounded"></div>
            <span>Sin disponibilidad</span>
          </div>
        </div>
      </div>
    );
  };

  // Component for editable time slots that respects availability
  const EditableTimeSlots = ({ selectedDate, selectedService, currentAppointmentId, selectedTime, onTimeChange }: {
    selectedDate?: string;
    selectedService?: string;
    currentAppointmentId: string;
    selectedTime: string;
    onTimeChange: (value: string) => void;
  }) => {
    const { data: editAvailableSlots = [] } = useQuery<string[]>({
      queryKey: ['/api/schedule/availability', selectedDate, selectedService, 'edit', currentAppointmentId],
      queryFn: async () => {
        if (!selectedDate) return [];
        const params = new URLSearchParams();
        if (selectedService) {
          params.append('serviceType', selectedService);
        }
        params.append('editingAppointment', currentAppointmentId);
        const response = await fetch(`/api/schedule/availability/${selectedDate}?${params}`);
        if (!response.ok) throw new Error('Failed to fetch availability');
        return response.json();
      },
      enabled: !!selectedDate
    });

    return (
      <div>
        <Label>Hora de la Cita</Label>
        <Select value={selectedTime} onValueChange={onTimeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una hora" />
          </SelectTrigger>
          <SelectContent>
            {editAvailableSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Helper function to get week dates
  const getWeekDates = (startDate: Date) => {
    const week = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const currentWeek = getWeekDates(selectedDate || new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Scheduler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Agendar Nueva Cita
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWeekView(!showWeekView)}
              >
                {showWeekView ? 'Vista Diaria' : 'Vista Semanal'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pet Selection */}
            <div className="space-y-2">
              <Label htmlFor="pet-select">Mascota *</Label>
              <Select value={selectedPet} onValueChange={setSelectedPet}>
                <SelectTrigger data-testid="pet-select">
                  <SelectValue placeholder="Selecciona una mascota" />
                </SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} - {pet.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="service-select">Tipo de Servicio *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger data-testid="service-select">
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Fecha *</Label>
              {showWeekView ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium p-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {currentWeek.map((date) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      
                      return (
                        <Button
                          key={date.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-12 p-1 text-xs ${
                            isToday ? 'ring-2 ring-blue-500' : ''
                          } ${isPast ? 'opacity-50' : ''}`}
                          onClick={() => setSelectedDate(date)}
                          disabled={isPast}
                        >
                          <div className="text-center">
                            <div className="font-medium">{date.getDate()}</div>
                            <div className="text-xs opacity-60">
                              {date.getMonth() + 1}/{date.getDate()}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setDate(newDate.getDate() - 7);
                        setSelectedDate(newDate);
                      }}
                    >
                      ← Semana Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      {currentWeek[0].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setDate(newDate.getDate() + 7);
                        setSelectedDate(newDate);
                      }}
                    >
                      Semana Siguiente →
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="appointment-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                  className="w-full"
                  data-testid="date-picker"
                />
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Hora Disponible *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(slot)}
                      data-testid={`time-slot-${slot}`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Tutor Information Section */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Información del Tutor</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTutor(!editingTutor)}
                >
                  {editingTutor ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              {editingTutor ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre completo *</Label>
                    <Input
                      value={tutorInfo.name}
                      onChange={(e) => setTutorInfo((prev: any) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del tutor"
                    />
                  </div>
                  <div>
                    <Label>Teléfono Móvil *</Label>
                    <Input
                      value={tutorInfo.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneInput(e.target.value);
                        setTutorInfo((prev: any) => ({ ...prev, phone: formatted }));
                      }}
                      placeholder="+56 9 1234 5678"
                      className={!isValidPhoneNumber(tutorInfo.phone) && tutorInfo.phone.length > 4 ? 'border-red-300' : ''}
                    />
                    {tutorInfo.phone.length > 4 && !isValidPhoneNumber(tutorInfo.phone) && (
                      <p className="text-xs text-red-500 mt-1">
                        {getPhoneValidationMessage(tutorInfo.phone)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Incluir código de país para notificaciones WhatsApp
                    </p>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={tutorInfo.email}
                      onChange={(e) => setTutorInfo((prev: any) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Región *</Label>
                    <Select 
                      value={tutorInfo.region} 
                      onValueChange={(value) => {
                        setTutorInfo(prev => ({ ...prev, region: value, comuna: '' }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona región" />
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
                    <Label>Comuna *</Label>
                    <Select 
                      value={tutorInfo.comuna} 
                      onValueChange={(value) => setTutorInfo(prev => ({ ...prev, comuna: value }))}
                      disabled={!tutorInfo.region}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona comuna" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorInfo.region && getCommunesByRegion(tutorInfo.region).map((comuna) => (
                          <SelectItem key={comuna} value={comuna}>
                            {comuna}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dirección *</Label>
                    <Input
                      value={tutorInfo.address}
                      onChange={(e) => setTutorInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle principal"
                    />
                  </div>
                  <div>
                    <Label>Número de Casa *</Label>
                    <Input
                      value={tutorInfo.houseNumber}
                      onChange={(e) => setTutorInfo(prev => ({ ...prev, houseNumber: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label>Número de Departamento</Label>
                    <Input
                      value={tutorInfo.apartmentNumber}
                      onChange={(e) => setTutorInfo(prev => ({ ...prev, apartmentNumber: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {tutorInfo.name || 'No especificado'}</p>
                  <p><strong>Teléfono:</strong> {tutorInfo.phone || 'No especificado'}</p>
                  <p><strong>Email:</strong> {tutorInfo.email || 'No especificado'}</p>
                  <p><strong>Región:</strong> {tutorInfo.region || 'No especificada'}</p>
                  <p><strong>Comuna:</strong> {tutorInfo.comuna || 'No especificada'}</p>
                  <p><strong>Dirección:</strong> {tutorInfo.address && tutorInfo.houseNumber ? 
                    `${tutorInfo.address} ${tutorInfo.houseNumber}${tutorInfo.apartmentNumber ? ', Depto ' + tutorInfo.apartmentNumber : ''}` : 
                    'No especificada'}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre la cita"
              />
            </div>

            {/* Consentimiento para comunicaciones - Movido fuera de datos del tutor */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Consentimiento para Comunicaciones *</h4>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tutorInfo.consentEmail}
                    onChange={(e) => setTutorInfo(prev => ({ ...prev, consentEmail: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-mint border-gray-300 rounded focus:ring-mint"
                    data-testid="checkbox-consent-email-appointment"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Acepto recibir confirmaciones, recordatorios y notificaciones relacionadas con la salud de mi mascota a través de correo electrónico.
                  </span>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tutorInfo.consentWhatsapp}
                    onChange={(e) => setTutorInfo(prev => ({ ...prev, consentWhatsapp: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-mint border-gray-300 rounded focus:ring-mint"
                    data-testid="checkbox-consent-whatsapp-appointment"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Acepto recibir confirmaciones, recordatorios y notificaciones relacionadas con la salud de mi mascota a través de WhatsApp.
                  </span>
                </label>
                
                <p className="text-xs text-gray-600 mt-2">
                  Puedes retirar tu consentimiento en cualquier momento respondiendo "BAJA" por WhatsApp o contactándonos directamente.
                </p>
              </div>
            </div>

            {/* Schedule Button */}
            <Button 
              onClick={handleScheduleAppointment}
              disabled={createAppointmentMutation.isPending || !selectedDate || !selectedTime || !selectedService || !selectedPet}
              className="w-full"
              data-testid="schedule-button"
            >
              {createAppointmentMutation.isPending ? 'Agendando...' : 'Agendar Cita'}
            </Button>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Mis Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tienes citas agendadas</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    {editingAppointment === appointment.id ? (
                      <>
                        <h4 className="font-medium text-lg mb-4">Editar Cita</h4>
                        <div className="space-y-4">
                          <div>
                            <Label>Tipo de Servicio</Label>
                            <Select 
                              value={editForm?.serviceType || ''} 
                              onValueChange={(value) => setEditForm((prev: any) => ({ ...prev, serviceType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceTypes.map((service) => (
                                  <SelectItem key={service} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Fecha de la Cita</Label>
                            <div className="space-y-3">
                              <Input
                                type="date"
                                value={editForm?.appointmentDate || ''}
                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, appointmentDate: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                              />
                              <AvailabilityCalendar 
                                selectedDate={editForm?.appointmentDate || ''}
                                onDateSelect={(date) => setEditForm((prev: any) => ({ ...prev, appointmentDate: date }))}
                                serviceType={editForm?.serviceType}
                                editingAppointmentId={appointment.id}
                              />
                            </div>
                          </div>

                          <EditableTimeSlots 
                            selectedDate={editForm?.appointmentDate}
                            selectedService={editForm?.serviceType}
                            currentAppointmentId={appointment.id}
                            selectedTime={editForm?.appointmentTime || ''}
                            onTimeChange={(value) => setEditForm((prev: any) => ({ ...prev, appointmentTime: value }))}
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(appointment.id)}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              {updateAppointmentMutation.isPending ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAppointment(null);
                                setEditForm(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <p className="font-medium">{appointment.serviceType}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {appointment.petName}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDateToChilean(appointment.appointmentDate)}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.appointmentTime}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status === 'scheduled' ? 'Agendada' :
                               appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                            </span>
                            
                            {appointment.status === 'scheduled' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAppointment(appointment)}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  disabled={cancelAppointmentMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {appointment.status === 'cancelled' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  disabled={deleteAppointmentMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteAppointmentMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Notas:</strong> {appointment.notes}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cuestionario Pre-Visita Modal */}
      {showQuestionnaire && createdAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Cita Agendada Exitosamente! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  Tu cita ha sido confirmada. Se ha enviado un enlace del cuestionario pre-visita a tu email/WhatsApp.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-green-800">
                    <p><strong>Cita:</strong> {formatDateToChilean(createdAppointment.appointmentDate)} a las {createdAppointment.appointmentTime}</p>
                    <p><strong>Mascota:</strong> {createdAppointment.petName}</p>
                    <p><strong>Servicio:</strong> {createdAppointment.serviceType}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-3">
                    📧 <strong>Enlace enviado:</strong> Revisa tu email/WhatsApp para completar el cuestionario pre-visita Fear Free®
                  </p>
                  <p className="text-xs text-blue-600">
                    Si deseas completarlo ahora, puedes hacerlo aquí mismo o cerrar esta ventana y completarlo más tarde usando el enlace.
                  </p>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-3 justify-center mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowQuestionnaire(false);
                      setCreatedAppointment(null);
                      toast({
                        title: "Perfecto",
                        description: "Puedes completar el cuestionario más tarde usando el enlace enviado a tu email/WhatsApp.",
                      });
                    }}
                    className="px-6"
                  >
                    Completar Más Tarde
                  </Button>
                  <Button 
                    onClick={() => setShowQuestionnaire('questionnaire')}
                    className="px-6 bg-mint hover:bg-mint/90"
                  >
                    Completar Ahora
                  </Button>
                </div>
              </div>
              
              {/* Solo mostrar cuestionario si el usuario eligió completarlo ahora */}
              {showQuestionnaire === 'questionnaire' && (
                <>
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Cuestionario Pre-Visita Fear Free®</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowQuestionnaire(true)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <PreVisitQuestionnaire 
                      appointmentData={createdAppointment}
                      onComplete={handleQuestionnaireComplete}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}