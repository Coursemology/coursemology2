# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ClosingReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:now) { Time.zone.now }

    let(:user) { create(:course_user).user }
    let(:assessment) { create(:assessment) }
    subject { Course::Assessment::ClosingReminderJob }

    it 'can be queued' do
      expect { subject.perform_later(user, assessment, now.to_i) }.
        to have_enqueued_job(subject).exactly(:once)
    end
  end
end
