"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface MedicalCase {
  id: string
  patient: {
    name: string
    age: number
    gender: string
    id: string
  }
  diagnosis: string
  priority: 'Alta' | 'Media' | 'Baja'
  status: 'Pendiente' | 'En Revisión' | 'Aceptado' | 'Rechazado' | 'Completado'
  specialty: string
  receivedAt: string
  timeElapsed: string
  urgency: string
  referringHospital: string
  documents: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  evaluation?: {
    decision: 'accept' | 'reject'
    priority: string
    observations: string
    evaluatedBy: string
    evaluatedAt: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'medico'
  specialty?: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
  performance?: {
    casesEvaluated: number
    averageResponseTime: string
    acceptanceRate: number
  }
}

interface DataStoreContextType {
  // Cases
  cases: MedicalCase[]
  updateCaseStatus: (caseId: string, status: MedicalCase['status']) => void
  evaluateCase: (caseId: string, evaluation: MedicalCase['evaluation']) => void
  
  // Users
  users: User[]
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  deleteUser: (userId: string) => void
  
  // Notifications
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    timestamp: string
    read: boolean
  }>
  markNotificationAsRead: (notificationId: string) => void
  addNotification: (notification: Omit<DataStoreContextType['notifications'][0], 'id' | 'timestamp' | 'read'>) => void
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  // Initialize with mock data
  const [cases, setCases] = useState<MedicalCase[]>([
    {
      id: "REF-2024-001",
      patient: {
        name: "María González",
        age: 45,
        gender: "Femenino",
        id: "12345678"
      },
      diagnosis: "Infarto agudo de miocardio",
      priority: "Alta",
      status: "Pendiente",
      specialty: "Cardiología",
      receivedAt: "2024-01-15 14:30",
      timeElapsed: "2h 15min",
      urgency: "Crítica",
      referringHospital: "Hospital Regional Norte",
      documents: [
        { id: "1", name: "Electrocardiograma.pdf", type: "ECG", url: "/docs/ecg1.pdf" },
        { id: "2", name: "Radiografía_Tórax.jpg", type: "Imagen", url: "/docs/xray1.jpg" }
      ]
    },
    {
      id: "REF-2024-002", 
      patient: {
        name: "Carlos Rodríguez",
        age: 32,
        gender: "Masculino",
        id: "87654321"
      },
      diagnosis: "Fractura de fémur",
      priority: "Media",
      status: "En Revisión",
      specialty: "Traumatología",
      receivedAt: "2024-01-15 16:45",
      timeElapsed: "45min",
      urgency: "Moderada",
      referringHospital: "Clínica San José",
      documents: [
        { id: "3", name: "Radiografía_Fémur.jpg", type: "Imagen", url: "/docs/femur1.jpg" }
      ]
    }
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Administrador Sistema",
      email: "admin@vitalred.com",
      role: "admin",
      status: "active",
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15 10:00"
    },
    {
      id: "2", 
      name: "Dr. Juan Pérez",
      email: "medico@vitalred.com",
      role: "medico",
      specialty: "Cardiología",
      status: "active",
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15 14:00",
      performance: {
        casesEvaluated: 45,
        averageResponseTime: "1h 30min",
        acceptanceRate: 78
      }
    }
  ])

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Nuevo caso urgente",
      message: "Caso REF-2024-001 requiere evaluación inmediata",
      type: "warning" as const,
      timestamp: "2024-01-15 14:30",
      read: false
    }
  ])

  // Case management functions
  const updateCaseStatus = (caseId: string, status: MedicalCase['status']) => {
    setCases(prev => prev.map(case_ => 
      case_.id === caseId ? { ...case_, status } : case_
    ))
    
    // Add notification
    addNotification({
      title: "Estado de caso actualizado",
      message: `El caso ${caseId} ha sido marcado como ${status}`,
      type: "success"
    })
  }

  const evaluateCase = (caseId: string, evaluation: MedicalCase['evaluation']) => {
    setCases(prev => prev.map(case_ => 
      case_.id === caseId ? { 
        ...case_, 
        evaluation,
        status: evaluation?.decision === 'accept' ? 'Aceptado' : 'Rechazado'
      } : case_
    ))

    addNotification({
      title: "Caso evaluado",
      message: `El caso ${caseId} ha sido ${evaluation?.decision === 'accept' ? 'aceptado' : 'rechazado'}`,
      type: "success"
    })
  }

  // User management functions
  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setUsers(prev => [...prev, newUser])
    
    addNotification({
      title: "Usuario creado",
      message: `Usuario ${newUser.name} ha sido creado exitosamente`,
      type: "success"
    })
  }

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ))
  }

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    
    addNotification({
      title: "Usuario eliminado",
      message: "El usuario ha sido eliminado del sistema",
      type: "info"
    })
  }

  // Notification functions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ))
  }

  const addNotification = (notification: Omit<DataStoreContextType['notifications'][0], 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const value = {
    cases,
    updateCaseStatus,
    evaluateCase,
    users,
    createUser,
    updateUser,
    deleteUser,
    notifications,
    markNotificationAsRead,
    addNotification
  }

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error('useDataStore must be used within a DataStoreProvider')
  }
  return context
}
