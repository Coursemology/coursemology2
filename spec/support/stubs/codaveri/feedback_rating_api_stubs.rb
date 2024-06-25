# frozen_string_literal: true
module Codaveri::FeedbackRatingApiStubs
  FEEDBACK_RATING_SUCCESS = {
    status: 200,
    body: {
      success: true,
      message: 'Rating successfully submitted',
      data: {},
      transactionId: '665992a3efbf5b28d69e8445'
    }.to_json
  }.freeze

  FEEDBACK_RATING_FAILURE = {
    status: 400,
    body: {
      success: false,
      message: 'Request body invalid: rating should be of type integer',
      errorCode: 12,
      data: {},
      transactionId: '665992a3efbf5b28d69e8445'
    }.to_json
  }.freeze
end
