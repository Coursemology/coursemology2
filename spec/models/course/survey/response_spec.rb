# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Response do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:survey).inverse_of(:responses) }
  it { is_expected.to have_many(:answers).inverse_of(:response) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#submitted?' do
      subject { response.submitted? }

      context 'when response is not submitted' do
        let(:response) { create(:course_survey_response, course: course) }

        it { is_expected.to be_falsey }
      end

      context 'when response is submitted' do
        let(:response) { create(:course_survey_response, :submitted, course: course) }

        it { is_expected.to be_truthy }
      end
    end
  end
end
