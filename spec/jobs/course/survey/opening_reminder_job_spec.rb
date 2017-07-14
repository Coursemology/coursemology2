# frozen_string_literal: true
RSpec.describe Course::Survey::OpeningReminderJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:survey) { create(:survey, start_at: old_start_at) }
    let(:time_now) { Time.zone.now }
    before { survey.start_at = new_start_at }
    subject { survey.save }

    context 'when old start_at is in the past' do
      let(:old_start_at) { time_now - 2.days }

      context 'when new start_at is in the future' do
        let(:new_start_at) { time_now + 3.days }
        it { expect { subject }.to have_enqueued_job(Course::Survey::OpeningReminderJob) }
      end

      context 'when new start_at is in the past' do
        let(:new_start_at) { time_now - 3.days }
        it { expect { subject }.not_to have_enqueued_job(Course::Survey::OpeningReminderJob) }
      end
    end

    context 'when old start_at is in the future' do
      let(:old_start_at) { time_now + 2.days }

      context 'when new start_at is in the future' do
        let(:new_start_at) { time_now + 3.days }
        it { expect { subject }.to have_enqueued_job(Course::Survey::OpeningReminderJob) }
      end

      context 'when new start_at is in the past' do
        let(:new_start_at) { time_now - 2.days }
        it { expect { subject }.to have_enqueued_job(Course::Survey::OpeningReminderJob) }
      end
    end
  end
end
