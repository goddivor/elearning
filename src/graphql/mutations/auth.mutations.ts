import { gql } from '@apollo/client';

export const SEND_REGISTER_OTP = gql`
  mutation SendRegisterOTP($input: SendRegisterOTPInput!) {
    sendRegisterOTP(input: $input) {
      message
      expiresAt
    }
  }
`;

export const VERIFY_REGISTER_OTP = gql`
  mutation VerifyRegisterOTP($input: VerifyRegisterOTPInput!) {
    verifyRegisterOTP(input: $input) {
      access_token
      user {
        _id
        email
        firstName
        lastName
        role
        roles
      }
    }
  }
`;

export const SEND_LOGIN_OTP = gql`
  mutation SendLoginOTP($input: SendLoginOTPInput!) {
    sendLoginOTP(input: $input) {
      message
      expiresAt
    }
  }
`;

export const VERIFY_LOGIN_OTP = gql`
  mutation VerifyLoginOTP($input: VerifyLoginOTPInput!) {
    verifyLoginOTP(input: $input) {
      access_token
      user {
        _id
        email
        firstName
        lastName
        role
        roles
      }
    }
  }
`;

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($token: String!) {
    loginWithGoogle(token: $token) {
      access_token
      user {
        _id
        email
        firstName
        lastName
        role
        roles
      }
    }
  }
`;

export const LOGIN_WITH_FACEBOOK = gql`
  mutation LoginWithFacebook($token: String!) {
    loginWithFacebook(token: $token) {
      access_token
      user {
        _id
        email
        firstName
        lastName
        role
        roles
      }
    }
  }
`;
