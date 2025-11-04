import { gql } from '@apollo/client';

export const GET_MY_INSTRUCTOR_APPLICATION = gql`
  query MyInstructorApplication {
    myInstructorApplication {
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
      reviewedBy
      reviewedAt
      reviewNotes
      rejectionReason
      autoApproved
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_INSTRUCTOR_APPLICATIONS = gql`
  query InstructorApplications($status: ApplicationStatus) {
    instructorApplications(status: $status) {
      id
      userId
      status
      answers {
        teachingExperience
        subjectsToTeach
        motivation
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INSTRUCTOR_APPLICATION_BY_ID = gql`
  query InstructorApplication($id: ID!) {
    instructorApplication(id: $id) {
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
      reviewedBy
      reviewedAt
      reviewNotes
      rejectionReason
      autoApproved
      createdAt
      updatedAt
    }
  }
`;
