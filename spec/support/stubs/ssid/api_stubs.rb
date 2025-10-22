# frozen_string_literal: true
module Ssid::ApiStubs # rubocop:disable Metrics/ModuleLength
  CREATE_FOLDER_SUCCESS = {
    status: 200,
    body: {
      payload: {
        data: {
          id: '185ek301-eecb-44ce-838e-bf1234f990e1',
          name: 'Test Folder',
          parentId: nil,
          createdAt: '2025-07-31T18:23:24.341104+08:00'
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
          { id: '185ek301-eecb-44ce-838e-bf1234f990e1', name: '1_student 1',
            createdAt: '2025-07-31T18:23:24.341104+08:00', updatedAt: '2025-07-31T18:23:24.341104+08:00' },
          { id: '185ek301-ffcb-44ce-838e-bf9876f110f2', name: '2_student 2',
            createdAt: '2025-07-31T18:23:24.341104+08:00', updatedAt: '2025-07-31T18:23:24.341104+08:00' }
        ]
      }
    }.to_json
  }.freeze

  FETCH_SSID_SUBMISSION_PAIR_DATA_SUCCESS = {
    status: 200,
    body: {
      payload: {
        data: [
          {
            id: '185ek301-eecb-44ce-838e-bf1234f990e1',
            baseSubmission: '185ek301-eecb-44ce-838e-bf1234f990e1',
            comparedSubmission: '185ek301-eecb-44ce-838e-bf1234f990e1',
            similarityScore: 0.5846153846153846
          }
        ]
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
          resourceId: '185ek301-eecb-44ce-838e-bf1234f990e1',
          sharedUrl: 'https://ssid.comp.nus.edu.sg/shared-urls/-o3Gs5JjySuiKWeIxo4Q4sVYesw0E_he_LH__MK-440',
          expiresAt: '2025-07-31T18:23:24.341104+08:00'
        }
      }
    }.to_json
  }.freeze
end
