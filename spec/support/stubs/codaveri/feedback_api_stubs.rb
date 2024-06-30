# frozen_string_literal: true
module Codaveri::FeedbackApiStubs
  # TODO: update this fixture when name coercion logic is removed
  FEEDBACK_SUCCESS_FINAL_RESULT = {
    status: 200,
    body: {
      success: true,
      message: 'Feedback successfully generated',
      data: {
        feedbackFiles: [
          {
            path: 'main.py',
            feedbackLines: [
              {
                id: '6311a0548c57aae93d260927:main.py:63141b108c57aae93d260a00',
                linenum: 5,
                feedback: 'This is a test feedback',
                category: 'syntax',
                isVerified: false
              }
            ]
          }
        ]
      }
    }.to_json
  }.freeze

  FEEDBACK_ID_CREATED = {
    status: 201,
    body: {
      success: true,
      message: 'Feedback request received',
      data: {
        id: '6659878d3ad73c7a4aac96f0'
      },
      transactionId: '66598c55fac28dd29e968853'
    }.to_json
  }.freeze

  FEEDBACK_RESULTS_PENDING = {
    status: 202,
    body: {
      success: true,
      message: 'Feedback results not ready yet',
      data: {},
      transactionId: '6659878d3ad73c7a4aac96f0'
    }.to_json
  }.freeze

  FEEDBACK_FAILURE_FINAL_RESULT = {
    status: 400,
    body: {
      success: false,
      message: 'Invalid request body: files.path should be of type string, files.path cannot be empty',
      errorCode: '12',
      data: {},
      transactionId: '65ffe266da218685032675da'
    }.to_json
  }.freeze
end
