import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export function GoogleCalendarIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [calendarId, setCalendarId] = useState('primary');
  const [recentSync, setRecentSync] = useState<Date | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  const { toast } = useToast();

  // Simulación de estado de conexión (en implementación real, verificar con Google API)
  useEffect(() => {
    // Check if user is already connected to Google Calendar
    checkGoogleCalendarConnection();
  }, []);

  const checkGoogleCalendarConnection = async () => {
    try {
      // En implementación real, verificar el token de Google Calendar
      const response = await fetch('/api/google-calendar/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          setRecentSync(new Date(data.lastSync));
          fetchUpcomingEvents();
        }
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
    }
  };

  const connectToGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      // Get OAuth URL from backend
      const response = await fetch('/api/google-calendar/auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar con Google Calendar. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUpcomingEvents([]);
        setRecentSync(null);
        toast({
          title: "Desconectado",
          description: "Google Calendar se desconectó correctamente."
        });
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: "Error",
        description: "No se pudo desconectar Google Calendar.",
        variant: "destructive"
      });
    }
  };

  const syncWithGoogleCalendar = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          calendarId,
          syncEnabled 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentSync(new Date());
        fetchUpcomingEvents();
        toast({
          title: "Sincronización Completa",
          description: `Se sincronizaron ${data.eventsCreated} eventos con Google Calendar.`
        });
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast({
        title: "Error de Sincronización",
        description: "No se pudo sincronizar con Google Calendar.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/google-calendar/events');
      if (response.ok) {
        const events = await response.json();
        setUpcomingEvents(events.slice(0, 5)); // Show next 5 events
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {!isConnected && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900 text-lg">Google Calendar no conectado</CardTitle>
                <CardDescription className="text-amber-700">
                  Conecta tu cuenta de Google para sincronizar automáticamente las citas veterinarias con tu calendario.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={connectToGoogleCalendar} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Conectar Google Calendar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integración con Google Calendar
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sincroniza automáticamente las citas veterinarias con tu Google Calendar
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Conexión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isConnected 
                      ? 'Las citas se sincronizan automáticamente' 
                      : 'Conecta tu cuenta para sincronizar citas'
                    }
                  </p>
                </div>
              </div>
            </div>

            {recentSync && (
              <div className="text-sm text-gray-600">
                Última sincronización: {recentSync.toLocaleString('es-CL')}
              </div>
            )}

            <div className="flex gap-2">
              {!isConnected ? (
                <Button 
                  onClick={connectToGoogleCalendar} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {isLoading ? 'Conectando...' : 'Conectar Google Calendar'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={syncWithGoogleCalendar} 
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isLoading ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </Button>
                  <Button 
                    onClick={disconnectGoogleCalendar}
                    variant="destructive"
                  >
                    Desconectar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Sincronización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-enabled">Sincronización Automática</Label>
                <Switch
                  id="sync-enabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                  disabled={!isConnected}
                />
              </div>
              <p className="text-sm text-gray-600">
                Las nuevas citas se crearán automáticamente en Google Calendar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar-id">Calendario de Destino</Label>
              <Input
                id="calendar-id"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                placeholder="primary"
                disabled={!isConnected}
              />
              <p className="text-sm text-gray-600">
                ID del calendario donde se crearán las citas (por defecto: 'primary')
              </p>
            </div>

            <div className="space-y-2">
              <Label>Información a Sincronizar</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-pet-name" defaultChecked disabled={!isConnected} />
                  <Label htmlFor="sync-pet-name" className="text-sm">Nombre de la mascota</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-service" defaultChecked disabled={!isConnected} />
                  <Label htmlFor="sync-service" className="text-sm">Tipo de servicio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-location" defaultChecked disabled={!isConnected} />
                  <Label htmlFor="sync-location" className="text-sm">Dirección del tutor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sync-notes" defaultChecked disabled={!isConnected} />
                  <Label htmlFor="sync-notes" className="text-sm">Notas de la cita</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {isConnected && upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas en Google Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start).toLocaleString('es-CL')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://calendar.google.com/calendar/event?eid=${event.id}`, '_blank')}
                  >
                    Ver en Google Calendar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Instructions */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium">Para configurar la integración con Google Calendar:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Haz clic en "Conectar Google Calendar"</li>
                <li>Autoriza el acceso a tu cuenta de Google</li>
                <li>Selecciona el calendario donde deseas sincronizar las citas</li>
                <li>Configura las opciones de sincronización según tus preferencias</li>
              </ol>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Beneficios de la Integración:</h5>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Sincronización automática de citas veterinarias</li>
                  <li>Recordatorios nativos de Google Calendar</li>
                  <li>Acceso desde cualquier dispositivo</li>
                  <li>Compartir calendario con el equipo veterinario</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}