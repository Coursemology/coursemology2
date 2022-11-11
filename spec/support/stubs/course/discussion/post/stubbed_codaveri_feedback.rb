# frozen_string_literal: true
module Course::Discussion::Post::StubbedCodaveriFeedback
  private

  def connect_to_codaveri(_payload)
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"OK","data":{}}')
  end
end

module Course::Discussion::Post::StubbedCodaveriFeedbackFailed
  private

  def connect_to_codaveri(_payload)
    Excon::Response.new(status: 200,
                        body: '{"success":false,"message":"Wrong API Key","error_code":null,"data":{}}')
  end
end
