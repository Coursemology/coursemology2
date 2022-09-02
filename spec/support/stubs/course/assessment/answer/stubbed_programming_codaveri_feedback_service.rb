# frozen_string_literal: true
module Course::Assessment::Answer::StubbedProgrammingCodaveriFeedbackService
  private

  def connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"Feedback successfully generated",'\
                              '"data":{"feedback_files":'\
                              '[{"path":"template.py", '\
                              '"feedback_lines":[{"linenum":5, '\
                              '"feedback":"This is a test feedback", "repairType":"replace", '\
                              '"originalLine":"return x - 1;", "repairedLine":"return x;", '\
                              '"feedback_id":"63141b108c57aae93d260a00"}]}]}}')
  end
end

module Course::Assessment::Answer::StubbedProgrammingCodaveriFeedbackServiceFailed
  private

  def connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":false,"message":"Wrong API Key","error_code":null,"data":{}}')
  end
end
