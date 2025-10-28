import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Plus, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VeterinarySchedule, ScheduleBlock, Appointment } from '@shared/schema';

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export function ScheduleManager() {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'blocks', 'bulk'
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isActive: true
  });
  const [newBlock, setNewBlock] = useState({
    blockDate: '',
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkSchedule, setBulkSchedule] = useState({
    fromDate: '',
    toDate: '',
    selectedDays: [] as number[],
    startTime: '',
    endTime: '',
    lunchStart: '',
    lunchEnd: '',
    enableLunch: false,
    action: 'enable' // 'enable' or 'disable'
  });
  const [editingSchedule, setEditingSchedule] = useState<VeterinarySchedule | null>(null);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get veterinary schedule
  const { data: schedule = [], isLoading: scheduleLoading } = useQuery<VeterinarySchedule[]>({
    queryKey: ['/api/schedule/veterinary']
  });

  // Get appointments for today
  const { data: todayAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/today']
  });

  // Get appointments for selected date
  const { data: selectedDateAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/date', selectedDate],
    enabled: !!selectedDate
  });

  // Get availability for selected date
  const { data: availability = [] } = useQuery<string[]>({
    queryKey: ['/api/schedule/availability', selectedDate],
    enabled: !!selectedDate
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await fetch('/api/schedule/veterinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      if (!response.ok) throw new Error('Failed to create schedule');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Horario Creado", description: "El horario se creó exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/veterinary'] });
      setNewSchedule({ dayOfWeek: '', startTime: '', endTime: '', isActive: true });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el horario.", variant: "destructive" });
    }
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: async (blockData: any) => {
      const response = await fetch('/api/schedule/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      });
      if (!response.ok) throw new Error('Failed to create block');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Bloqueo Creado", description: "El bloqueo de horario se creó exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/availability'] });
      setNewBlock({ blockDate: '', startTime: '', endTime: '', reason: '' });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el bloqueo.", variant: "destructive" });
    }
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.dayOfWeek || !newSchedule.startTime || !newSchedule.endTime) {
      toast({ title: "Campos Requeridos", description: "Complete todos los campos.", variant: "destructive" });
      return;
    }

    createScheduleMutation.mutate({
      dayOfWeek: parseInt(newSchedule.dayOfWeek),
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      isActive: newSchedule.isActive
    });
  };

  const handleCreateBlock = () => {
    if (!newBlock.blockDate || !newBlock.reason) {
      toast({ title: "Campos Requeridos", description: "Complete al menos la fecha y razón.", variant: "destructive" });
      return;
    }

    createBlockMutation.mutate({
      blockDate: newBlock.blockDate,
      startTime: newBlock.startTime || null,
      endTime: newBlock.endTime || null,
      reason: newBlock.reason,
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Atención
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Schedule */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Nuevo Horario</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Día de la Semana</Label>
                  <Select value={newSchedule.dayOfWeek} onValueChange={(value) => 
                    setNewSchedule(prev => ({ ...prev, dayOfWeek: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={newSchedule.isActive}
                      onCheckedChange={(checked) => 
                        setNewSchedule(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                    <span className="text-sm">{newSchedule.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateSchedule}
                disabled={createScheduleMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createScheduleMutation.isPending ? 'Creando...' : 'Crear Horario'}
              </Button>
            </div>

            {/* Existing Schedules */}
            <div className="space-y-3">
              <h4 className="font-medium">Horarios Configurados</h4>
              {scheduleLoading ? (
                <div className="text-center py-4 text-gray-500">Cargando...</div>
              ) : schedule.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No hay horarios configurados</div>
              ) : (
                <div className="space-y-2">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bloqueos de Horario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Block */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Nuevo Bloqueo</h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={newBlock.blockDate}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, blockDate: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Hora Inicio (opcional)</Label>
                    <Input
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                      placeholder="Todo el día si vacío"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hora Fin (opcional)</Label>
                    <Input
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                      placeholder="Todo el día si vacío"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Razón del Bloqueo</Label>
                  <Input
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Vacaciones, día festivo, etc."
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateBlock}
                disabled={createBlockMutation.isPending}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createBlockMutation.isPending ? 'Creando...' : 'Crear Bloqueo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay citas para hoy</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{appointment.serviceType}</h4>
                      <span className="text-sm text-gray-600">{appointment.appointmentTime}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Mascota: {appointment.petName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tutor: {appointment.tutorName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Checker */}
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidad por Fecha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha a Consultar</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Horarios Disponibles</h4>
              {availability.length === 0 ? (
                <p className="text-gray-500">No hay horarios disponibles</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availability.map((slot) => (
                    <div key={slot} className="text-center py-2 bg-green-100 text-green-800 rounded text-sm">
                      {slot}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Citas Agendadas</h4>
              {selectedDateAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay citas agendadas</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateAppointments.map((appointment) => (
                    <div key={appointment.id} className="text-sm p-2 bg-blue-50 rounded">
                      <span className="font-medium">{appointment.appointmentTime}</span> - {appointment.petName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}