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

export const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($input: GoogleLoginInput!) {
    googleLogin(input: $input) {
      access_token
      user {
        _id
        email
        fullName
        firstName
        lastName
        role
        roles
      }
      isNewUser
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
