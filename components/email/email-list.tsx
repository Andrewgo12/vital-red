"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  RefreshCw, 
  Download, 
  Mail, 
  CheckSquare, 
  Square,
  Brain,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Calendar,
  Tag,
  Eye,
  Flag,
  Trash2,
  Archive,
  MoreVertical,
  ChevronDown,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { EmailCard } from './email-card';
import { EmailData, FilterOptions, useEmailManager } from '@/lib/email-manager';
import { cn } from '@/lib/utils';

interface EmailListProps {
  className?: string;
  onEmailClick?: (email: EmailData) => void;
  onEmailProcess?: (emailId: string) => void;
  onBatchProcess?: (emailIds: string[]) => void;
  onExport?: (emailIds: string[]) => void;
  showFilters?: boolean;
  showStats?: boolean;
  defaultView?: 'grid' | 'list';
  itemsPerPage?: number;
}

export function EmailList({
  className,
  onEmailClick,
  onEmailProcess,
  onBatchProcess,
  onExport,
  showFilters = true,
  showStats = true,
  defaultView = 'grid',
  itemsPerPage = 20
}: EmailListProps) {
  const {
    filteredEmails,
    selectedEmails,
    isLoading,
    error,
    currentFilters,
    stats,
    setFilters,
    clearFilters,
    selectEmail,
    selectAllEmails,
    clearSelection,
    flagEmail,
    markAsReviewed,
    processEmail,
    batchProcess,
    generateStats
  } = useEmailManager();

  // Estados locales
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [sortBy, setSortBy] = useState<'receivedAt' | 'priority' | 'confidence' | 'sender'>('receivedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados de filtros
  const [priorityFilter, setPriorityFilter] = useState<string[]>(currentFilters.priority || []);
  const [statusFilter, setStatusFilter] = useState<string[]>(currentFilters.processingStatus || []);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>(currentFilters.specialty || []);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(currentFilters.medicalCategory || []);
  const [dateFilter, setDateFilter] = useState({
    from: currentFilters.dateFrom,
    to: currentFilters.dateTo
  });
  const [attachmentFilter, setAttachmentFilter] = useState<boolean | undefined>(currentFilters.hasAttachments);

  // Emails ordenados y paginados
  const sortedEmails = useMemo(() => {
    const sorted = [...filteredEmails].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'receivedAt':
          aValue = new Date(a.receivedAt).getTime();
          bValue = new Date(b.receivedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'sender':
          aValue = a.senderEmail;
          bValue = b.senderEmail;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [filteredEmails, sortBy, sortOrder]);

  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEmails.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEmails, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedEmails.length / itemsPerPage);

  // Aplicar filtros
  const applyFilters = () => {
    const filters: FilterOptions = {
      search: searchTerm || undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      processingStatus: statusFilter.length > 0 ? statusFilter : undefined,
      specialty: specialtyFilter.length > 0 ? specialtyFilter : undefined,
      medicalCategory: categoryFilter.length > 0 ? categoryFilter : undefined,
      dateFrom: dateFilter.from,
      dateTo: dateFilter.to,
      hasAttachments: attachmentFilter,
    };
    
    setFilters(filters);
    setCurrentPage(1);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter([]);
    setStatusFilter([]);
    setSpecialtyFilter([]);
    setCategoryFilter([]);
    setDateFilter({ from: undefined, to: undefined });
    setAttachmentFilter(undefined);
    clearFilters();
    setCurrentPage(1);
  };

  // Manejar selección múltiple
  const handleSelectAll = () => {
    if (selectedEmails.length === paginatedEmails.length) {
      clearSelection();
    } else {
      selectAllEmails();
    }
  };

  const isAllSelected = selectedEmails.length === paginatedEmails.length && paginatedEmails.length > 0;
  const isPartiallySelected = selectedEmails.length > 0 && selectedEmails.length < paginatedEmails.length;

  // Acciones en lote
  const handleBatchAction = async (action: 'process' | 'flag' | 'unflag' | 'review' | 'unreview' | 'delete') => {
    if (selectedEmails.length === 0) return;

    try {
      switch (action) {
        case 'process':
          if (onBatchProcess) {
            await onBatchProcess(selectedEmails);
          } else {
            await batchProcess(selectedEmails);
          }
          break;
        case 'flag':
          selectedEmails.forEach(id => flagEmail(id, true));
          break;
        case 'unflag':
          selectedEmails.forEach(id => flagEmail(id, false));
          break;
        case 'review':
          selectedEmails.forEach(id => markAsReviewed(id, true));
          break;
        case 'unreview':
          selectedEmails.forEach(id => markAsReviewed(id, false));
          break;
      }
      clearSelection();
    } catch (error) {
      console.error('Error en acción en lote:', error);
    }
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, priorityFilter, statusFilter, specialtyFilter, categoryFilter, dateFilter, attachmentFilter]);

  React.useEffect(() => {
    generateStats();
  }, [filteredEmails]);

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)}>
        {/* Header con estadísticas */}
        {showStats && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Emails Médicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
                  <div className="text-sm text-gray-600">Procesados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                  <div className="text-sm text-gray-600">Alta Prioridad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.today}</div>
                  <div className="text-sm text-gray-600">Hoy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.processingTime.average.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Avg</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de herramientas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por asunto, remitente, paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                {/* Filtros avanzados */}
                {showFilters && (
                  <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                        {(priorityFilter.length + statusFilter.length + specialtyFilter.length + categoryFilter.length) > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {priorityFilter.length + statusFilter.length + specialtyFilter.length + categoryFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Filtros Avanzados</h4>
                          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                            Limpiar
                          </Button>
                        </div>

                        {/* Filtro de prioridad */}
                        <div>
                          <label className="text-sm font-medium">Prioridad</label>
                          <div className="flex gap-2 mt-1">
                            {['Alta', 'Media', 'Baja'].map((priority) => (
                              <Button
                                key={priority}
                                variant={priorityFilter.includes(priority) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setPriorityFilter(prev => 
                                    prev.includes(priority)
                                      ? prev.filter(p => p !== priority)
                                      : [...prev, priority]
                                  );
                                }}
                              >
                                {priority}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Filtro de estado */}
                        <div>
                          <label className="text-sm font-medium">Estado</label>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {['processed', 'processing', 'error', 'pending'].map((status) => (
                              <Button
                                key={status}
                                variant={statusFilter.includes(status) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setStatusFilter(prev => 
                                    prev.includes(status)
                                      ? prev.filter(s => s !== status)
                                      : [...prev, status]
                                  );
                                }}
                              >
                                {status}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Filtro de categoría médica */}
                        <div>
                          <label className="text-sm font-medium">Categoría</label>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {['referencia', 'contra-referencia', 'interconsulta', 'urgencia', 'laboratorio'].map((category) => (
                              <Button
                                key={category}
                                variant={categoryFilter.includes(category) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setCategoryFilter(prev => 
                                    prev.includes(category)
                                      ? prev.filter(c => c !== category)
                                      : [...prev, category]
                                  );
                                }}
                              >
                                {category}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Filtro de adjuntos */}
                        <div>
                          <label className="text-sm font-medium">Adjuntos</label>
                          <div className="flex gap-2 mt-1">
                            <Button
                              variant={attachmentFilter === true ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAttachmentFilter(attachmentFilter === true ? undefined : true)}
                            >
                              Con adjuntos
                            </Button>
                            <Button
                              variant={attachmentFilter === false ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAttachmentFilter(attachmentFilter === false ? undefined : false)}
                            >
                              Sin adjuntos
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Ordenamiento */}
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivedAt-desc">Más recientes</SelectItem>
                    <SelectItem value="receivedAt-asc">Más antiguos</SelectItem>
                    <SelectItem value="priority-desc">Prioridad alta</SelectItem>
                    <SelectItem value="confidence-desc">Mayor confianza</SelectItem>
                    <SelectItem value="sender-asc">Remitente A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* Vista */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Refrescar */}
                <Button variant="outline" size="sm" onClick={() => generateStats()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Acciones en lote */}
            {selectedEmails.length > 0 && (
              <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isPartiallySelected ? 'data-[state=checked]:bg-blue-600' : ''}
                  />
                  <span className="text-sm font-medium">
                    {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} seleccionado{selectedEmails.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('process')}
                    disabled={isLoading}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Procesar IA
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBatchAction('flag')}>
                        <Flag className="h-4 w-4 mr-2" />
                        Marcar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchAction('unflag')}>
                        <Flag className="h-4 w-4 mr-2" />
                        Desmarcar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBatchAction('review')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Marcar como revisado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchAction('unreview')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Marcar como no revisado
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {onExport && (
                        <DropdownMenuItem onClick={() => onExport(selectedEmails)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de emails */}
        <Card>
          <CardContent className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Cargando emails...</span>
                </div>
              </div>
            )}

            {!isLoading && sortedEmails.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay emails</h3>
                <p className="text-gray-600">
                  {Object.keys(currentFilters).length > 0 
                    ? 'No se encontraron emails con los filtros aplicados.'
                    : 'No hay emails para mostrar.'
                  }
                </p>
                {Object.keys(currentFilters).length > 0 && (
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}

            {!isLoading && paginatedEmails.length > 0 && (
              <div className={cn(
                'gap-6',
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
                  : 'space-y-4'
              )}>
                {paginatedEmails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    isSelected={selectedEmails.includes(email.id)}
                    isCompact={viewMode === 'list'}
                    showAIDetails={viewMode === 'grid'}
                    onClick={() => onEmailClick?.(email)}
                    onSelect={() => selectEmail(email.id)}
                    onProcess={() => {
                      if (onEmailProcess) {
                        onEmailProcess(email.id);
                      } else {
                        processEmail(email.id);
                      }
                    }}
                    onFlag={() => flagEmail(email.id, !email.flagged)}
                    onMarkReviewed={() => markAsReviewed(email.id, !email.reviewed)}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedEmails.length)} de {sortedEmails.length} emails
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default EmailList;
