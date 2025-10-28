import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Bell, Settings, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email';
  trigger: 'appointment_created' | 'appointment_reminder' | 'appointment_confirmed' | 'vaccination_reminder';
  template: string;
  isActive: boolean;
}

export function NotificationSettings() {
  const [activeTab, setActiveTab] = useState('email');
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Ale Veterinaria',
    smtpSecure: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load email settings on component mount
  const { data: emailSettingsData } = useQuery({
    queryKey: ['notificationSettings', 'email'],
    queryFn: async () => {
      const response = await fetch('/api/settings/notifications/email');
      if (response.ok) {
        return response.json();
      }
      return null;
    }
  });


  // Update state when data is loaded
  useEffect(() => {
    if (emailSettingsData) {
      setEmailSettings({
        smtpHost: emailSettingsData.smtpHost || '',
        smtpPort: emailSettingsData.smtpPort || 587,
        smtpUser: emailSettingsData.smtpUser || '',
        smtpPassword: emailSettingsData.smtpPassword || '',
        fromEmail: emailSettingsData.fromEmail || '',
        fromName: emailSettingsData.fromName || 'Ale Veterinaria',
        smtpSecure: emailSettingsData.smtpSecure !== false
      });
    }
  }, [emailSettingsData]);


  // Mutation to save email settings
  const saveEmailSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, type: 'email' })
      });
      if (!response.ok) throw new Error('Failed to save email settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', 'email'] });
      toast({
        title: "Configuración de Email Guardada",
        description: "La configuración SMTP se ha guardado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de email.",
        variant: "destructive"
      });
    }
  });


  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '3',
      name: 'Confirmación por Email',
      type: 'email',
      trigger: 'appointment_created',
      template: 'Tu cita veterinaria ha sido confirmada para {{petName}} el {{appointmentDate}} a las {{appointmentTime}}.',
      isActive: true
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email' as 'email',
    trigger: 'appointment_created' as NotificationTemplate['trigger'],
    template: '',
    isActive: true
  });


  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      setEditingTemplate(null);
      toast({ title: "Plantilla actualizada", description: "La plantilla se guardó correctamente." });
    } else {
      // Create new template
      if (!newTemplate.name || !newTemplate.template) {
        toast({ title: "Error", description: "Complete todos los campos requeridos.", variant: "destructive" });
        return;
      }
      
      const template: NotificationTemplate = {
        id: Date.now().toString(),
        ...newTemplate
      };
      
      setTemplates(prev => [...prev, template]);
      setNewTemplate({
        name: '',
        type: 'email',
        trigger: 'appointment_created',
        template: '',
        isActive: true
      });
      toast({ title: "Plantilla creada", description: "La plantilla se creó correctamente." });
    }
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({ title: "Plantilla eliminada", description: "La plantilla se eliminó correctamente." });
  };

  const availableVariables = [
    '{{tutorName}}', '{{petName}}', '{{appointmentDate}}', 
    '{{appointmentTime}}', '{{serviceType}}', '{{address}}', 
    '{{vetName}}', '{{clinicPhone}}'
  ];

  const triggerLabels = {
    'appointment_created': 'Cita Creada',
    'appointment_reminder': 'Recordatorio de Cita',
    'appointment_confirmed': 'Cita Confirmada',
    'vaccination_reminder': 'Recordatorio de Vacuna'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configura plantillas de mensajes de email que se enviarán automáticamente
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('email')}
        >
          <Mail className="h-4 w-4 inline mr-2" />
          Email
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Configuración
        </button>
      </div>

      {/* Content */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Plantillas de Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates
                  .filter(t => t.type === 'email')
                  .map(template => (
                    <div key={template.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-500">
                            {triggerLabels[template.trigger]}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => toggleTemplateStatus(template.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {template.template}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                  <Input
                    id="template-name"
                    value={editingTemplate?.name || newTemplate.name}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, name: e.target.value });
                      } else {
                        setNewTemplate({ ...newTemplate, name: e.target.value });
                      }
                    }}
                    placeholder="Ej: Confirmación de cita"
                  />
                </div>

                <div>
                  <Label htmlFor="trigger">Disparador</Label>
                  <Select
                    value={editingTemplate?.trigger || newTemplate.trigger}
                    onValueChange={(value) => {
                      const trigger = value as NotificationTemplate['trigger'];
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, trigger });
                      } else {
                        setNewTemplate({ ...newTemplate, trigger });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(triggerLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-content">Contenido del Mensaje</Label>
                  <Textarea
                    id="template-content"
                    rows={4}
                    value={editingTemplate?.template || newTemplate.template}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, template: e.target.value });
                      } else {
                        setNewTemplate({ ...newTemplate, template: e.target.value });
                      }
                    }}
                    placeholder="Escribe el mensaje usando variables como {{tutorName}}, {{petName}}, etc."
                  />
                </div>

                <div>
                  <Label>Variables Disponibles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableVariables.map(variable => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentTemplate = editingTemplate?.template || newTemplate.template;
                          const newValue = currentTemplate + variable;
                          if (editingTemplate) {
                            setEditingTemplate({ ...editingTemplate, template: newValue });
                          } else {
                            setNewTemplate({ ...newTemplate, template: newValue });
                          }
                        }}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                  </Button>
                  {editingTemplate && (
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingTemplate(null)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

              {/* Email Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuración de Email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Puerto</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">Usuario</Label>
                    <Input
                      id="smtp-user"
                      type="email"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                      placeholder="tu-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Contraseña de Aplicación</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="Contraseña específica de aplicación"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-email">Email Remitente</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                      placeholder="noreply@ale-veterinaria.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-name">Nombre Remitente</Label>
                    <Input
                      id="from-name"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      placeholder="Ale Veterinaria"
                    />
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Configuración Gmail:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    <li>Habilita la autenticación de 2 factores en tu cuenta Google</li>
                    <li>Genera una "Contraseña de aplicación" específica desde tu configuración de Google</li>
                    <li>Usa esta contraseña de aplicación, no tu contraseña normal de Gmail</li>
                    <li>Servidor SMTP: smtp.gmail.com, Puerto: 587</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (!emailSettings.smtpHost || !emailSettings.smtpUser || !emailSettings.smtpPassword || !emailSettings.fromEmail) {
                        toast({
                          title: "Campos Incompletos",
                          description: "Complete todos los campos obligatorios de configuración SMTP.",
                          variant: "destructive"
                        });
                        return;
                      }
                      saveEmailSettingsMutation.mutate(emailSettings);
                    }}
                    disabled={saveEmailSettingsMutation.isPending}
                    className="flex-1"
                  >
                    {saveEmailSettingsMutation.isPending ? 'Guardando...' : 'Guardar Configuración SMTP'}
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!emailSettings.smtpHost || !emailSettings.smtpUser || !emailSettings.smtpPassword) {
                        toast({
                          title: "Campos Incompletos",
                          description: "Complete la configuración SMTP antes de probar.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      try {
                        const response = await fetch('/api/email/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(emailSettings)
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                          toast({
                            title: "Prueba Exitosa",
                            description: "La configuración SMTP funciona correctamente."
                          });
                        } else {
                          toast({
                            title: "Error de Conexión",
                            description: result.details || result.error,
                            variant: "destructive"
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "No se pudo probar la configuración SMTP",
                          variant: "destructive"
                        });
                      }
                    }}
                    variant="outline"
                  >
                    Probar
                  </Button>
                </div>
              </div>

              {/* Notification Timing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Temporización de Notificaciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminder-hours">Recordatorio de Cita (horas antes)</Label>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vaccination-reminder">Recordatorio de Vacunas (días antes)</Label>
                    <Select defaultValue="7">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="14">14 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}