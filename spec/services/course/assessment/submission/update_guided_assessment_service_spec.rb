# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::UpdateGuidedAssessmentService, type: :controller do
  controller(Course::Assessment::Submission::SubmissionsController) do
    def update
    end
  end
  let(:service) { Course::Assessment::Submission::UpdateGuidedAssessmentService.new(controller) }

  describe 'valid_for_grading?' do
    subject { service.send(:valid_for_grading?, nil) }

    it { is_expected.to be_truthy }
  end
end
