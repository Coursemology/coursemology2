# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTime, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }
    let(:reference_time) { lesson_plan_item.default_reference_time }

    it { should belong_to(:reference_timeline).inverse_of(:reference_times).without_validating_presence }
    it { should belong_to(:lesson_plan_item).inverse_of(:reference_times).without_validating_presence }

    describe '#validations' do
      subject { reference_time }

      context 'when end_at is missing' do
        it 'is valid' do
          subject.assign_attributes(start_at: 2.days.from_now, end_at: nil)
          expect(subject).to be_valid
          expect(subject.errors[:start_at]).not_to be_present
        end
      end

      context 'when start_at is before end_at' do
        it 'is valid' do
          subject.assign_attributes(start_at: 2.days.from_now, end_at: 3.days.from_now)
          expect(subject).to be_valid
          expect(subject.errors[:start_at]).not_to be_present
        end
      end

      context 'when start_at is after end_at' do
        it 'is not valid' do
          subject.assign_attributes(start_at: 3.days.from_now, end_at: 2.days.from_now)
          expect(subject).not_to be_valid
          expect(subject.errors[:start_at]).to be_present
        end
      end

      context 'when is a reference time in a default timeline' do
        it 'cannot be destroyed' do
          expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
          expect(subject.destroyed?).to be_falsey
          expect(subject.errors.messages).to have_key(:reference_timeline)
        end
      end

      context 'when is a reference time in a non-default timeline' do
        let(:timeline) { create(:course_reference_timeline, course: course) }

        before { subject.update!(reference_timeline: timeline) }

        context 'when destroyed' do
          it 'can be destroyed' do
            expect { subject.destroy! }.not_to raise_error
            expect(subject.destroyed?).to be_truthy
            expect(subject.errors.messages).to be_empty
          end

          it 'is removed from the formerly assigned lesson plan item' do
            expect { subject.destroy! }.to change { lesson_plan_item.reference_times.size }.by(-1)
            expect(subject.destroyed?).to be_truthy
          end

          it 'is removed from its reference timeline' do
            expect { subject.destroy! }.to change { timeline.reference_times.size }.by(-1)
            expect(subject.destroyed?).to be_truthy
          end
        end
      end

      context 'when about to be assigned to a lesson plan item in a different course' do
        let(:other_course) { create(:course) }
        let(:other_item) { create(:course_lesson_plan_item, course: other_course) }

        it 'cannot be assigned' do
          time_course_id = subject.reference_timeline.course.id
          other_item_course_id = other_item.course.id
          expect(time_course_id).not_to eq(other_item_course_id)

          expect { subject.update!(lesson_plan_item: other_item) }.to raise_error(ActiveRecord::RecordInvalid)
          expect(subject.errors.messages).to have_key(:lesson_plan_item)

          expect(subject.reload.lesson_plan_item.id).to eq(lesson_plan_item.id)
        end
      end
    end

    describe '#reset_closing_reminders on assessment' do
      let(:assessment) { create(:assessment, end_at: 2.days.from_now) }

      with_active_job_queue_adapter(:test) do
        context 'when end_at is changed to the future' do
          it 'creates a closing reminder job' do
            old_closing_reminder_token = assessment.closing_reminder_token

            reference_time = assessment.reference_times.first
            reference_time.end_at = 3.days.from_now

            expect { reference_time.save }.to(
              have_enqueued_job(Course::Assessment::ClosingReminderJob).
              exactly(:once).
              with { |_, token| expect(token).not_to eq(old_closing_reminder_token) }
            )

            expect(assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
          end
        end

        context 'when end_at is changed to the past' do
          it 'does not create a closing reminder job, but updates the token' do
            old_closing_reminder_token = assessment.closing_reminder_token

            reference_time = assessment.reference_times.first
            reference_time.end_at = 20.hours.ago

            expect { reference_time.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)

            expect(assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
          end
        end

        context 'when end_at is changed to nil' do
          it 'does not create a closing reminder job, but updates the token' do
            old_closing_reminder_token = assessment.closing_reminder_token

            reference_time = assessment.reference_times.first
            reference_time.end_at = nil

            expect { reference_time.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)

            expect(assessment.reload.closing_reminder_token).not_to eq(old_closing_reminder_token)
          end
        end

        context 'when start_at is changed' do
          it 'does not create a closing reminder job' do
            reference_time = assessment.reference_times.first
            reference_time.start_at = 2.hours.from_now

            expect { reference_time.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)
          end
        end

        context 'when bonus_end_at is changed' do
          it 'does not create a closing reminder job' do
            reference_time = assessment.reference_times.first
            reference_time.bonus_end_at = 2.hours.from_now

            expect { reference_time.save }.not_to have_enqueued_job(Course::Assessment::ClosingReminderJob)
          end
        end
      end
    end
  end
end
