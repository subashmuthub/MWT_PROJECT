// Internationalization configuration for React
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      equipment: "Equipment",
      bookings: "Bookings", 
      calendar: "Calendar",
      labs: "Labs",
      maintenance: "Maintenance",
      training: "Training",
      incidents: "Incidents",
      orders: "Orders",
      users: "Users",
      reports: "Reports",
      notifications: "Notifications",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      
      // Common
      search: "Search",
      filter: "Filter",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      submit: "Submit",
      loading: "Loading",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      
      // Authentication
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Name",
      role: "Role",
      signIn: "Sign In",
      signUp: "Sign Up",
      forgotPassword: "Forgot Password",
      
      // User Roles
      admin: "Administrator",
      teacher: "Teacher",
      student: "Student",
      labAssistant: "Lab Assistant",
      labTechnician: "Lab Technician",
      
      // Equipment
      equipmentName: "Equipment Name",
      category: "Category",
      status: "Status",
      location: "Location",
      specifications: "Specifications",
      available: "Available",
      inUse: "In Use",
      outOfOrder: "Out of Order",
      
      // Bookings
      bookingDate: "Booking Date",
      startTime: "Start Time",
      endTime: "End Time",
      purpose: "Purpose",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      
      // Labs
      labName: "Lab Name",
      labType: "Lab Type",
      capacity: "Capacity",
      description: "Description",
      computerLab: "Computer Lab",
      chemistryLab: "Chemistry Lab",
      physicsLab: "Physics Lab",
      biologyLab: "Biology Lab",
      workshop: "Workshop",
      researchLab: "Research Lab",
      
      // Time and Date
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      thisWeek: "This Week",
      thisMonth: "This Month",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      
      // Messages
      welcomeMessage: "Welcome to Lab Management System",
      noDataFound: "No data found",
      operationSuccessful: "Operation completed successfully",
      operationFailed: "Operation failed",
      accessDenied: "Access denied",
      invalidCredentials: "Invalid credentials",
      
      // Dashboard
      totalEquipment: "Total Equipment",
      totalBookings: "Total Bookings", 
      activeBookings: "Active Bookings",
      totalUsers: "Total Users",
      systemHealth: "System Health",
      recentActivity: "Recent Activity",
      upcomingBookings: "Upcoming Bookings",
      
      // Recently Accessed
      recentlyAccessed: "Recently Accessed",
      frequentlyUsed: "Frequently Used",
      clearHistory: "Clear History",
      
      // Chatbot
      chatbotGreeting: "Hello! I'm your lab assistant. How can I help you today?",
      askQuestion: "Ask a question...",
      send: "Send",
      
      // Settings
      generalSettings: "General Settings",
      securitySettings: "Security Settings",
      notificationSettings: "Notification Settings",
      languageSettings: "Language Settings",
      selectLanguage: "Select Language"
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: "Tablero",
      equipment: "Equipo",
      bookings: "Reservas",
      calendar: "Calendario", 
      labs: "Laboratorios",
      maintenance: "Mantenimiento",
      training: "Entrenamiento",
      incidents: "Incidentes",
      orders: "Órdenes",
      users: "Usuarios",
      reports: "Informes",
      notifications: "Notificaciones",
      settings: "Configuración",
      profile: "Perfil",
      logout: "Cerrar Sesión",
      
      // Common
      search: "Buscar",
      filter: "Filtrar",
      add: "Agregar",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar",
      cancel: "Cancelar",
      submit: "Enviar",
      loading: "Cargando",
      error: "Error",
      success: "Éxito",
      warning: "Advertencia",
      info: "Información",
      
      // Authentication
      login: "Iniciar Sesión",
      register: "Registrarse",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      name: "Nombre",
      role: "Rol",
      signIn: "Ingresar",
      signUp: "Registrarse",
      forgotPassword: "Olvidé mi Contraseña",
      
      // User Roles
      admin: "Administrador",
      teacher: "Profesor",
      student: "Estudiante",
      labAssistant: "Asistente de Laboratorio",
      labTechnician: "Técnico de Laboratorio",
      
      // Equipment
      equipmentName: "Nombre del Equipo",
      category: "Categoría",
      status: "Estado",
      location: "Ubicación",
      specifications: "Especificaciones",
      available: "Disponible",
      inUse: "En Uso",
      outOfOrder: "Fuera de Servicio",
      
      // Bookings
      bookingDate: "Fecha de Reserva",
      startTime: "Hora de Inicio",
      endTime: "Hora de Fin",
      purpose: "Propósito",
      pending: "Pendiente",
      confirmed: "Confirmado",
      completed: "Completado",
      cancelled: "Cancelado",
      
      // Labs
      labName: "Nombre del Laboratorio",
      labType: "Tipo de Laboratorio",
      capacity: "Capacidad",
      description: "Descripción",
      computerLab: "Laboratorio de Computación",
      chemistryLab: "Laboratorio de Química",
      physicsLab: "Laboratorio de Física",
      biologyLab: "Laboratorio de Biología",
      workshop: "Taller",
      researchLab: "Laboratorio de Investigación",
      
      // Time and Date
      today: "Hoy",
      yesterday: "Ayer",
      tomorrow: "Mañana",
      thisWeek: "Esta Semana",
      thisMonth: "Este Mes",
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche",
      
      // Messages
      welcomeMessage: "Bienvenido al Sistema de Gestión de Laboratorio",
      noDataFound: "No se encontraron datos",
      operationSuccessful: "Operación completada exitosamente",
      operationFailed: "La operación falló",
      accessDenied: "Acceso denegado",
      invalidCredentials: "Credenciales inválidas",
      
      // Dashboard
      totalEquipment: "Equipos Totales",
      totalBookings: "Reservas Totales",
      activeBookings: "Reservas Activas",
      totalUsers: "Usuarios Totales",
      systemHealth: "Estado del Sistema",
      recentActivity: "Actividad Reciente",
      upcomingBookings: "Próximas Reservas",
      
      // Recently Accessed
      recentlyAccessed: "Accedido Recientemente",
      frequentlyUsed: "Usado Frecuentemente",
      clearHistory: "Limpiar Historial",
      
      // Chatbot
      chatbotGreeting: "¡Hola! Soy tu asistente de laboratorio. ¿Cómo puedo ayudarte hoy?",
      askQuestion: "Haz una pregunta...",
      send: "Enviar",
      
      // Settings
      generalSettings: "Configuración General",
      securitySettings: "Configuración de Seguridad",
      notificationSettings: "Configuración de Notificaciones",
      languageSettings: "Configuración de Idioma",
      selectLanguage: "Seleccionar Idioma"
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de Bord",
      equipment: "Équipement",
      bookings: "Réservations",
      calendar: "Calendrier",
      labs: "Laboratoires",
      maintenance: "Maintenance",
      training: "Formation",
      incidents: "Incidents",
      orders: "Commandes",
      users: "Utilisateurs",
      reports: "Rapports",
      notifications: "Notifications",
      settings: "Paramètres",
      profile: "Profil",
      logout: "Déconnexion",
      
      // Common
      search: "Rechercher",
      filter: "Filtrer",
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      save: "Enregistrer",
      cancel: "Annuler",
      submit: "Soumettre",
      loading: "Chargement",
      error: "Erreur",
      success: "Succès",
      warning: "Avertissement",
      info: "Information",
      
      // Authentication
      login: "Se Connecter",
      register: "S'inscrire",
      email: "E-mail",
      password: "Mot de Passe",
      confirmPassword: "Confirmer le Mot de Passe",
      name: "Nom",
      role: "Rôle",
      signIn: "Se Connecter",
      signUp: "S'inscrire",
      forgotPassword: "Mot de Passe Oublié",
      
      // User Roles
      admin: "Administrateur",
      teacher: "Professeur",
      student: "Étudiant",
      labAssistant: "Assistant de Laboratoire",
      labTechnician: "Technicien de Laboratoire",
      
      // Equipment
      equipmentName: "Nom de l'Équipement",
      category: "Catégorie",
      status: "Statut",
      location: "Emplacement",
      specifications: "Spécifications",
      available: "Disponible",
      inUse: "En Cours d'Utilisation",
      outOfOrder: "Hors Service",
      
      // Recently Accessed
      recentlyAccessed: "Récemment Consulté",
      frequentlyUsed: "Fréquemment Utilisé",
      clearHistory: "Effacer l'Historique",
      
      // Chatbot
      chatbotGreeting: "Bonjour! Je suis votre assistant de laboratoire. Comment puis-je vous aider aujourd'hui?",
      askQuestion: "Posez une question...",
      send: "Envoyer",
      
      // Settings
      generalSettings: "Paramètres Généraux",
      securitySettings: "Paramètres de Sécurité",
      notificationSettings: "Paramètres de Notification",
      languageSettings: "Paramètres de Langue",
      selectLanguage: "Sélectionner la Langue"
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: "डैशबोर्ड",
      equipment: "उपकरण",
      bookings: "बुकिंग",
      calendar: "कैलेंडर",
      labs: "प्रयोगशालाएं",
      maintenance: "रखरखाव",
      training: "प्रशिक्षण",
      incidents: "घटनाएं",
      orders: "आदेश",
      users: "उपयोगकर्ता",
      reports: "रिपोर्ट",
      notifications: "सूचनाएं",
      settings: "सेटिंग्स",
      profile: "प्रोफ़ाइल",
      logout: "लॉग आउट",
      
      // Common
      search: "खोजें",
      filter: "फ़िल्टर",
      add: "जोड़ें",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "सहेजें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      loading: "लोड हो रहा है",
      error: "त्रुटि",
      success: "सफलता",
      warning: "चेतावनी",
      info: "जानकारी",
      
      // Authentication
      login: "लॉग इन",
      register: "रजिस्टर",
      email: "ईमेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      name: "नाम",
      role: "भूमिका",
      signIn: "साइन इन",
      signUp: "साइन अप",
      forgotPassword: "पासवर्ड भूल गए",
      
      // Recently Accessed
      recentlyAccessed: "हाल ही में एक्सेस किया गया",
      frequentlyUsed: "अक्सर उपयोग किया जाने वाला",
      clearHistory: "इतिहास साफ़ करें",
      
      // Chatbot
      chatbotGreeting: "नमस्ते! मैं आपका लैब सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
      askQuestion: "एक प्रश्न पूछें...",
      send: "भेजें",
      
      // Settings
      generalSettings: "सामान्य सेटिंग्स",
      securitySettings: "सुरक्षा सेटिंग्स", 
      notificationSettings: "सूचना सेटिंग्स",
      languageSettings: "भाषा सेटिंग्स",
      selectLanguage: "भाषा चुनें"
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback language
    debug: false, // Set to true for development
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      // Options for language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;