# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::DuplicationJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    subject { Course::DuplicationJob }

    it 'can be queued' do
      expect { subject.perform_later(course, user) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'duplicates the course' do
      expect { subject.perform_now(course, user) }.
        to change { instance.courses.count }.by(1)
    end
  end
end
