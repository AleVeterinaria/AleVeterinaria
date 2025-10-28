import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Phone, User, Mail, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@shared/schema';

interface AppointmentCalendarViewProps {
  tutorRut: string;
  pets: any[];
}

export function AppointmentCalendarView({ tutorRut, pets }: AppointmentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get appointments for tutor
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/tutor', tutorRut]
  });

  // Calculate calendar days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.appointmentDate === date);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Mascota';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Citas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('prev')}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium px-4">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('next')}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-16"></div>;
            }
            
            const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isPast = new Date(dateStr) < new Date();
            
            return (
              <Dialog key={day}>
                <DialogTrigger asChild>
                  <div
                    className={`p-2 h-16 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      isToday ? 'bg-primary/10 border-primary' : 'border-border'
                    } ${isPast ? 'opacity-60' : ''}`}
                    data-testid={`calendar-day-${day}`}
                  >
                    <div className="text-sm font-medium">{day}</div>
                    {dayAppointments.length > 0 && (
                      <Badge 
                        variant={dayAppointments.some(apt => apt.status === 'scheduled') ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </DialogTrigger>
                
                {/* Appointment Details Dialog */}
                {dayAppointments.length > 0 && (
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Citas del {day} de {monthNames[currentDate.getMonth()]}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {dayAppointments.map((appointment) => (
                        <Card key={appointment.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{appointment.appointmentTime}</span>
                              </div>
                              <Badge variant={
                                appointment.status === 'scheduled' ? 'default' :
                                appointment.status === 'completed' ? 'secondary' :
                                appointment.status === 'cancelled' ? 'destructive' : 'outline'
                              }>
                                {appointment.status === 'scheduled' ? 'Programada' :
                                 appointment.status === 'completed' ? 'Completada' :
                                 appointment.status === 'cancelled' ? 'Cancelada' : appointment.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  <strong>{getPetName(appointment.petId)}</strong> - {appointment.serviceType}
                                </span>
                              </div>
                              
                              {appointment.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{appointment.address}</span>
                                </div>
                              )}
                              
                              {appointment.tutorPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{appointment.tutorPhone}</span>
                                </div>
                              )}
                              
                              {appointment.notes && (
                                <div className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <span className="text-sm">{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                            
                            {appointment.status === 'scheduled' && (
                              <div className="pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={async () => {
                                    try {
                                      console.log('Calendar: Ver Ficha clicked for pet:', appointment.petId);
                                      
                                      // Get the pet data first - try both sources
                                      let petData = null;
                                      
                                      // Try PostgreSQL first
                                      console.log('Calendar: Trying PostgreSQL for pet:', appointment.petId);
                                      let response = await fetch(`/api/pets/${appointment.petId}`);
                                      console.log('Calendar: PostgreSQL response status:', response.status);
                                      
                                      if (response.ok) {
                                        petData = await response.json();
                                        console.log('Calendar: Got data from PostgreSQL:', petData);
                                      } else {
                                        // Try Firebase
                                        console.log('Calendar: Trying Firebase for pet:', appointment.petId);
                                        response = await fetch(`/api/patients/${appointment.petId}`);
                                        console.log('Calendar: Firebase response status:', response.status);
                                        
                                        if (response.ok) {
                                          petData = await response.json();
                                          console.log('Calendar: Got data from Firebase:', petData);
                                        }
                                      }
                                      
                                      if (petData) {
                                        // Store the pet data and navigate
                                        console.log('Calendar: Storing pet data in sessionStorage');
                                        sessionStorage.setItem('selectedPetData', JSON.stringify(petData));
                                        sessionStorage.setItem('navigateToSection', 'patient-hub');
                                        
                                        console.log('Calendar: Navigating to professional portal');
                                        window.location.href = '/professional';
                                      } else {
                                        // Fallback - try to get pet by RUT first
                                        console.log('Calendar: No pet data found, trying fallback by RUT:', appointment.tutorRut);
                                        
                                        try {
                                          const rutResponse = await fetch(`/api/pets/rut/${appointment.tutorRut}`);
                                          if (rutResponse.ok) {
                                            const tutorPets = await rutResponse.json();
                                            console.log('Calendar: Got pets by RUT:', tutorPets);
                                            
                                            const foundPet = tutorPets.find((p: any) => p.id === appointment.petId);
                                            if (foundPet) {
                                              console.log('Calendar: Found matching pet in RUT search:', foundPet);
                                              sessionStorage.setItem('selectedPetData', JSON.stringify(foundPet));
                                              sessionStorage.setItem('navigateToSection', 'patient-hub');
                                              window.location.href = '/professional';
                                              return;
                                            }
                                          }
                                        } catch (rutError) {
                                          console.error('Calendar: Error in RUT fallback:', rutError);
                                        }
                                        
                                        // Final fallback - navigate with search
                                        console.log('Calendar: All methods failed, using search fallback');
                                        const baseUrl = window.location.origin;
                                        window.location.href = `${baseUrl}/professional?search=${encodeURIComponent(appointment.tutorRut)}`;
                                      }
                                    } catch (error) {
                                      console.error('Calendar: Error loading pet data:', error);
                                      window.location.href = '/professional';
                                    }
                                  }}
                                  data-testid={`button-view-pet-${appointment.petId}`}
                                >
                                  Ver Ficha de {getPetName(appointment.petId)}
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/10 border border-primary rounded"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">1</Badge>
            <span>Citas programadas</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">1</Badge>
            <span>Citas completadas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}