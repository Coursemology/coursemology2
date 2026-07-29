# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ApplyVersionJob, type: :job do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:source_course) { create(:course) }
    let(:source_assessment) do
      create(:assessment, :with_mcq_question, course: source_course, title: 'Marketplace Lab')
    end
    let(:destination_course) { create(:course) }
    let!(:listing) do
      Course::Assessment::Marketplace::PublishService.publish(source_assessment, user)
    end
    let(:copy) do
      create(:assessment, :with_mcq_question, course: destination_course, title: 'My Local Title')
    end
    let!(:adoption) do
      create(:course_assessment_marketplace_adoption,
             listing: listing, destination_course: destination_course,
             duplicated_assessment: copy,
             adopted_version_at: listing.current_version.published_at)
    end

    before do
      source_assessment.update!(title: 'Marketplace Lab v2')
      Course::Assessment::Marketplace::PublishService.publish_new_version(listing.reload, user)
    end

    def run_and_capture
      job = described_class.new(copy, current_user: user)
      job.perform_now
      job.job
    end

    it 'replaces the content and redirects back to the same assessment' do
      job = run_and_capture

      expect(copy.reload.title).to eq('Marketplace Lab v2')
      expect(job.redirect_to).to include("/courses/#{destination_course.id}/assessments/#{copy.id}")
    end

    it 'reports the job as completed' do
      job = run_and_capture

      expect(job.status).to eq('completed')
    end

    it 'errors the job rather than raising when the listing serves nothing' do
      listing.update!(current_version: nil)

      job = run_and_capture

      expect(job.status).to eq('errored')
    end

    it 'errors instead of deleting work when a student attempt exists by execution time' do
      create(:submission, :attempting, assessment: copy,
                                       creator: create(:course_student, course: destination_course).user)

      job = run_and_capture

      expect(job.status).to eq('errored')
      expect(copy.reload.title).to eq('My Local Title')
      expect(copy.questions).not_to be_empty
    end
  end
end
