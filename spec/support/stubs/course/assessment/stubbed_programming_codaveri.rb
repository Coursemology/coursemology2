# rubocop: disable Layout/LineEndStringConcatenationIndentation, Layout/SpaceAroundOperators, Style/StringConcatenation
# frozen_string_literal: true
module Course::Assessment::StubbedProgrammingCodaveriEvaluationService
  private

  def connect_to_codaveri
    ids = test_cases_id_from_factory.map(&:to_s)
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"Evaluation Successful",'\
                              '"data":{"evaluation_results":'\
                              '[{"run":{"stdout":"\'GCAUUU\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'GCAUUU\'\n","success":1},"id":"' + ids[0] +'"},'\
                              '{"run":{"stdout":"\'GCAUUU\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'GCAUUU\'\n","success":1},"id":"' + ids[1] +'"},'\
                              '{"run":{"stdout":"True\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"True\n","success":1},"id":"' + ids[2] +'"},'\
                              '{"run":{"stdout":"True\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"True\n","success":1},"id":"' + ids[3] +'"},'\
                              '{"run":{"stdout":"False\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"False\n","success":1},"id":"' + ids[4] +'"},'\
                              '{"run":{"stdout":"\'rna\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'rna\'\n","success":1},"id":"' + ids[5] +'"},'\
                              '{"run":{"stdout":"\'dna\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'dna\'\n","success":1},"id":"' + ids[6] +'"}]}}')
  end

  def test_cases_id_from_factory
    Course::Assessment::Question::Programming.last.test_cases.pluck(:id)
  end
end

module Course::Assessment::StubbedProgrammingCodaveriEvaluationServiceFailed
  private

  def connect_to_codaveri
    Excon::Response.new(status: 200,
                        body: '{"success":false,"message":"Wrong API Key","error_code":null,"data":{}}')
  end
end

module Course::Assessment::StubbedProgrammingCodaveriEvaluationServiceWrongAnswer
  private

  def connect_to_codaveri
    ids = test_cases_id_from_factory.map(&:to_s)
    Excon::Response.new(status: 200,
                        body: '{"success":true,"message":"Evaluation Successful",'\
                              '"data":{"evaluation_results":'\
                              '[{"run":{"stdout":"\'GCAUUA\'\n","stderr":"","code":1,"signal":null,'\
                              '"stdin":"","display":"\'GCAUUA\'\n","success":0},"id":"' + ids[0] +'"},'\
                              '{"run":{"stdout":"\'GCAUUU\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'GCAUUU\'\n","success":1},"id":"' + ids[1] +'"},'\
                              '{"run":{"stdout":"True\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"True\n","success":1},"id":"' + ids[2] +'"},'\
                              '{"run":{"stdout":"True\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"True\n","success":1},"id":"' + ids[3] +'"},'\
                              '{"run":{"stdout":"False\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"False\n","success":1},"id":"' + ids[4] +'"},'\
                              '{"run":{"stdout":"\'rna\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'rna\'\n","success":1},"id":"' + ids[5] +'"},'\
                              '{"run":{"stdout":"\'dna\'\n","stderr":"","code":0,"signal":null,'\
                              '"stdin":"","display":"\'dna\'\n","success":1},"id":"' + ids[6] +'"}]}}')
  end

  def test_cases_id_from_factory
    Course::Assessment::Question::Programming.last.test_cases.pluck(:id)
  end
end

# rubocop: enable Layout/LineEndStringConcatenationIndentation, Layout/SpaceAroundOperators, Style/StringConcatenation
