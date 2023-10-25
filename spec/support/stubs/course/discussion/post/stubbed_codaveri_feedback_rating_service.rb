# frozen_string_literal: true
module Course::Discussion::Post::StubbedCodaveriFeedbackRatingService
  def self.connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"OK","data":{}}')
  end
end

module Course::Discussion::Post::StubbedCodaveriFeedbackRatingServiceFailed
  def self.connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":false,"message":"Wrong API Key","error_code":null,"data":{}}')
  end
end
