import type { User } from '@/services/userService';

export interface ExportOptions {
  includePersonalInfo: boolean;
  includeContactInfo: boolean;
  includeRoleSpecific: boolean;
  includeTimestamps: boolean;
  selectedRoles: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export const exportUsersToCSV = (users: User[], options: ExportOptions) => {
  // Filter users based on selected criteria
  let filteredUsers = users;

  // Filter by roles
  if (options.selectedRoles.length > 0 && !options.selectedRoles.includes('all')) {
    filteredUsers = filteredUsers.filter(user => 
      options.selectedRoles.includes(user.role)
    );
  }

  // Filter by date range
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);
    filteredUsers = filteredUsers.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate >= startDate && createdDate <= endDate;
    });
  }

  // Generate CSV headers
  const headers: string[] = [];
  
  if (options.includePersonalInfo) {
    headers.push('Prénom', 'Nom', 'Email');
  }
  
  if (options.includeContactInfo) {
    headers.push('Téléphone', 'Avatar');
  }
  
  if (options.includeRoleSpecific) {
    headers.push('Rôle', 'Statut');
  }
  
  if (options.includeTimestamps) {
    headers.push('Date de création', 'Dernière modification');
  }

  // Generate CSV content
  const csvContent = [
    headers.join(','),
    ...filteredUsers.map(user => {
      const row: string[] = [];
      
      if (options.includePersonalInfo) {
        row.push(
          escapeCsvValue(user.firstName),
          escapeCsvValue(user.lastName),
          escapeCsvValue(user.email)
        );
      }
      
      if (options.includeContactInfo) {
        row.push(
          escapeCsvValue(''), // Téléphone (pas disponible dans le type actuel)
          escapeCsvValue('') // Avatar (pas disponible dans le type actuel)
        );
      }
      
      if (options.includeRoleSpecific) {
        row.push(
          escapeCsvValue(getRoleLabel(user.role)),
          escapeCsvValue(user.isActive ? 'Actif' : 'Inactif')
        );
      }
      
      if (options.includeTimestamps) {
        row.push(
          escapeCsvValue(formatDateForCSV(user.createdAt)),
          escapeCsvValue(formatDateForCSV(user.updatedAt))
        );
      }
      
      return row.join(',');
    })
  ].join('\n');

  // Download CSV file
  const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
  
  return filteredUsers.length;
};

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'admin': return 'Administrateur';
    case 'instructor': return 'Instructeur';
    case 'student': return 'Étudiant';
    default: return role;
  }
};

const formatDateForCSV = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};