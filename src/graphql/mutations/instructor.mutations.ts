import { gql } from '@apollo/client';

export const APPLY_FOR_INSTRUCTOR = gql`
  mutation ApplyForInstructor($input: ApplyForInstructorInput!) {
    applyForInstructor(input: $input) {
      id
      userId
      status
      answers {
        teachingExperience
        teachingBackground
        subjectsToTeach
        communityBuildingIdeas
        aiToolsUsage
        motivation
        contentCreationExperience
        expertise
        certifications
        linkedinProfile
        portfolioUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const APPROVE_INSTRUCTOR_APPLICATION = gql`
  mutation ApproveInstructorApplication($applicationId: ID!) {
    approveInstructorApplication(applicationId: $applicationId) {
      id
      status
      reviewedAt
    }
  }
`;

export const REJECT_INSTRUCTOR_APPLICATION = gql`
  mutation RejectInstructorApplication($input: ReviewApplicationInput!) {
    rejectInstructorApplication(input: $input) {
      id
      status
      rejectionReason
      reviewedAt
    }
  }
`;
