# frozen_string_literal: true
module Ssid::ApiStubs # rubocop:disable Metrics/ModuleLength
  CREATE_FOLDER_SUCCESS = {
    status: 200,
    body: {
      payload: {
        data: {
          id: SecureRandom.uuid,
          name: 'Test Folder',
          parentId: nil,
          createdAt: Time.now.iso8601
        }
      },
      messages: []
    }.to_json
  }.freeze

  UPLOAD_ANSWERS_SUCCESS = {
    status: 204,
    body: nil
  }.freeze

  SEND_PLAGIARISM_CHECK_SUCCESS = {
    status: 202,
    body: nil
  }.freeze

  FETCH_PLAGIARISM_CHECK_SUCCESSFUL = {
    status: 200,
    body: {
      payload: {
        data: {
          status: 'successful'
        }
      }
    }.to_json
  }.freeze

  FETCH_SSID_SUBMISSIONS_SUCCESS = {
    status: 200,
    body: {
      payload: {
        data: [
          { id: SecureRandom.uuid, name: '1_student 1',
            createdAt: Time.now.iso8601, updatedAt: Time.now.iso8601 },
          { id: SecureRandom.uuid, name: '2_student 2',
            createdAt: Time.now.iso8601, updatedAt: Time.now.iso8601 }
        ]
      }
    }.to_json
  }.freeze

  FETCH_SSID_SUBMISSION_PAIR_DATA_SUCCESS = {
    status: 200,
    body: {
      payload: {
        data: {
          language: 'javascript',
          submissionPairs: [
            {
              id: SecureRandom.uuid,
              baseSubmission: SecureRandom.uuid,
              comparedSubmission: SecureRandom.uuid,
              similarityScore: 0.5846153846153846
            }
          ],
          ranAt: Time.now.iso8601,
          completedAt: Time.now.iso8601,
          statistics: {
            total: 12,
            bins: [
              6,
              0,
              0,
              0,
              0,
              0,
              1,
              0,
              1,
              3,
              0,
              1,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          }
        }
      }
    }.to_json
  }.freeze

  DOWNLOAD_SUBMISSION_PAIR_RESULT_SUCCESS = {
    status: 200,
    body: {
      message: '<html><body>Report content</body></html>'
    }.to_json
  }.freeze

  CREATE_SHARED_RESOURCE_LINK_SUCCESS = {
    status: 201,
    body: {
      payload: {
        data: {
          resourceType: 'submission_pair',
          resourceId: SecureRandom.uuid,
          sharedUrl: 'https://ssid.comp.nus.edu.sg/shared-urls/-o3Gs5JjySuiKWeIxo4Q4sVYesw0E_he_LH__MK-440',
          expiresAt: Time.now.iso8601
        }
      }
    }.to_json
  }.freeze
end
