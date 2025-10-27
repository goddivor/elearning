import React, { useState, useRef, useEffect } from 'react';
import { avatarService } from '@/services/avatarService';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface UserSelectProps {
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const UserSelect: React.FC<UserSelectProps> = ({
  users,
  value,
  onChange,
  placeholder = "Sélectionnez un utilisateur",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find(user => user._id === value);

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus sur l'input quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (userId: string) => {
    onChange(userId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderUserOption = (user: User, _isSelected = false) => (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
        {user.avatar ? (
          <img
            src={avatarService.getAvatarUrl(user.avatar)}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-gray-600">
            {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {user.email}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-left
          cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        {selectedUser ? (
          renderUserOption(selectedUser, true)
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}

        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {/* Option "Aucun gestionnaire" */}
            <button
              type="button"
              onClick={handleClear}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                ${!value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
              `}
            >
              <span className="text-gray-500 italic">Aucun gestionnaire</span>
            </button>

            {/* Options utilisateurs */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelect(user._id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    ${value === user._id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  {renderUserOption(user)}
                </button>
              ))
            ) : searchTerm ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Aucun utilisateur trouvé pour "{searchTerm}"
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Aucun utilisateur disponible
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;