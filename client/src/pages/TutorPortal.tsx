import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Syringe, Bug, Award, Calendar, MapPin, Phone, User, Eye, Download, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateRUT, formatRUTInput } from '@/lib/rutValidator';
import { calculateAge, formatAge } from '@/utils/ageCalculator';
import { generateCertificatePDF, generatePrescriptionPDF, generateVaccinationDewormerCard } from '@/utils/pdfGenerator';
import { formatDateToChilean, formatDateTimeToChilean } from '@/utils/dateFormatter';
import { PetPhotoUpload } from '@/components/PetPhotoUpload';

export default function TutorPortal() {
  const [rutInput, setRutInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState<'rut' | 'name' | 'record'>('rut');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [tutorData, setTutorData] = useState<any>(null);
  const [rutValidation, setRutValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const { toast } = useToast();

  // Query para buscar mascotas - sistema híbrido PostgreSQL/Firebase
  const { data: pets = [], isLoading: petsLoading, refetch: refetchPets } = useQuery({
    queryKey: [`/api/search/pets/${searchType}/${searchType === 'rut' ? rutInput : searchInput}`],
    enabled: false, // No ejecutar automáticamente
    queryFn: async () => {
      const currentInput = searchType === 'rut' ? rutInput : searchInput;
      if (!currentInput) return [];
      
      let results = [];
      
      try {
        // Intentar PostgreSQL primero
        if (searchType === 'rut') {
          const pgResponse = await fetch(`/api/pets/rut/${currentInput.replace(/[.-]/g, '')}`);
          if (pgResponse.ok) {
            const pgResults = await pgResponse.json();
            if (pgResults.length > 0) {
              return pgResults;
            }
          }
        }
        
        // Si no hay resultados en PostgreSQL, intentar búsqueda general
        const searchResponse = await fetch(`/api/search/patients/${currentInput}`);
        if (searchResponse.ok) {
          results = await searchResponse.json();
        }
        
        // Si todavía no hay resultados, intentar Firebase directo
        if (results.length === 0) {
          let endpoint = '';
          switch (searchType) {
            case 'rut':
              endpoint = `/api/pets/firebase/tutor/${currentInput.replace(/[.-]/g, '')}`;
              break;
            case 'record':
              endpoint = `/api/pets/firebase/record/${currentInput}`;
              break;
            default:
              return results; // Ya probamos búsqueda general
          }
          
          const fbResponse = await fetch(endpoint);
          if (fbResponse.ok) {
            results = await fbResponse.json();
          }
        }
        
        return results;
      } catch (error) {
        console.error('Error searching pets:', error);
        return [];
      }
    }
  }) as { data: any[], isLoading: boolean, refetch: () => void };

  // Queries para datos de cada mascota (se ejecutan cuando hay mascotas)
  const petIds = pets.map(pet => pet.id);
  const petIdsString = petIds.join(',');
  
  const { data: allVaccinations = [] } = useQuery({
    queryKey: [`/api/vaccinations/firebase/pets/${petIdsString}`],
    enabled: petIds.length > 0,
  }) as { data: any[] };

  const { data: allDewormings = [] } = useQuery({
    queryKey: [`/api/dewormings/firebase/pets/${petIdsString}`],
    enabled: petIds.length > 0,
  }) as { data: any[] };

  const { data: allCertificates = [] } = useQuery({
    queryKey: [`/api/certificates/all/pets/${petIdsString}`],
    enabled: petIds.length > 0,
    queryFn: async () => {
      if (petIds.length === 0) return [];
      
      let allCertificates: any[] = [];
      for (const petId of petIds) {
        try {
          // Fetch certificates from both PostgreSQL and Firebase
          const [postgresResponse, firebaseResponse] = await Promise.all([
            fetch(`/api/certificates/pet/${petId}`),
            fetch(`/api/certificates/firebase/pet/${petId}`)
          ]);
          
          const certificates = [];
          
          if (postgresResponse.ok) {
            const postgresCertificates = await postgresResponse.json();
            certificates.push(...postgresCertificates.map((c: any) => ({ ...c, petId, source: 'postgres' })));
          }
          
          if (firebaseResponse.ok) {
            const firebaseCertificates = await firebaseResponse.json();
            certificates.push(...firebaseCertificates.map((c: any) => ({ ...c, petId, source: 'firebase' })));
          }
          
          allCertificates.push(...certificates);
        } catch (error) {
          console.error(`Error fetching certificates for pet ${petId}:`, error);
        }
      }
      return allCertificates;
    }
  }) as { data: any[] };

  const { data: allPrescriptions = [] } = useQuery({
    queryKey: [`/api/prescriptions/firebase/pets/${petIdsString}`],
    enabled: petIds.length > 0,
    queryFn: async () => {
      if (petIds.length === 0) return [];
      
      let allPrescriptions: any[] = [];
      for (const petId of petIds) {
        try {
          const response = await fetch(`/api/prescriptions/firebase/pet/${petId}`);
          if (response.ok) {
            const petPrescriptions = await response.json();
            allPrescriptions.push(...petPrescriptions.map((p: any) => ({ ...p, petId })));
          }
        } catch (error) {
          console.error(`Error fetching prescriptions for pet ${petId}:`, error);
        }
      }
      return allPrescriptions;
    }
  }) as { data: any[] };

  const { data: allExamDocuments = [] } = useQuery({
    queryKey: [`/api/exam-documents/pets/${petIdsString}`],
    enabled: petIds.length > 0,
    queryFn: async () => {
      if (petIds.length === 0) return [];
      
      let allExamDocs: any[] = [];
      for (const petId of petIds) {
        try {
          const response = await fetch(`/api/exam-documents/pet/${petId}`);
          if (response.ok) {
            const petExamDocs = await response.json();
            allExamDocs.push(...petExamDocs.map((doc: any) => ({ ...doc, petId })));
          }
        } catch (error) {
          console.error(`Error fetching exam documents for pet ${petId}:`, error);
        }
      }
      return allExamDocs;
    }
  }) as { data: any[] };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUTInput(e.target.value);
    setRutInput(formatted);
    
    if (formatted.length >= 9) {
      const validation = validateRUT(formatted);
      setRutValidation(validation);
    } else {
      setRutValidation({ isValid: true, message: '' });
    }
  };

  // Función para generar carnet de vacunas y desparasitación
  const handleDownloadVaccinationCard = async (petId: string) => {
    try {
      const pet = pets.find(p => p.id === petId);
      if (!pet) return;

      const petVaccinations = allVaccinations.filter(v => v.petId === petId);
      const petDewormings = allDewormings.filter(d => d.petId === petId);

      await generateVaccinationDewormerCard(pet, petVaccinations, petDewormings);
      
      toast({
        title: "Carnet descargado",
        description: "El carnet de vacunas y desparasitación se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error generating vaccination card:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el carnet de vacunas y desparasitación",
        variant: "destructive"
      });
    }
  };

  // Función para descargar certificado
  const handleDownloadCertificate = async (certificate: any) => {
    try {
      const pet = pets.find(p => p.id === certificate.petId);
      if (!pet) return;

      const veterinarian = {
        name: 'Alejandra Benavides',
        title: 'Médica Veterinaria',
        credentials: 'COLMEVET N° 3456',
        phone: '+56 9 1234 5678',
        email: 'contacto@aleveterinaria.cl'
      };

      await generateCertificatePDF(pet, certificate, veterinarian);
      
      toast({
        title: "Certificado descargado",
        description: "El certificado se ha descargado correctamente"
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error", 
        description: "No se pudo generar el certificado",
        variant: "destructive"
      });
    }
  };

  // Función para ver receta
  const handleViewPrescription = async (prescription: any) => {
    try {
      const pet = pets.find(p => p.id === prescription.petId);
      if (!pet) return;

      const veterinarian = {
        name: 'Alejandra Benavides',
        title: 'Médica Veterinaria',
        credentials: 'COLMEVET N° 3456',
        phone: '+56 9 1234 5678',
        email: 'contacto@aleveterinaria.cl'
      };

      await generatePrescriptionPDF(pet, prescription, veterinarian);
      
      toast({
        title: "Receta generada",
        description: "La receta se ha abierto correctamente"
      });
    } catch (error) {
      console.error('Error generating prescription:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la receta",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    const currentInput = searchType === 'rut' ? rutInput : searchInput;
    
    if (!currentInput) {
      toast({
        title: "Error",
        description: `Ingresa ${searchType === 'rut' ? 'tu RUT' : searchType === 'name' ? 'el nombre de la mascota' : 'el número de ficha'} para buscar`,
        variant: "destructive"
      });
      return;
    }

    if (searchType === 'rut') {
      const validation = validateRUT(currentInput);
      if (!validation.isValid) {
        toast({
          title: "RUT inválido",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setSearchPerformed(true);
      
      // Actualizar el searchInput según el tipo de búsqueda ANTES del refetch
      if (searchType === 'rut') {
        setSearchInput(rutInput);
      }
      
      // Esperar un momento para que el estado se actualice
      setTimeout(async () => {
        await refetchPets();
        
        // Usar los pets del estado actual después del refetch
        if (pets.length === 0) {
          toast({
            title: "Sin registros",
            description: `No se encontraron mascotas con ${searchType === 'rut' ? 'este RUT' : searchType === 'name' ? 'este nombre' : 'este número de ficha'}`,
            variant: "destructive"
          });
        } else {
          // Extraer datos del tutor desde la primera mascota
          setTutorData(pets[0] || {});
          toast({
            title: "Búsqueda exitosa",
            description: `Se encontraron ${pets.length} mascota(s)`,
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar la búsqueda. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const renderDigitalCard = () => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Award className="h-5 w-5" />
          Carnet digital veterinario
        </CardTitle>
        <CardDescription>Certificación oficial de vacunas y desparasitaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {pets.map((pet: any) => {
            const petVaccinations = allVaccinations.filter(v => v.petId === pet.id);
            const petDewormings = allDewormings.filter(d => d.petId === pet.id);
            
            return (
              <div key={pet.id} className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <PetPhotoUpload
                    petId={pet.id}
                    petName={pet.name}
                    currentPhoto={pet.photo}
                    onPhotoUpdate={() => {
                      // Refresh pets data when photo is updated
                      refetchPets();
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{pet.name}</h3>
                    <p className="text-sm text-gray-600">{pet.species} - {pet.breed}</p>
                    <p className="text-xs text-gray-500">
                      {pet.birthDate && formatAge(calculateAge(pet.birthDate))}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Vacunas al día</h4>
                    <div className="flex flex-wrap gap-1">
                      {petVaccinations.length > 0 ? petVaccinations.slice(0, 3).map((vac: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {vac.vaccineName}
                        </Badge>
                      )) : (
                        <span className="text-xs text-gray-400">Sin registros</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Desparasitaciones</h4>
                    <div className="flex flex-wrap gap-1">
                      {petDewormings.length > 0 ? petDewormings.slice(0, 2).map((dew: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {dew.product}
                        </Badge>
                      )) : (
                        <span className="text-xs text-gray-400">Sin registros</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleDownloadVaccinationCard(pet.id)}
                  data-testid={`download-card-${pet.id}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar carnet
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (!searchPerformed) {
    return (
      <div className="min-h-screen bg-[#F4EDE6]">
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
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-home">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Portal del tutor</CardTitle>
            <CardDescription>
              Accede con tu RUT para ver los registros de tus mascotas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de tipo de búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de búsqueda</label>
              <Select value={searchType} onValueChange={(value: 'rut' | 'name' | 'record') => setSearchType(value)}>
                <SelectTrigger data-testid="select-search-type">
                  <SelectValue placeholder="Seleccionar método de búsqueda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rut">Por RUT del Tutor</SelectItem>
                  <SelectItem value="name">Por Nombre de Mascota</SelectItem>
                  <SelectItem value="record">Por Número de Ficha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo de búsqueda dinámico */}
            <div className="space-y-2">
              {searchType === 'rut' ? (
                <>
                  <label className="text-sm font-medium">RUT del Tutor</label>
                  <Input
                    type="text"
                    placeholder="12.345.678-9"
                    value={rutInput}
                    onChange={handleRutChange}
                    className={`${!rutValidation.isValid ? 'border-red-500' : ''}`}
                    data-testid="input-rut-tutor"
                  />
                  {!rutValidation.isValid && (
                    <p className="text-sm text-red-500">{rutValidation.message}</p>
                  )}
                </>
              ) : searchType === 'name' ? (
                <>
                  <label className="text-sm font-medium">Nombre de la Mascota</label>
                  <Input
                    type="text"
                    placeholder="Nombre de tu mascota"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    data-testid="input-pet-name"
                  />
                </>
              ) : (
                <>
                  <label className="text-sm font-medium">Número de Ficha</label>
                  <Input
                    type="text"
                    placeholder="Número de ficha médica"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    data-testid="input-record-number"
                  />
                </>
              )}
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={petsLoading}
              data-testid="button-search-pets"
            >
              {petsLoading ? (
                "Buscando..."
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  {searchType === 'rut' ? 'Acceder por RUT' : 
                   searchType === 'name' ? 'Buscar por Nombre' : 
                   'Buscar por Ficha'}
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              {searchType === 'rut' ? (
                <>
                  <p>Solo necesitas tu RUT para acceder.</p>
                  <p>No requieres crear una cuenta.</p>
                </>
              ) : (
                <>
                  <p>Busca las mascotas por {searchType === 'name' ? 'nombre' : 'número de ficha'}.</p>
                  <p>Accede directamente a los registros veterinarios.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EDE6]">
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
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-home">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sin registros encontrados</h3>
            <p className="text-gray-600 mb-4">
              No se encontraron mascotas con {searchType === 'rut' ? `el RUT: ${rutInput}` : 
                                           searchType === 'name' ? `el nombre: ${searchInput}` : 
                                           `el número de ficha: ${searchInput}`}
            </p>
            <Button 
              onClick={() => {
                setSearchPerformed(false);
                setRutInput('');
                setSearchInput('');
                setTutorData(null);
              }}
              variant="outline"
            >
              Intentar nuevamente
            </Button>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE6]">
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
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-home">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  setSearchPerformed(false);
                  setRutInput('');
                  setTutorData(null);
                }}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Información del usuario */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Portal del tutor</h1>
            <p className="text-gray-600">
              Bienvenido {tutorData?.name || 'Tutor'} - RUT: {rutInput}
            </p>
          </div>

        {/* Carnet Digital */}
        {renderDigitalCard()}

        {/* Tabs para cada sección */}
        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recetas
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificados
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Vacunas
            </TabsTrigger>
            <TabsTrigger value="dewormings" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Desparasitaciones
            </TabsTrigger>
            <TabsTrigger value="exam-results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exámenes
            </TabsTrigger>
          </TabsList>


          <TabsContent value="prescriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recetas Médicas
                </CardTitle>
                <CardDescription>
                  Historial de recetas emitidas para tus mascotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {allPrescriptions.map((prescription: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {pets.find(p => p.id === prescription.petId)?.name || 'Mascota'}
                          </h3>
                          <Badge variant="secondary">
                            {formatDateToChilean(prescription.date)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{prescription.diagnosis}</p>
                        <div className="text-xs text-gray-500">
                          Dr. {prescription.veterinarianName}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => handleViewPrescription(prescription)}
                          data-testid={`view-prescription-${index}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver receta
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay recetas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificados emitidos
                </CardTitle>
                <CardDescription>
                  Certificados de salud y otros documentos oficiales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allCertificates.length > 0 ? (
                  <div className="space-y-4">
                    {allCertificates.map((certificate: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {pets.find(p => p.id === certificate.petId)?.name || 'Mascota'}
                          </h3>
                          <Badge variant="secondary">
                            {formatDateToChilean(certificate.issueDate)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{certificate.type}</p>
                        <p className="text-xs text-gray-500 mb-2">{certificate.purpose}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadCertificate(certificate)}
                          data-testid={`download-certificate-${index}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay certificados emitidos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vaccinations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Registro de Vacunas
                </CardTitle>
                <CardDescription>
                  Historial completo de vacunación de tus mascotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allVaccinations.length > 0 ? (
                  <div className="space-y-6">
                    {pets.map((pet: any) => {
                      const petVaccinations = allVaccinations.filter(v => v.petId === pet.id);
                      return (
                        <div key={pet.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{pet.name}</h3>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadVaccinationCard(pet.id)}
                              data-testid={`download-vaccination-card-${pet.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar carnet
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {petVaccinations.map((vaccination: any, idx: number) => (
                              <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{vaccination.vaccineName}</span>
                                  <Badge variant="outline">
                                    {formatDateToChilean(vaccination.applicationDate)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>Laboratorio: {vaccination.laboratory}</p>
                                  <p>Lote: {vaccination.batchNumber}</p>
                                  {vaccination.nextDueDate && (
                                    <p>Próxima dosis: {formatDateToChilean(vaccination.nextDueDate)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Syringe className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay vacunas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dewormings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Registro de Desparasitaciones
                </CardTitle>
                <CardDescription>
                  Historial completo de desparasitaciones de tus mascotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allDewormings.length > 0 ? (
                  <div className="space-y-6">
                    {pets.map((pet: any) => {
                      const petDewormings = allDewormings.filter(d => d.petId === pet.id);
                      return (
                        <div key={pet.id} className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold mb-3">{pet.name}</h3>
                          <div className="space-y-3">
                            {petDewormings.map((deworming: any, idx: number) => (
                              <div key={idx} className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{deworming.product}</span>
                                  <div className="flex gap-2">
                                    <Badge variant={deworming.type === 'internal' ? 'default' : 'secondary'}>
                                      {deworming.type === 'internal' ? 'Interno' : 'Externo'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {formatDateToChilean(deworming.applicationDate)}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>Principio activo: {deworming.activeIngredient}</p>
                                  <p>Laboratorio: {deworming.laboratory}</p>
                                  <p>Dosis: {deworming.dose}</p>
                                  {deworming.nextDueDate && (
                                    <p>Próxima dosis: {formatDateToChilean(deworming.nextDueDate)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bug className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay desparasitaciones registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exam-results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resultados de Exámenes
                </CardTitle>
                <CardDescription>
                  Documentos y resultados de exámenes realizados a tus mascotas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allExamDocuments.length > 0 ? (
                  <div className="space-y-6">
                    {pets.map((pet: any) => {
                      const petExamDocs = allExamDocuments.filter(doc => doc.petId === pet.id);
                      if (petExamDocs.length === 0) return null;
                      
                      return (
                        <div key={pet.id} className="border-l-4 border-orange-500 pl-4">
                          <h3 className="font-semibold mb-3">{pet.name}</h3>
                          <div className="space-y-3">
                            {petExamDocs.map((examDoc: any, idx: number) => (
                              <div key={idx} className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <span className="font-medium">{examDoc.examType}</span>
                                    <p className="text-sm text-gray-600 mt-1">{examDoc.fileName}</p>
                                  </div>
                                  <Badge variant="outline">
                                    {formatDateToChilean(examDoc.uploadDate)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                  <p>Tamaño: {Math.round(examDoc.fileSize / 1024)} KB</p>
                                  {examDoc.notes && <p>Notas: {examDoc.notes}</p>}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => window.open(examDoc.objectPath, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver documento
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = examDoc.objectPath;
                                      link.download = examDoc.fileName;
                                      link.click();
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No hay resultados de exámenes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}