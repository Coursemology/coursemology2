# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::CodaveriImportJob do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Course::Assessment::Question::CodaveriImportJob }
    let(:question) { create(:course_assessment_question_programming, :auto_gradable, is_codaveri: true) }
    let(:pushed_package_ids) { [] }

    before do
      # Records which package is pushed; what Codaveri does with it is not at issue here.
      pushed = pushed_package_ids
      allow(Course::Assessment::Question::ProgrammingCodaveriService).
        to receive(:create_or_update_question) do |pushed_question, package|
        pushed << package.attachment_id
        pushed_question.update!(is_synced_with_codaveri: true)
      end
    end

    # The package it was queued with may be older than one an import has pushed since.
    it "pushes the question's current package, not the one it was queued with", :sidekiq_same_thread do
      path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
      queued_with = create(:attachment_reference, binary: true, file_path: path)
      perform_sidekiq_jobs { subject.perform_later(question, queued_with) }

      expect(pushed_package_ids).to eq([question.attachment.attachment_id])
      expect(question.reload).to be_is_synced_with_codaveri
    end
  end
end
