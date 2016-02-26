# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingFileAnnotation do
  it { is_expected.to act_as(Course::Discussion::Topic) }
  it 'belongs to a file' do
    expect(subject).to belong_to(:file).
      class_name(Course::Assessment::Answer::ProgrammingFile.name)
  end
end
