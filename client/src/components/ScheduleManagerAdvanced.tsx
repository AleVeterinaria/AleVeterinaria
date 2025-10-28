import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Plus, Trash2, Edit3, Coffee, Settings, Calendar as CalendarIcon, User, Phone, MapPin, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VeterinarySchedule, ScheduleBlock, Appointment } from '@shared/schema';
import { formatDateToChilean, formatDateTimeToChilean } from '@/utils/dateFormatter';

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export function ScheduleManagerAdvanced() {
  const [activeTab, setActiveTab] = useState('calendar-overview');
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
  const [bulkSchedule, setBulkSchedule] = useState({
    fromDate: '',
    toDate: '',
    startTime: '',
    endTime: '',
    lunchStart: '',
    lunchEnd: '',
    enableLunch: false,
    action: 'enable'
  });
  const [editingSchedule, setEditingSchedule] = useState<VeterinarySchedule | null>(null);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [lunchSettings, setLunchSettings] = useState({
    enabled: false,
    startTime: '13:00',
    endTime: '14:00',
    selectedDays: [] as number[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get veterinary schedule
  const { data: schedule = [], isLoading: scheduleLoading } = useQuery<VeterinarySchedule[]>({
    queryKey: ['/api/schedule/veterinary']
  });

  // Get blocks
  const { data: blocks = [] } = useQuery<ScheduleBlock[]>({
    queryKey: ['/api/schedule/blocks']
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error eliminando cita: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita Eliminada",
        description: "La cita cancelada ha sido eliminada permanentemente del sistema.",
        variant: "default"
      });
      // Invalidate queries to refresh the calendar
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al Eliminar",
        description: error.message || "No se pudo eliminar la cita. Inténtalo nuevamente.",
        variant: "destructive"
      });
    }
  });

  // Mutations
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
      toast({ title: "Éxito", description: "Horario creado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/veterinary'] });
      setNewSchedule({ dayOfWeek: '', startTime: '', endTime: '', isActive: true });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el horario", variant: "destructive" });
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`/api/schedule/veterinary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update schedule');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Éxito", description: "Horario actualizado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/veterinary'] });
      setEditingSchedule(null);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el horario", variant: "destructive" });
    }
  });

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
      toast({ title: "Éxito", description: "Bloqueo creado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/blocks'] });
      setNewBlock({ blockDate: '', startTime: '', endTime: '', reason: '' });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el bloqueo", variant: "destructive" });
    }
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`/api/schedule/blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update block');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Éxito", description: "Bloqueo actualizado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/blocks'] });
      setEditingBlock(null);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el bloqueo", variant: "destructive" });
    }
  });

  const bulkScheduleMutation = useMutation({
    mutationFn: async (bulkData: any) => {
      const response = await fetch('/api/schedule/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });
      if (!response.ok) throw new Error('Failed to create bulk schedule');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Éxito", description: "Horarios masivos creados exitosamente" });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/veterinary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/blocks'] });
      setBulkSchedule({
        fromDate: '',
        toDate: '',
        startTime: '',
        endTime: '',
        lunchStart: '',
        lunchEnd: '',
        enableLunch: false,
        action: 'enable'
      });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear los horarios masivos", variant: "destructive" });
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

  const handleUpdateSchedule = () => {
    if (!editingSchedule) return;
    updateScheduleMutation.mutate({
      id: editingSchedule.id,
      dayOfWeek: editingSchedule.dayOfWeek,
      startTime: editingSchedule.startTime,
      endTime: editingSchedule.endTime,
      isActive: editingSchedule.isActive
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

  const handleUpdateBlock = () => {
    if (!editingBlock) return;
    updateBlockMutation.mutate({
      id: editingBlock.id,
      blockDate: editingBlock.blockDate,
      startTime: editingBlock.startTime,
      endTime: editingBlock.endTime,
      reason: editingBlock.reason,
      isActive: editingBlock.isActive
    });
  };

  const handleBulkSchedule = () => {
    if (!bulkSchedule.fromDate || !bulkSchedule.toDate) {
      toast({ title: "Campos Requeridos", description: "Complete las fechas de inicio y fin.", variant: "destructive" });
      return;
    }

    if (bulkSchedule.action === 'enable' && (!bulkSchedule.startTime || !bulkSchedule.endTime)) {
      toast({ title: "Campos Requeridos", description: "Complete horario de inicio y fin para habilitar.", variant: "destructive" });
      return;
    }

    bulkScheduleMutation.mutate(bulkSchedule);
  };


  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'calendar-overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('calendar-overview')}
        >
          <CalendarIcon className="h-4 w-4 inline mr-2" />
          Vista General
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'schedule'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Horarios Semanales
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'blocks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('blocks')}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Bloqueos Específicos
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('bulk')}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Gestión Masiva
        </button>
      </div>

      {/* Schedule Management Tab */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {editingSchedule ? 'Editar Horario' : 'Nuevo Horario Semanal'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Día de la Semana</Label>
                  <Select 
                    value={editingSchedule?.dayOfWeek.toString() || newSchedule.dayOfWeek} 
                    onValueChange={(value) => {
                      if (editingSchedule) {
                        setEditingSchedule(prev => prev ? { ...prev, dayOfWeek: parseInt(value) } : null);
                      } else {
                        setNewSchedule(prev => ({ ...prev, dayOfWeek: value }));
                      }
                    }}
                  >
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
                      checked={editingSchedule?.isActive ?? newSchedule.isActive}
                      onCheckedChange={(checked) => {
                        if (editingSchedule) {
                          setEditingSchedule(prev => prev ? { ...prev, isActive: checked } : null);
                        } else {
                          setNewSchedule(prev => ({ ...prev, isActive: checked }));
                        }
                      }}
                    />
                    <span className="text-sm">{(editingSchedule?.isActive ?? newSchedule.isActive) ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Input
                    type="time"
                    value={editingSchedule?.startTime || newSchedule.startTime}
                    onChange={(e) => {
                      if (editingSchedule) {
                        setEditingSchedule(prev => prev ? { ...prev, startTime: e.target.value } : null);
                      } else {
                        setNewSchedule(prev => ({ ...prev, startTime: e.target.value }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Input
                    type="time"
                    value={editingSchedule?.endTime || newSchedule.endTime}
                    onChange={(e) => {
                      if (editingSchedule) {
                        setEditingSchedule(prev => prev ? { ...prev, endTime: e.target.value } : null);
                      } else {
                        setNewSchedule(prev => ({ ...prev, endTime: e.target.value }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {editingSchedule ? (
                  <>
                    <Button onClick={handleUpdateSchedule} disabled={updateScheduleMutation.isPending} className="flex-1">
                      {updateScheduleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateSchedule} disabled={createScheduleMutation.isPending} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {createScheduleMutation.isPending ? 'Creando...' : 'Crear Horario'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleLoading ? (
                <p>Cargando...</p>
              ) : schedule.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay horarios configurados</p>
              ) : (
                <div className="space-y-2">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}</p>
                        <p className="text-sm text-gray-600">{item.startTime} - {item.endTime}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingSchedule(item)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blocks Management Tab */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {editingBlock ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={editingBlock?.blockDate || newBlock.blockDate}
                    onChange={(e) => {
                      if (editingBlock) {
                        setEditingBlock(prev => prev ? { ...prev, blockDate: e.target.value } : null);
                      } else {
                        setNewBlock(prev => ({ ...prev, blockDate: e.target.value }));
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Hora Inicio (Opcional)</Label>
                    <Input
                      type="time"
                      value={editingBlock?.startTime || newBlock.startTime}
                      onChange={(e) => {
                        if (editingBlock) {
                          setEditingBlock(prev => prev ? { ...prev, startTime: e.target.value } : null);
                        } else {
                          setNewBlock(prev => ({ ...prev, startTime: e.target.value }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hora Fin (Opcional)</Label>
                    <Input
                      type="time"
                      value={editingBlock?.endTime || newBlock.endTime}
                      onChange={(e) => {
                        if (editingBlock) {
                          setEditingBlock(prev => prev ? { ...prev, endTime: e.target.value } : null);
                        } else {
                          setNewBlock(prev => ({ ...prev, endTime: e.target.value }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Razón del Bloqueo</Label>
                  <Select 
                    value={editingBlock?.reason || newBlock.reason}
                    onValueChange={(value) => {
                      if (editingBlock) {
                        setEditingBlock(prev => prev ? { ...prev, reason: value } : null);
                      } else {
                        setNewBlock(prev => ({ ...prev, reason: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar razón" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Almuerzo">
                        <Coffee className="h-4 w-4 inline mr-2" />
                        Almuerzo
                      </SelectItem>
                      <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                      <SelectItem value="Enfermedad">Enfermedad</SelectItem>
                      <SelectItem value="Capacitación">Capacitación</SelectItem>
                      <SelectItem value="Personal">Motivos Personales</SelectItem>
                      <SelectItem value="Emergencia">Emergencia</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingBlock && (
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        checked={editingBlock.isActive}
                        onCheckedChange={(checked) => {
                          setEditingBlock(prev => prev ? { ...prev, isActive: checked } : null);
                        }}
                      />
                      <span className="text-sm">{editingBlock.isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {editingBlock ? (
                  <>
                    <Button onClick={handleUpdateBlock} disabled={updateBlockMutation.isPending} className="flex-1">
                      {updateBlockMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingBlock(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateBlock} disabled={createBlockMutation.isPending} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {createBlockMutation.isPending ? 'Creando...' : 'Crear Bloqueo'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bloqueos Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {blocks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay bloqueos configurados</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {blocks.map((block) => (
                    <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(block.blockDate).toLocaleDateString('es-CL')}</p>
                        {block.startTime && block.endTime && (
                          <p className="text-sm text-gray-600">{block.startTime} - {block.endTime}</p>
                        )}
                        <p className="text-sm text-gray-600">{block.reason}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          block.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {block.isActive ? 'Bloqueado' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingBlock(block)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Management Tab */}
      {activeTab === 'bulk' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gestión Masiva de Horarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={bulkSchedule.fromDate}
                  onChange={(e) => setBulkSchedule(prev => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={bulkSchedule.toDate}
                  onChange={(e) => setBulkSchedule(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
            </div>


            <div className="space-y-3">
              <Label>Acción a Realizar</Label>
              <Select value={bulkSchedule.action} onValueChange={(value) => 
                setBulkSchedule(prev => ({ ...prev, action: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enable">Habilitar Horarios</SelectItem>
                  <SelectItem value="disable">Bloquear Días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkSchedule.action === 'enable' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora Inicio</Label>
                    <Input
                      type="time"
                      value={bulkSchedule.startTime}
                      onChange={(e) => setBulkSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hora Fin</Label>
                    <Input
                      type="time"
                      value={bulkSchedule.endTime}
                      onChange={(e) => setBulkSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setBulkSchedule(prev => ({ ...prev, enableLunch: !prev.enableLunch }))}
                    className="w-full"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {bulkSchedule.enableLunch ? 'Ocultar' : 'Bloquear Horario de Almuerzo'}
                  </Button>

                  {bulkSchedule.enableLunch && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="space-y-2">
                        <Label>Inicio Almuerzo</Label>
                        <Input
                          type="time"
                          value={bulkSchedule.lunchStart}
                          onChange={(e) => setBulkSchedule(prev => ({ ...prev, lunchStart: e.target.value }))}
                          placeholder="13:00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fin Almuerzo</Label>
                        <Input
                          type="time"
                          value={bulkSchedule.lunchEnd}
                          onChange={(e) => setBulkSchedule(prev => ({ ...prev, lunchEnd: e.target.value }))}
                          placeholder="14:00"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <Button 
              onClick={handleBulkSchedule} 
              disabled={bulkScheduleMutation.isPending}
              className="w-full"
              size="lg"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {bulkScheduleMutation.isPending ? 'Procesando...' : 
                bulkSchedule.action === 'enable' ? 'Habilitar Horarios Masivos' : 'Bloquear Días Masivos'
              }
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Overview Tab */}
      {activeTab === 'calendar-overview' && (
        <CalendarOverview schedule={schedule} blocks={blocks} deleteAppointmentMutation={deleteAppointmentMutation} />
      )}
    </div>
  );
}

// Calendar Overview Component
function CalendarOverview({ 
  schedule, 
  blocks, 
  deleteAppointmentMutation 
}: { 
  schedule: VeterinarySchedule[]; 
  blocks: ScheduleBlock[];
  deleteAppointmentMutation: any;
}) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Get appointments for current month
  const { data: monthlyAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', currentDate.getFullYear(), currentDate.getMonth() + 1]
  });

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

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedule.filter(s => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const getBlocksForDate = (date: string) => {
    return blocks.filter(b => b.blockDate === date && b.isActive);
  };

  const getAppointmentsForDate = (date: string) => {
    return monthlyAppointments.filter((apt: any) => apt.appointmentDate === date);
  };

  const formatDate = (day: number) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Vista General del Calendario
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-24"></div>;
            }

            const dateStr = formatDate(day);
            const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
            const daySchedule = getScheduleForDay(dayOfWeek);
            const dayBlocks = getBlocksForDate(dateStr);
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <Dialog key={day}>
                <DialogTrigger asChild>
                  <div
                    className={`p-1 h-24 border rounded-lg overflow-hidden cursor-pointer transition-colors hover:bg-gray-50 ${
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    } ${dayAppointments.length > 0 ? 'hover:bg-blue-50' : ''}`}
                    data-testid={`calendar-day-${day}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    
                    {/* Schedule indicators */}
                    <div className="space-y-1 text-xs">
                      {daySchedule.length > 0 && (
                        <div className="bg-green-100 text-green-800 px-1 rounded text-[10px] leading-tight">
                          {daySchedule[0].startTime}-{daySchedule[0].endTime}
                        </div>
                      )}
                      
                      {dayBlocks.map((block, idx) => (
                        <div key={idx} className="bg-red-100 text-red-800 px-1 rounded text-[10px] leading-tight">
                          {block.startTime && block.endTime ? `${block.startTime}-${block.endTime}` : 'Bloqueado'}
                        </div>
                      ))}
                      
                      {dayAppointments.length > 0 && (
                        <div className="bg-blue-100 text-blue-800 px-1 rounded text-[10px] leading-tight font-medium">
                          {dayAppointments.length} cita{dayAppointments.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogTrigger>
                
                {/* Appointment Details Modal */}
                {(dayAppointments.length > 0 || daySchedule.length > 0 || dayBlocks.length > 0) && (
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Agenda del {day} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Horarios disponibles */}
                      {daySchedule.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Horarios Disponibles
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {daySchedule.map((sched, idx) => (
                              <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="font-medium text-green-800">
                                  {sched.startTime} - {sched.endTime}
                                </div>
                                <div className="text-sm text-green-600">
                                  {sched.isActive ? 'Activo' : 'Inactivo'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Bloqueos */}
                      {dayBlocks.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Bloqueos
                          </h3>
                          <div className="space-y-2">
                            {dayBlocks.map((block, idx) => (
                              <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="font-medium text-red-800">
                                  {block.startTime && block.endTime 
                                    ? `${block.startTime} - ${block.endTime}`
                                    : 'Todo el día'
                                  }
                                </div>
                                {block.reason && (
                                  <div className="text-sm text-red-600 mt-1">
                                    {block.reason}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Citas programadas */}
                      {dayAppointments.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Citas Programadas ({dayAppointments.length})
                          </h3>
                          <div className="space-y-3">
                            {dayAppointments.map((appointment: any) => (
                              <Card key={appointment.id} className="border-blue-200">
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold text-lg">{appointment.appointmentTime}</span>
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
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <div className="font-medium">{appointment.petName}</div>
                                            <div className="text-sm text-gray-600">{appointment.serviceType}</div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <div className="text-sm font-medium">{appointment.tutorName}</div>
                                            <div className="text-xs text-gray-500">Tutor</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {appointment.tutorPhone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">{appointment.tutorPhone}</span>
                                          </div>
                                        )}
                                        
                                        {appointment.address && (
                                          <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <span className="text-sm">{appointment.address}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {appointment.notes && (
                                      <div className="flex items-start gap-2 pt-2 border-t">
                                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                          <div className="text-sm font-medium">Notas:</div>
                                          <div className="text-sm text-gray-600">{appointment.notes}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {appointment.vetNotes && (
                                      <div className="flex items-start gap-2 pt-2 border-t">
                                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                          <div className="text-sm font-medium">Notas Veterinarias:</div>
                                          <div className="text-sm text-gray-600">{appointment.vetNotes}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Action buttons */}
                                    <div className="flex gap-2 pt-3 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // Navigate to professional portal with pet details
                                          window.dispatchEvent(new CustomEvent('navigate-to-pet-record', { 
                                            detail: { 
                                              petId: appointment.petId,
                                              tutorRut: appointment.tutorRut,
                                              appointmentId: appointment.id 
                                            } 
                                          }));
                                        }}
                                        className="flex items-center gap-2"
                                        data-testid={`button-open-pet-record-${appointment.petId}`}
                                      >
                                        <User className="h-4 w-4" />
                                        Ver Ficha de {appointment.petName}
                                      </Button>
                                      
                                      {appointment.status === 'scheduled' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Open appointment details for editing
                                            window.dispatchEvent(new CustomEvent('edit-appointment', { 
                                              detail: { 
                                                appointmentId: appointment.id,
                                                appointmentData: {
                                                  petId: appointment.petId,
                                                  petName: appointment.petName,
                                                  species: appointment.species,
                                                  tutorName: appointment.tutorName,
                                                  tutorRut: appointment.tutorRut,
                                                  tutorPhone: appointment.tutorPhone,
                                                  tutorEmail: appointment.tutorEmail,
                                                  serviceType: appointment.serviceType,
                                                  appointmentDate: appointment.appointmentDate,
                                                  appointmentTime: appointment.appointmentTime,
                                                  notes: appointment.notes,
                                                  address: appointment.address
                                                }
                                              } 
                                            }));
                                          }}
                                          className="flex items-center gap-2"
                                          data-testid={`button-edit-appointment-${appointment.id}`}
                                        >
                                          <Edit3 className="h-4 w-4" />
                                          Editar Cita
                                        </Button>
                                      )}
                                      
                                      {appointment.status === 'cancelled' && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => {
                                            console.log('ScheduleManager: Delete button clicked, mutation exists:', !!deleteAppointmentMutation);
                                            if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente esta cita cancelada?\n\nCita: ${appointment.petName} - ${formatDateTimeToChilean(appointment.appointmentDate)}\n\nEsta acción no se puede deshacer.`)) {
                                              try {
                                                deleteAppointmentMutation.mutate(appointment.id);
                                              } catch (error) {
                                                console.error('Error calling deleteAppointmentMutation:', error);
                                                toast({
                                                  title: "Error",
                                                  description: "Error interno al eliminar la cita",
                                                  variant: "destructive"
                                                });
                                              }
                                            }
                                          }}
                                          disabled={deleteAppointmentMutation?.isPending}
                                          className="flex items-center gap-2"
                                          data-testid={`button-delete-appointment-${appointment.id}`}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          {deleteAppointmentMutation?.isPending ? 'Eliminando...' : 'Eliminar Cita'}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Empty state */}
                      {dayAppointments.length === 0 && daySchedule.length === 0 && dayBlocks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="font-medium mb-2">Sin eventos programados</h3>
                          <p className="text-sm">No hay horarios, bloqueos o citas para este día.</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Horarios disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>Bloqueos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span>Citas agendadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Día actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}