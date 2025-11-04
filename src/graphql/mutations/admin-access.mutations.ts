import { gql } from '@apollo/client';

export const VALIDATE_ADMIN_TOKEN = gql`
  query ValidateAdminToken($token: String!) {
    validateAdminToken(input: { token: $token }) {
      isValid
      message
      expiresAt
    }
  }
`;

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($token: String!, $email: String!, $password: String!) {
    adminLogin(input: { token: $token, email: $email, password: $password }) {
      accessToken
      adminAccessToken
      tokenExpiresAt
      user {
        id
        email
        fullName
        roles
        activeRole
      }
    }
  }
`;

export const IS_ADMIN_ACCESS_VALID = gql`
  query IsAdminAccessValid {
    isAdminAccessValid
  }
`;

export const REVOKE_ADMIN_TOKEN = gql`
  mutation RevokeAdminToken($token: String!) {
    revokeAdminToken(token: $token)
  }
`;

export const GET_ACTIVE_ADMIN_TOKENS = gql`
  query GetActiveAdminTokens {
    getActiveAdminTokens {
      token
      expiresAt
      isValid
    }
  }
`;
