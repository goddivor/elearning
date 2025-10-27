
export interface ImportedUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  isValid: boolean;
  errors: string[];
}

export interface ImportResult {
  users: ImportedUser[];
  validCount: number;
  invalidCount: number;
}

// Header mapping for flexible CSV parsing
const HEADER_MAPPING: { [key: string]: string } = {
  // French headers
  'prénom': 'firstName',
  'nom': 'lastName',
  'nom de famille': 'lastName',
  'email': 'email',
  'adresse email': 'email',
  'e-mail': 'email',
  'rôle': 'role',
  'role': 'role',
  'fonction': 'role',
  
  // English headers
  'firstname': 'firstName',
  'first_name': 'firstName',
  'first name': 'firstName',
  'lastname': 'lastName',
  'last_name': 'lastName',
  'last name': 'lastName',
  'surname': 'lastName',
  'mail': 'email',
  
  // Alternative formats
  'prenom': 'firstName',
};

const VALID_ROLES = ['student', 'instructor', 'admin'];
const ROLE_MAPPING: { [key: string]: string } = {
  'étudiant': 'student',
  'student': 'student',
  'élève': 'student',
  'apprenant': 'student',
  
  'instructeur': 'instructor',
  'instructor': 'instructor',
  'enseignant': 'instructor',
  'professeur': 'instructor',
  'teacher': 'instructor',
  
  'administrateur': 'admin',
  'admin': 'admin',
  'administrator': 'admin',
};

export const parseCSV = (csvText: string): ImportResult => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
  }
  
  // Parse headers
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/"/g, '').toLowerCase()
  );
  
  // Map headers to our field names
  const fieldMapping: { [key: string]: number } = {};
  headers.forEach((header, index) => {
    const mappedField = HEADER_MAPPING[header] || header;
    fieldMapping[mappedField] = index;
  });
  
  // Validate required headers
  const requiredFields = ['firstName', 'lastName', 'email'];
  const missingFields = requiredFields.filter(field => fieldMapping[field] === undefined);
  
  if (missingFields.length > 0) {
    throw new Error(`Colonnes manquantes: ${missingFields.join(', ')}. Colonnes requises: prénom, nom, email`);
  }
  
  const users: ImportedUser[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length === 0) continue; // Skip empty lines
    
    const user: ImportedUser = {
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      isValid: true,
      errors: []
    };
    
    // Extract data
    user.firstName = (values[fieldMapping['firstName']] || '').trim();
    user.lastName = (values[fieldMapping['lastName']] || '').trim();
    user.email = (values[fieldMapping['email']] || '').trim();
    
    // Handle role
    const roleValue = (values[fieldMapping['role']] || 'student').trim().toLowerCase();
    user.role = (ROLE_MAPPING[roleValue] || 'student') as 'student' | 'instructor' | 'admin';
    
    // Validate
    validateUser(user);
    
    users.push(user);
  }
  
  return {
    users,
    validCount: users.filter(u => u.isValid).length,
    invalidCount: users.filter(u => !u.isValid).length
  };
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

const validateUser = (user: ImportedUser): void => {
  user.errors = [];
  
  // Validate required fields
  if (!user.firstName) {
    user.errors.push('Prénom requis');
  }
  
  if (!user.lastName) {
    user.errors.push('Nom requis');
  }
  
  if (!user.email) {
    user.errors.push('Email requis');
  } else if (!isValidEmail(user.email)) {
    user.errors.push('Format email invalide');
  }
  
  // Validate role
  if (!VALID_ROLES.includes(user.role)) {
    user.errors.push('Rôle invalide (student, instructor, ou admin attendu)');
  }
  
  user.isValid = user.errors.length === 0;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateCSVTemplate = (): void => {
  const template = [
    'firstName,lastName,email,role',
    'John,Doe,john.doe@example.com,instructor',
    'Jane,Smith,jane.smith@example.com,student',
    'Bob,Johnson,bob.johnson@example.com,admin'
  ].join('\n');
  
  const blob = new Blob(['\uFEFF' + template], { 
    type: 'text/csv;charset=utf-8;' 
  });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_utilisateurs.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};