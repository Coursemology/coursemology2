import { defineMessages } from 'react-intl';

export default defineMessages({
  ragWiseSettings: {
    id: 'course.admin.RagWiseSettings.ragWiseSettings',
    defaultMessage: 'RagWise settings',
  },
  ragWiseSettingsSubtitle: {
    id: 'course.admin.RagWiseSettings.ragWiseSettingsSubtitle',
    defaultMessage:
      "This is currently an experimental feature.\
      RagWise uses Retrieval-Augmented Generation to generate contextually\
      aware responses to student's query on forum.",
  },
  responseWorkflowTitle: {
    id: 'course.admin.RagWiseSettings.responseWorkflowTitle',
    defaultMessage: 'Automatic Forum Response',
  },
  responseWorkflowDescription: {
    id: 'course.admin.RagWiseSettings.responseWorkflowDescription',
    defaultMessage: 'When students post a question on forum,',
  },
  responseWorkflowHighTrust: {
    id: 'course.admin.RagWiseSettings.responseWorkflowHighTrust',
    defaultMessage: 'High trust',
  },
  responseWorkflowLowTrust: {
    id: 'course.admin.RagWiseSettings.responseWorkflowLowTrust',
    defaultMessage: 'Low trust',
  },
  responseWorkflowTrustDescription: {
    id: 'course.admin.RagWiseSettings.responseWorkflowLowTrustDescription',
    defaultMessage:
      'Generated response will be conditionally published with {trust}% trust.',
  },
  responseWorkflowDraft: {
    id: 'course.admin.RagWiseSettings.responseWorkflowDraft',
    defaultMessage: 'Always draft',
  },
  responseWorkflowDraftDescription: {
    id: 'course.admin.RagWiseSettings.responseWorkflowDraftDescription',
    defaultMessage: 'Generated response will be drafted.',
  },
  responseWorkflowPublish: {
    id: 'course.admin.RagWiseSettings.responseWorkflowPublish',
    defaultMessage: 'Always publish',
  },
  responseWorkflowPublishDescription: {
    id: 'course.admin.RagWiseSettings.responseWorkflowPublishDescription',
    defaultMessage: 'Generated response will be immediately published.',
  },
  responseWorkflowNoAuto: {
    id: 'course.admin.RagWiseSettings.responseWorkflowNoAuto',
    defaultMessage: 'Do not automatically respond',
  },
  responseWorkflowAuto: {
    id: 'course.admin.RagWiseSettings.responseWorkflowAuto',
    defaultMessage: 'Automatically respond',
  },
  roleplayTitle: {
    id: 'course.admin.RagWiseSettings.roleplayTitle',
    defaultMessage: 'Response Roleplay',
  },
  roleplaySubtitle: {
    id: 'course.admin.RagWiseSettings.roleplaySubtitle',
    defaultMessage: 'Character that LLM will roleplay as in responses.',
  },
  roleplayDescription: {
    id: 'course.admin.RagWiseSettings.roleplayDescription',
    defaultMessage: 'Customise character prompt to change how LLM response',
  },
  roleplayCharacter: {
    id: 'course.admin.RagWiseSettings.roleplayCharacter',
    defaultMessage: 'Specified Character Prompt',
  },
  roleplayCharacterLabel: {
    id: 'course.admin.RagWiseSettings.roleplayCharacterLabel',
    defaultMessage: 'Character prompt (Max 200 Characters)',
  },
  roleplayNormalLabel: {
    id: 'course.admin.RagWiseSettings.roleplayNormalLabel',
    defaultMessage: 'No roleplay',
  },
  roleplayDeadpoolLabel: {
    id: 'course.admin.RagWiseSettings.roleplayDeadpoolLabel',
    defaultMessage: 'Deadpool',
  },
  roleplayYodaLabel: {
    id: 'course.admin.RagWiseSettings.roleplayYodaLabel',
    defaultMessage: 'Master Yoda',
  },
  roleplayDeadpool: {
    id: 'course.admin.RagWiseSettings.roleplayDeadpool',
    defaultMessage:
      'You must always impersonate Deadpool character in all your responses.',
  },
  roleplayNormal: {
    id: 'course.admin.RagWiseSettings.roleplayNormal',
    defaultMessage: ' ',
  },
  roleplayYoda: {
    id: 'course.admin.RagWiseSettings.roleplayYoda',
    defaultMessage:
      'You must always impersonate Master Yoda character in all your responses.',
  },
  materialsSectionTitle: {
    id: 'course.admin.RagWiseSettings.materialsSectionTitle',
    defaultMessage: 'Materials',
  },
  materialsSectionSubtitle: {
    id: 'course.admin.RagWiseSettings.materialsSectionSubtitle',
    defaultMessage:
      'Add/remove pdf/txt files in knowledge base, allowing users to\
      control its availability to the LLM for generating responses.',
  },
  knowledgeBaseStatusSettings: {
    id: 'course.admin.RagWiseSettings.knowledgeBaseStatusSettings',
    defaultMessage: 'Knowledge Base',
  },
  expandAll: {
    id: 'course.admin.RagWiseSettings.expandAll',
    defaultMessage: 'Expand all {object}',
  },
  forumSectionTitle: {
    id: 'course.admin.RagWiseSettings.forumSectionTitle',
    defaultMessage: 'Forums',
  },
  forumSectionSubtitle: {
    id: 'course.admin.RagWiseSettings.forumSectionSubtitle',
    defaultMessage:
      'Manage the inclusion or exclusion of forum data from related courses\
      in the knowledge base, allowing users to control its availability to the LLM for generating responses.',
  },
  noRelatedCourses: {
    id: 'course.admin.RagWiseSettings.forumSectionTitle',
    defaultMessage: 'No related courses found.',
  },
});
