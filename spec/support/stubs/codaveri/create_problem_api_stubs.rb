# frozen_string_literal: true
module Codaveri::CreateProblemApiStubs
  CREATE_PROBLEM_SUCCESS = {
    status: 200,
    body: {
      success: true,
      message: 'Problem successfully created',
      data: { id: '6311a0548c57aae93d260927' },
      transactionId: '66594d3fb2c16562e902de48'
    }.to_json
  }.freeze

  CREATE_PROBLEM_FAILURE = {
    status: 500,
    body: {
      success: false,
      message: 'Problem could not be created',
      errorCode: '-1',
      data: {},
      transactionId: '65ffe266da218685032675da'
    }.to_json
  }.freeze
end
