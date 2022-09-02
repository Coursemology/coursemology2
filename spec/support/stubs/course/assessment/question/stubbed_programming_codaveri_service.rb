# frozen_string_literal: true
module Course::Assessment::Question::StubbedProgrammingCodaveriService
  private

  def connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"Problem successfully created",'\
                              '"data":{"problem_id":"6311a0548c57aae93d260927"}}')
  end
end

module Course::Assessment::Question::StubbedProgrammingCodaveriServiceFailed
  private

  def connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":false,"message":"Wrong API Key","error_code":null,"data":{}}')
  end
end

Course::Assessment::Question::ProgrammingCodaveriService.class_eval do
  prepend Course::Assessment::Question::StubbedProgrammingCodaveriService
end
